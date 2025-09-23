// Simple repository with minimal data transformation
// Direct database interaction - no complex serialization layers

import type { SupabaseClient } from '@supabase/supabase-js'
import { SimpleQuiz, SimpleQuestion, SimpleSection, validateBasic, safeDisplayText } from './simple-types'

export class SimpleQuizRepository {
  constructor(private supabase: SupabaseClient) {}

  // Get quiz with simple error handling
  async getQuiz(id: string): Promise<SimpleQuiz | null> {
    try {
      const { data, error } = await this.supabase
        .from('quizzes')
        .select(`
          *,
          questions(*),
          sections:quiz_sections(*, questions(*))
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.warn('Quiz fetch error:', error.message)
        return null
      }

      // Simple data normalization - just ensure fields exist
      return this.normalizeQuizData(data)
    } catch (error) {
      console.error('Unexpected error fetching quiz:', error)
      return null
    }
  }

  // Save quiz with minimal validation
  async saveQuiz(quizId: string, quizData: any): Promise<SimpleQuiz | null> {
    try {
      // Only basic validation
      const validation = validateBasic(quizData)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      // Direct database update - let Supabase handle JSON fields
      const { questions, sections, ...quizFields } = quizData

      // Update quiz
      const { error: quizError } = await this.supabase
        .from('quizzes')
        .update({
          title: quizFields.title,
          description: quizFields.description,
          settings: quizFields.settings || {},
          published: Boolean(quizFields.published)
        })
        .eq('id', quizId)

      if (quizError) {
        throw new Error(`Quiz update failed: ${quizError.message}`)
      }

      // Simple question handling - delete and recreate
      if (questions && Array.isArray(questions)) {
        // Delete existing questions
        await this.supabase
          .from('questions')
          .delete()
          .eq('quiz_id', quizId)

        // Insert new questions if any exist
        if (questions.length > 0) {
          const questionsToInsert = questions.map((q: any, index: number) => ({
            quiz_id: quizId,
            section_id: q.section_id || null,
            question_text: q.question_text || '',
            question_type: q.question_type || 'multiple_choice',
            question_content: q.question_content || {},
            options: q.options || {},
            answer_data: q.answer_data || {},
            order_index: q.order_index !== undefined ? q.order_index : index
          }))

          const { error: questionsError } = await this.supabase
            .from('questions')
            .insert(questionsToInsert)

          if (questionsError) {
            console.warn('Questions insert warning:', questionsError.message)
            // Don't fail the entire save for question issues
          }
        }
      }

      // Return the updated quiz
      return this.getQuiz(quizId)
    } catch (error) {
      console.error('Quiz save error:', error)
      throw error
    }
  }

  // Simple data normalization
  private normalizeQuizData(rawData: any): SimpleQuiz {
    return {
      id: rawData.id,
      title: rawData.title || 'Untitled Quiz',
      description: rawData.description || '',
      category_id: rawData.category_id,
      settings: this.safeParseJSON(rawData.settings) || {},
      published: Boolean(rawData.published),
      questions: this.normalizeQuestions(rawData.questions || []),
      sections: this.normalizeSections(rawData.sections || []),
      created_at: rawData.created_at,
      updated_at: rawData.updated_at
    }
  }

  private normalizeQuestions(questions: any[]): SimpleQuestion[] {
    return questions.map((q, index) => ({
      id: q.id,
      section_id: q.section_id,
      question_text: q.question_text || '',
      question_type: q.question_type || 'multiple_choice',
      options: this.safeParseJSON(q.options) || {},
      answer_data: this.safeParseJSON(q.answer_data) || {},
      order_index: q.order_index !== undefined ? q.order_index : index,
      created_at: q.created_at,
      updated_at: q.updated_at
    }))
  }

  private normalizeSections(sections: any[]): SimpleSection[] {
    return sections.map((s, index) => ({
      id: s.id,
      quiz_id: s.quiz_id,
      title: s.title || 'Untitled Section',
      description: s.description,
      order_index: s.order_index !== undefined ? s.order_index : index,
      settings: this.safeParseJSON(s.settings) || {},
      questions: this.normalizeQuestions(s.questions || []),
      created_at: s.created_at,
      updated_at: s.updated_at
    }))
  }

  // Safe JSON parsing - no throwing errors
  private safeParseJSON(value: any): any {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return {}
      }
    }
    if (value && typeof value === 'object') {
      return value
    }
    return {}
  }
}

// Simple markdown to quiz conversion (no complex parsing)
export function markdownToSimpleQuiz(markdown: string): SimpleQuiz {
  const lines = markdown.split('\n')

  const quiz: SimpleQuiz = {
    title: 'New Quiz',
    description: '',
    settings: { structure_type: 'mixed' },
    published: false,
    questions: [],
    sections: []
  }

  let currentQuestion: Partial<SimpleQuestion> | null = null
  let questionIndex = 0

  for (const line of lines) {
    const trimmed = line.trim()

    // Title
    if (trimmed.startsWith('# ') && !quiz.title) {
      quiz.title = trimmed.substring(2).trim()
      continue
    }

    // Question header
    if (trimmed.match(/^##?\s+(Q\d+|Question)/)) {
      // Save previous question
      if (currentQuestion?.question_text) {
        quiz.questions.push({
          question_text: currentQuestion.question_text,
          question_type: currentQuestion.question_type || 'multiple_choice',
          options: currentQuestion.options || {},
          answer_data: currentQuestion.answer_data || {},
          order_index: questionIndex++
        } as SimpleQuestion)
      }

      // Start new question
      currentQuestion = {
        question_text: '',
        question_type: 'multiple_choice',
        options: {},
        answer_data: {}
      }
      continue
    }

    // Question text (first line after header)
    if (currentQuestion && !currentQuestion.question_text && trimmed && !trimmed.startsWith('-')) {
      currentQuestion.question_text = trimmed
      continue
    }

    // Multiple choice options
    if (currentQuestion && trimmed.match(/^-\s*\[(x| )\]/)) {
      const isCorrect = trimmed.includes('[x]')
      const optionText = trimmed.replace(/^-\s*\[(x| )\]/, '').trim()

      const options = currentQuestion.options as any
      if (!options.choices) options.choices = []

      const optionId = options.choices.length
      options.choices.push({ id: optionId, text: optionText })

      if (isCorrect) {
        options.correct_index = optionId
      }
      continue
    }

    // True/False
    if (currentQuestion && trimmed.match(/^(True|False):/)) {
      const isTrue = trimmed.startsWith('True:')
      const explanation = trimmed.substring(trimmed.indexOf(':') + 1).trim()

      currentQuestion.question_type = 'true_false'
      currentQuestion.answer_data = {
        correct_answer: isTrue,
        explanation
      }
      continue
    }

    // Text input
    if (currentQuestion && trimmed.startsWith('Answer:')) {
      const answer = trimmed.substring(7).trim()
      currentQuestion.question_type = 'text_input'
      currentQuestion.answer_data = {
        correct_answer: answer
      }
      continue
    }
  }

  // Save last question
  if (currentQuestion?.question_text) {
    quiz.questions.push({
      question_text: currentQuestion.question_text,
      question_type: currentQuestion.question_type || 'multiple_choice',
      options: currentQuestion.options || {},
      answer_data: currentQuestion.answer_data || {},
      order_index: questionIndex++
    } as SimpleQuestion)
  }

  return quiz
}

// Simple quiz to markdown conversion
export function simpleQuizToMarkdown(quiz: SimpleQuiz): string {
  let markdown = `# ${quiz.title}\n\n`

  if (quiz.description) {
    markdown += `${quiz.description}\n\n`
  }

  quiz.questions.forEach((question, index) => {
    markdown += `## Q${index + 1}\n${question.question_text}\n\n`

    if (question.question_type === 'multiple_choice') {
      const choices = (question.options as any)?.choices || []
      const correctIndex = (question.options as any)?.correct_index || 0

      choices.forEach((choice: any, choiceIndex: number) => {
        const mark = choiceIndex === correctIndex ? 'x' : ' '
        const text = choice?.text || choice
        markdown += `- [${mark}] ${text}\n`
      })
    } else if (question.question_type === 'true_false') {
      const correctAnswer = (question.answer_data as any)?.correct_answer
      const explanation = (question.answer_data as any)?.explanation || ''
      const answer = correctAnswer ? 'True' : 'False'
      markdown += `${answer}: ${explanation}\n`
    } else if (question.question_type === 'text_input') {
      const answer = (question.answer_data as any)?.correct_answer || ''
      markdown += `Answer: ${answer}\n`
    }

    markdown += '\n'
  })

  return markdown
}