// Markdown transformation utilities for existing quiz schema
// Bidirectional conversion between structured quiz data and markdown format

import type { Quiz, Question, QuestionType } from '@/types/quiz.types'

/**
 * Transform structured quiz data to markdown format
 */
export function transformToMarkdown(quiz: Quiz): string {
  const lines: string[] = []
  
  // Quiz header with metadata
  lines.push('---')
  lines.push(`title: "${quiz.title}"`)
  if (quiz.description) {
    lines.push(`description: "${quiz.description}"`)
  }
  if (quiz.category?.name) {
    lines.push(`category: "${quiz.category.name}"`)
  }
  lines.push(`published: ${quiz.published}`)
  
  // Settings section
  if (quiz.settings && Object.keys(quiz.settings).length > 0) {
    lines.push('settings:')
    if (quiz.settings.time_limit) {
      lines.push(`  time_limit: ${quiz.settings.time_limit}`)
    }
    if (quiz.settings.randomize_questions !== undefined) {
      lines.push(`  randomize_questions: ${quiz.settings.randomize_questions}`)
    }
    if (quiz.settings.show_feedback !== undefined) {
      lines.push(`  show_feedback: ${quiz.settings.show_feedback}`)
    }
    if (quiz.settings.passing_score) {
      lines.push(`  passing_score: ${quiz.settings.passing_score}`)
    }
  }
  
  lines.push('---')
  lines.push('')
  
  // Quiz title as H1
  lines.push(`# ${quiz.title}`)
  lines.push('')
  
  if (quiz.description) {
    lines.push(quiz.description)
    lines.push('')
  }
  
  // Questions
  if (quiz.questions && quiz.questions.length > 0) {
    const sortedQuestions = [...quiz.questions].sort((a, b) => a.order_index - b.order_index)
    
    sortedQuestions.forEach((question, index) => {
      lines.push(`## Question ${index + 1}`)
      lines.push('')
      lines.push(question.question_text)
      lines.push('')
      
      // Add question-specific content
      if (question.question_content.additional_context) {
        lines.push(question.question_content.additional_context)
        lines.push('')
      }
      
      // Handle different question types
      switch (question.question_type) {
        case 'multiple_choice':
          if (question.options.choices && Array.isArray(question.options.choices)) {
            question.options.choices.forEach((choice, choiceIndex) => {
              const isCorrect = question.options.correct_index === choiceIndex
              const marker = isCorrect ? '✓' : ' '
              lines.push(`${String.fromCharCode(65 + choiceIndex)}) ${choice} ${marker}`)
            })
          }
          break
          
        case 'true_false':
          const correctAnswer = question.answer_data.correct_answer
          lines.push(`True ${correctAnswer === 'true' || correctAnswer === true ? '✓' : ' '}`)
          lines.push(`False ${correctAnswer === 'false' || correctAnswer === false ? '✓' : ' '}`)
          break
          
        case 'text_input':
          lines.push(`**Answer:** ${question.answer_data.correct_answer}`)
          break
      }
      
      lines.push('')
      
      // Add explanation if present
      if (question.answer_data.explanation) {
        lines.push(`**Explanation:** ${question.answer_data.explanation}`)
        lines.push('')
      }
      
      // Add separator between questions
      if (index < sortedQuestions.length - 1) {
        lines.push('---')
        lines.push('')
      }
    })
  }
  
  return lines.join('\n')
}

/**
 * Parse markdown content back to structured quiz data
 */
export function parseMarkdownToQuiz(markdown: string): Partial<Quiz> {
  const lines = markdown.split('\n')
  
  // Parse frontmatter
  let frontmatterEnd = -1
  let inFrontmatter = false
  const frontmatter: Record<string, any> = {}
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true
      } else {
        frontmatterEnd = i
        break
      }
    } else if (inFrontmatter) {
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim()
        let value = line.substring(colonIndex + 1).trim()
        
        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        
        // Handle nested settings
        if (key === 'settings') continue
        if (line.startsWith('  ') && key.length > 0) {
          if (!frontmatter.settings) frontmatter.settings = {}
          const settingKey = key
          let settingValue: any = value
          if (settingValue === 'true') settingValue = true
          if (settingValue === 'false') settingValue = false
          if (!isNaN(Number(settingValue))) settingValue = Number(settingValue)
          frontmatter.settings[settingKey] = settingValue
        } else {
          if (value === 'true') frontmatter[key] = true
          else if (value === 'false') frontmatter[key] = false
          else if (!isNaN(Number(value))) frontmatter[key] = Number(value)
          else frontmatter[key] = value
        }
      }
    }
  }
  
  // Parse content after frontmatter
  const contentLines = frontmatterEnd > 0 ? lines.slice(frontmatterEnd + 1) : lines
  const questions: Omit<Question, 'id' | 'quiz_id' | 'created_at' | 'updated_at'>[] = []
  
  let currentQuestion: any = null
  let questionIndex = 0
  
  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i].trim()
    
    // Question header
    if (line.match(/^## Question \d+/)) {
      if (currentQuestion) {
        questions.push({
          ...currentQuestion,
          order_index: questionIndex++
        })
      }
      currentQuestion = {
        question_text: '',
        question_type: 'multiple_choice' as QuestionType,
        question_content: {},
        options: {},
        answer_data: {}
      }
      continue
    }
    
    if (!currentQuestion) continue
    
    // Question text (first non-empty line after question header)
    if (!currentQuestion.question_text && line && !line.startsWith('#')) {
      currentQuestion.question_text = line
      continue
    }
    
    // Multiple choice options
    const mcMatch = line.match(/^([A-Z])\)\s*(.+?)\s*(✓?)$/)
    if (mcMatch) {
      if (!currentQuestion.options.choices) currentQuestion.options.choices = []
      currentQuestion.options.choices.push(mcMatch[2])
      if (mcMatch[3] === '✓') {
        currentQuestion.options.correct_index = currentQuestion.options.choices.length - 1
        currentQuestion.answer_data.correct_answer = mcMatch[2]
      }
      currentQuestion.question_type = 'multiple_choice'
      continue
    }
    
    // True/False options
    const tfMatch = line.match(/^(True|False)\s*(✓?)$/)
    if (tfMatch) {
      if (tfMatch[2] === '✓') {
        currentQuestion.answer_data.correct_answer = tfMatch[1].toLowerCase()
      }
      currentQuestion.question_type = 'true_false'
      continue
    }
    
    // Text input answer
    const answerMatch = line.match(/^\*\*Answer:\*\*\s*(.+)$/)
    if (answerMatch) {
      currentQuestion.answer_data.correct_answer = answerMatch[1]
      currentQuestion.question_type = 'text_input'
      continue
    }
    
    // Explanation
    const explanationMatch = line.match(/^\*\*Explanation:\*\*\s*(.+)$/)
    if (explanationMatch) {
      currentQuestion.answer_data.explanation = explanationMatch[1]
      continue
    }
  }
  
  // Add the last question
  if (currentQuestion) {
    questions.push({
      ...currentQuestion,
      order_index: questionIndex
    })
  }
  
  // Build quiz object
  const quiz: Partial<Quiz> = {
    title: frontmatter.title || 'Untitled Quiz',
    description: frontmatter.description || null,
    published: frontmatter.published || false,
    settings: frontmatter.settings || {},
    questions: questions as Question[]
  }
  
  return quiz
}

/**
 * Validate markdown content for quiz format
 */
export function validateMarkdown(markdown: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    const quiz = parseMarkdownToQuiz(markdown)
    
    if (!quiz.title) {
      errors.push('Quiz title is required')
    }
    
    if (!quiz.questions || quiz.questions.length === 0) {
      errors.push('At least one question is required')
    }
    
    quiz.questions?.forEach((question, index) => {
      if (!question.question_text) {
        errors.push(`Question ${index + 1} is missing question text`)
      }
      
      if (question.question_type === 'multiple_choice') {
        if (!question.options.choices || question.options.choices.length < 2) {
          errors.push(`Question ${index + 1} needs at least 2 multiple choice options`)
        }
        if (question.options.correct_index === undefined) {
          errors.push(`Question ${index + 1} needs a correct answer marked with ✓`)
        }
      }
      
      if (question.question_type === 'true_false') {
        if (!question.answer_data.correct_answer) {
          errors.push(`Question ${index + 1} needs a correct answer marked with ✓`)
        }
      }
      
      if (question.question_type === 'text_input') {
        if (!question.answer_data.correct_answer) {
          errors.push(`Question ${index + 1} needs an answer specified`)
        }
      }
    })
    
  } catch (error) {
    errors.push(`Markdown parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}