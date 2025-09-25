// Repository pattern implementation for existing quiz schema
// Works with quiz_categories, quizzes, questions, responses tables

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Quiz, QuizSection, Question } from '@/lib/simple-types'
import { normalizeQuiz, safeJsonParse } from '@/lib/simple-types'

// Helper to extract single item from Supabase response (handles array behavior with RLS)
function extractSingleResult<T>(data: T | T[] | null): T | null {
  if (!data) return null

  if (Array.isArray(data)) {
    return data.length > 0 ? data[0] : null
  }
  return data
}

// Define interfaces that were missing
interface QuizCategory {
  id: string
  name: string
  slug: string
  description?: string
  created_at?: string
}

interface QuizResponse {
  id: string
  quiz_id: string
  session_id?: string
  answers: Record<string, unknown>
  respondent_name?: string
  respondent_email?: string
  submitted_at?: string
  created_at?: string
}

interface IQuizRepository {
  getQuizzes(includeQuestions?: boolean): Promise<Quiz[]>
  getQuizById(id: string): Promise<Quiz | null>
  createQuiz(quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>): Promise<Quiz>
  updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz>
  deleteQuiz(id: string): Promise<void>
}

export class QuizRepository implements IQuizRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get all quizzes with optional category and question data
   */
  async getQuizzes(includeQuestions = true): Promise<Quiz[]> {
    let selectClause = '*,category:quiz_categories(*),sections:quiz_sections(*)'

    if (includeQuestions) {
      selectClause = '*,category:quiz_categories(*),questions(*),sections:quiz_sections(*,questions(*))'
    }

    const { data, error } = await this.supabase
      .from('quizzes')
      .select(selectClause)
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch quizzes: ${error.message}`)
    }

    // Simple normalization to ensure consistent data format
    return (data || []).map(quiz => normalizeQuiz({
      ...quiz,
      settings: safeJsonParse(quiz.settings, { structure_type: 'mixed' }),
      questions: quiz.questions || [],
      sections: quiz.sections || []
    }))
  }

  /**
   * Get quiz by ID with all related data
   */
  async getQuizById(id: string): Promise<Quiz | null> {
    // Get basic quiz data
    const { data, error } = await this.supabase
      .from('quizzes')
      .select(`
        *,
        category:quiz_categories(id, name, slug, description, created_at),
        sections:quiz_sections(
          *,
          questions(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null
      }
      throw new Error(`Failed to fetch quiz: ${error.message}`)
    }

    // Get questions in proper order using separate queries with manual sorting
    const questionsResult = await this.supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', id)

    const sectionsResult = await this.supabase
      .from('quiz_sections')
      .select('*')
      .eq('quiz_id', id)
      .order('order_index')

    if (questionsResult.error || sectionsResult.error) {
      throw new Error(`Failed to fetch questions and sections: ${questionsResult.error?.message || sectionsResult.error?.message}`)
    }

    // Manual sorting by section order then question order
    const questions = questionsResult.data || []
    const sections = sectionsResult.data || []
    const sectionOrderMap = new Map(sections.map(s => [s.id, s.order_index]))

    questions.sort((a, b) => {
      const aSectionOrder = sectionOrderMap.get(a.section_id) ?? 999
      const bSectionOrder = sectionOrderMap.get(b.section_id) ?? 999
      if (aSectionOrder !== bSectionOrder) {
        return aSectionOrder - bSectionOrder
      }
      return (a.order_index ?? 0) - (b.order_index ?? 0)
    })

    data.questions = questions

    const quizData = extractSingleResult(data)
    if (!quizData) return null

    return normalizeQuiz({
      ...quizData,
      settings: safeJsonParse(quizData.settings, {}),
      questions: questions,
      sections: quizData.sections || []
    })
  }

  /**
   * Get quiz with sections and questions (comprehensive method for both mixed and sectioned)
   */
  async getQuizWithSections(id: string): Promise<Quiz | null> {
    const { data, error } = await this.supabase
      .from('quizzes')
      .select(`
        *,
        category:quiz_categories(id, name, slug, description, created_at),
        questions(*),
        sections:quiz_sections(
          *,
          questions(*)
        )
      `)
      .eq('id', id)
      .order('order_index', { foreignTable: 'questions', ascending: true })
      .order('order_index', { foreignTable: 'quiz_sections', ascending: true })
      .order('order_index', { foreignTable: 'quiz_sections.questions', ascending: true })
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch quiz with sections: ${error.message}`)
    }

    const quizData = extractSingleResult(data)
    if (!quizData) return null

    return normalizeQuiz({
      ...quizData,
      settings: safeJsonParse(quizData.settings, {}),
      questions: quizData.questions || [],
      sections: quizData.sections || []
    })
  }

  /**
   * Create new quiz with questions and sections
   */
  async createQuiz(quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>): Promise<Quiz> {
    const { questions, sections, ...quizData } = quiz

    // Insert quiz record (without .select() due to RLS issues)
    const insertData = {
      title: quizData.title,
      description: quizData.description,
      category_id: quizData.category_id,
      settings: quizData.settings || {},
      published: quizData.published || false
    }

    const { error: quizError } = await this.supabase
      .from('quizzes')
      .insert(insertData)


    if (quizError) {
      throw new Error(`Failed to create quiz: ${quizError.message}`)
    }

    // Since RLS blocks .select() on insert, fetch the most recently created quiz by this user
    // This is a workaround for RLS policy restrictions
    const { data: newQuizData, error: fetchError } = await this.supabase
      .from('quizzes')
      .select('*')
      .eq('title', insertData.title)
      .order('created_at', { ascending: false })
      .limit(1)


    if (fetchError) {
      throw new Error(`Failed to fetch created quiz: ${fetchError.message}`)
    }

    const newQuiz = extractSingleResult(newQuizData)

    if (!newQuiz) {
      throw new Error('Failed to retrieve created quiz')
    }

    try {
      // Handle sections if provided
      if (sections && sections.length > 0) {
        for (const section of sections) {
          const { data, error: sectionError } = await this.supabase
            .from('quiz_sections')
            .insert({
              quiz_id: newQuiz.id,
              title: section.title,
              description: section.description,
              order_index: section.order_index,
              settings: section.settings || {}
            })
            .select()
            .single()

          if (sectionError) {
            throw new Error(`Failed to create section "${section.title}": ${sectionError.message}`)
          }

          const newSection = extractSingleResult(data)
          if (!newSection) {
            throw new Error(`Failed to create section "${section.title}": No data returned`)
          }

          // Insert questions for this section
          if (section.questions && section.questions.length > 0) {
            const sectionQuestionsToInsert = section.questions.map((question, index) => ({
              quiz_id: newQuiz.id,
              section_id: newSection.id,
              question_text: question.question_text,
              question_type: question.question_type,
              question_content: question.question_content || {},
              options: question.options || {},
              answer_data: question.answer_data || {},
              order_index: question.order_index ?? index
            }))

            const { error: sectionQuestionsError } = await this.supabase
              .from('questions')
              .insert(sectionQuestionsToInsert)

            if (sectionQuestionsError) {
              throw new Error(`Failed to insert questions for section "${section.title}": ${sectionQuestionsError.message}`)
            }
          }
        }
      }

      // Insert standalone questions if provided (and no sections)
      if (questions && questions.length > 0 && (!sections || sections.length === 0)) {
        const questionsToInsert = questions.map((question, index) => ({
          quiz_id: newQuiz.id,
          question_text: question.question_text,
          question_type: question.question_type,
          question_content: question.question_content || {},
          options: question.options || {},
          answer_data: question.answer_data || {},
          order_index: question.order_index ?? index,
          ...(question.section_id && { section_id: question.section_id })
        }))

        const { error: questionsError } = await this.supabase
          .from('questions')
          .insert(questionsToInsert)

        if (questionsError) {
          throw new Error(`Failed to create questions: ${questionsError.message}`)
        }
      }

      // Return complete quiz with questions and sections
      return this.getQuizWithSections(newQuiz.id) as Promise<Quiz>

    } catch (error) {
      // Rollback quiz creation on any error
      await this.supabase.from('quizzes').delete().eq('id', newQuiz.id)
      throw error
    }
  }

  /**
   * Update existing quiz and questions (with sections support)
   */
  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz> {
    const { questions, sections, ...quizUpdates } = updates

    // Update quiz record
    const { error: quizError } = await this.supabase
      .from('quizzes')
      .update({
        ...(quizUpdates.title && { title: quizUpdates.title }),
        ...(quizUpdates.description !== undefined && { description: quizUpdates.description }),
        ...(quizUpdates.category_id !== undefined && { category_id: quizUpdates.category_id }),
        ...(quizUpdates.settings && { settings: quizUpdates.settings }),
        ...(quizUpdates.published !== undefined && { published: quizUpdates.published })
      })
      .eq('id', id)

    if (quizError) {
      throw new Error(`Failed to update quiz: ${quizError.message}`)
    }

    // Handle sections if provided
    if (sections) {
      // Fetch existing sections to preserve IDs where possible
      const { data: existingSections } = await this.supabase
        .from('quiz_sections')
        .select('id, title, order_index')
        .eq('quiz_id', id)
        .order('order_index')

      // Delete sections that no longer exist in the update
      if (existingSections && existingSections.length > 0) {
        const newSectionTitles = new Set(sections.map(s => s.title))
        const sectionsToDelete = existingSections.filter(es => !newSectionTitles.has(es.title))

        if (sectionsToDelete.length > 0) {
          const { error: deleteSectionsError } = await this.supabase
            .from('quiz_sections')
            .delete()
            .in('id', sectionsToDelete.map(s => s.id))

          if (deleteSectionsError) {
            throw new Error(`Failed to delete removed sections: ${deleteSectionsError.message}`)
          }
        }
      }

      // Update or create sections and their questions
      for (const section of sections) {
        // Check if section exists (match by title)
        const existingSection = existingSections?.find(es => es.title === section.title)

        let sectionId: string

        if (existingSection) {
          // Update existing section

          const { error: updateError } = await this.supabase
            .from('quiz_sections')
            .update({
              description: section.description,
              order_index: section.order_index,
              settings: section.settings || {}
            })
            .eq('id', existingSection.id)

          if (updateError) {
            throw new Error(`Failed to update section "${section.title}": ${updateError.message}`)
          }

          sectionId = existingSection.id
        } else {
          // Create new section

          const { error: insertError } = await this.supabase
            .from('quiz_sections')
            .insert({
              quiz_id: id,
              title: section.title,
              description: section.description,
              order_index: section.order_index,
              settings: section.settings || {}
            })

          if (insertError) {
            throw new Error(`Failed to create section "${section.title}": ${insertError.message}`)
          }

          // Fetch the newly created section
          const { data: newSections, error: selectError } = await this.supabase
            .from('quiz_sections')
            .select('id')
            .eq('quiz_id', id)
            .eq('title', section.title)
            .eq('order_index', section.order_index)

          if (!newSections || newSections.length === 0 || selectError) {
            continue
          }

          sectionId = Array.isArray(newSections) ? newSections[0].id : newSections.id
        }

        // Update or insert questions for this section
        if (section.questions && section.questions.length > 0) {
          // Fetch existing questions for this section
          const { data: existingQuestions } = await this.supabase
            .from('questions')
            .select('id, question_text, order_index')
            .eq('section_id', sectionId)
            .order('order_index')

          for (const question of section.questions) {
            // Try to match existing question by text and order
            const existingQuestion = existingQuestions?.find(
              eq => eq.question_text === question.question_text || eq.order_index === question.order_index
            )

            if (existingQuestion) {
              // Update existing question
              const { error: updateError } = await this.supabase
                .from('questions')
                .update({
                  question_text: question.question_text,
                  question_type: question.question_type,
                  question_content: question.question_content || {},
                  options: question.options || {},
                  answer_data: question.answer_data || {},
                  order_index: question.order_index ?? existingQuestion.order_index
                })
                .eq('id', existingQuestion.id)

              if (updateError) {
                throw new Error(`Failed to update question: ${updateError.message}`)
              }
            } else {
              // Insert new question
              const { error: insertError } = await this.supabase
                .from('questions')
                .insert({
                  quiz_id: id,
                  section_id: sectionId,
                  question_text: question.question_text,
                  question_type: question.question_type,
                  question_content: question.question_content || {},
                  options: question.options || {},
                  answer_data: question.answer_data || {},
                  order_index: question.order_index ?? 0
                })

              if (insertError) {
                throw new Error(`Failed to insert question: ${insertError.message}`)
              }
            }
          }

          // Delete questions that no longer exist
          if (existingQuestions && existingQuestions.length > 0) {
            const newQuestionTexts = new Set(section.questions.map(q => q.question_text))
            const questionsToDelete = existingQuestions.filter(eq => !newQuestionTexts.has(eq.question_text))

            if (questionsToDelete.length > 0) {
              const { error: deleteError } = await this.supabase
                .from('questions')
                .delete()
                .in('id', questionsToDelete.map(q => q.id))

              if (deleteError) {
                throw new Error(`Failed to delete removed questions: ${deleteError.message}`)
              }
            }
          }
        }
      }
    }

    // Update standalone questions if provided (and no sections)
    if (questions && (!sections || sections.length === 0)) {
      // Fetch existing questions
      const { data: existingQuestions } = await this.supabase
        .from('questions')
        .select('id, question_text, order_index')
        .eq('quiz_id', id)
        .is('section_id', null)
        .order('order_index')

      for (const question of questions) {
        // Try to match existing question by text or order
        const existingQuestion = existingQuestions?.find(
          eq => eq.question_text === question.question_text || eq.order_index === question.order_index
        )

        if (existingQuestion) {
          // Update existing question
          const { error: updateError } = await this.supabase
            .from('questions')
            .update({
              question_text: question.question_text,
              question_type: question.question_type,
              question_content: question.question_content || {},
              options: question.options || {},
              answer_data: question.answer_data || {},
              order_index: question.order_index ?? existingQuestion.order_index
            })
            .eq('id', existingQuestion.id)

          if (updateError) {
            throw new Error(`Failed to update question: ${updateError.message}`)
          }
        } else {
          // Insert new question
          const { error: insertError } = await this.supabase
            .from('questions')
            .insert({
              quiz_id: id,
              question_text: question.question_text,
              question_type: question.question_type,
              question_content: question.question_content || {},
              options: question.options || {},
              answer_data: question.answer_data || {},
              order_index: question.order_index ?? 0,
              ...(question.section_id && { section_id: question.section_id })
            })

          if (insertError) {
            throw new Error(`Failed to insert question: ${insertError.message}`)
          }
        }
      }

      // Delete questions that no longer exist
      if (existingQuestions && existingQuestions.length > 0) {
        const newQuestionTexts = new Set(questions.map(q => q.question_text))
        const questionsToDelete = existingQuestions.filter(eq => !newQuestionTexts.has(eq.question_text))

        if (questionsToDelete.length > 0) {
          const { error: deleteError } = await this.supabase
            .from('questions')
            .delete()
            .in('id', questionsToDelete.map(q => q.id))

          if (deleteError) {
            throw new Error(`Failed to delete removed questions: ${deleteError.message}`)
          }
        }
      }
    }

    // Return updated quiz with questions and sections
    return this.getQuizWithSections(id) as Promise<Quiz>
  }

  /**
   * Delete quiz and all related data
   */
  async deleteQuiz(id: string): Promise<void> {
    // Questions will be deleted automatically due to CASCADE constraint
    const { error } = await this.supabase
      .from('quizzes')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete quiz: ${error.message}`)
    }
  }

  /**
   * Get all quiz categories
   */
  async getCategories(): Promise<QuizCategory[]> {
    const { data, error } = await this.supabase
      .from('quiz_categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    return data || []
  }

  /**
   * Create new category
   */
  async createCategory(category: Omit<QuizCategory, 'id' | 'created_at'>): Promise<QuizCategory> {
    const { data, error } = await this.supabase
      .from('quiz_categories')
      .insert({
        name: category.name,
        slug: category.slug,
        description: category.description
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`)
    }

    const categoryData = extractSingleResult(data)
    if (!categoryData) {
      throw new Error('Failed to create category: No data returned')
    }

    return categoryData
  }

  /**
   * Get quiz responses for analytics
   */
  async getQuizResponses(quizId: string): Promise<QuizResponse[]> {
    const { data, error } = await this.supabase
      .from('responses')
      .select('*')
      .eq('quiz_id', quizId)
      .order('submitted_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch responses: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get quiz statistics
   */
  async getQuizStats(quizId: string): Promise<{
    totalResponses: number
    averageScore: number
    completionRate: number
  }> {
    // Fetch responses and questions together
    const [responsesResult, questionsResult] = await Promise.all([
      this.supabase
        .from('responses')
        .select('answers')
        .eq('quiz_id', quizId),
      this.supabase
        .from('questions')
        .select('id, question_type, options, answer_data')
        .eq('quiz_id', quizId)
    ])

    if (responsesResult.error) {
      throw new Error(`Failed to fetch responses: ${responsesResult.error.message}`)
    }

    if (questionsResult.error) {
      throw new Error(`Failed to fetch questions: ${questionsResult.error.message}`)
    }

    const responses = responsesResult.data
    const questions = questionsResult.data
    const totalResponses = responses?.length || 0

    if (totalResponses === 0) {
      return {
        totalResponses: 0,
        averageScore: 0,
        completionRate: 0
      }
    }

    // Calculate simple completion rate (responses with answers)
    const completedResponses = responses?.filter(r =>
      r.answers && Object.keys(r.answers).length > 0
    ).length || 0

    const completionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0

    // Calculate average score
    let totalScore = 0
    let scoredResponses = 0

    responses?.forEach(response => {
      if (!response.answers || Object.keys(response.answers).length === 0) return

      let correctCount = 0
      let answeredCount = 0

      questions?.forEach(question => {
        const userAnswer = response.answers[question.id]
        if (userAnswer === undefined) return

        answeredCount++
        if (this.isAnswerCorrect(question, userAnswer)) {
          correctCount++
        }
      })

      if (answeredCount > 0) {
        const score = (correctCount / answeredCount) * 100
        totalScore += score
        scoredResponses++
      }
    })

    const averageScore = scoredResponses > 0 ? totalScore / scoredResponses : 0

    return {
      totalResponses: totalResponses || 0,
      averageScore,
      completionRate
    }
  }

  private normalizeAnswer(answer: string): string {
    return answer
      .toLowerCase()
      .trim()
      .replace(/[\s\-_/\\,;:.]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very', 'just', 'but', 'or', 'and', 'if', 'because', 'while', 'it', 'its', 'that', 'this', 'these', 'those'])

    return this.normalizeAnswer(text)
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
  }

  private calculateKeywordMatch(userAnswer: string, correctAnswer: string): number {
    const userKeywords = new Set(this.extractKeywords(userAnswer))
    const correctKeywords = this.extractKeywords(correctAnswer)

    if (correctKeywords.length === 0) return 0

    const matchedCount = correctKeywords.filter(keyword => userKeywords.has(keyword)).length
    return matchedCount / correctKeywords.length
  }

  private isAnswerCorrect(question: Question, userAnswer: unknown): boolean {
    if (question.question_type === 'multiple_choice') {
      const options = question.options as { correct_index?: number }
      return userAnswer === options.correct_index
    }
    if (question.question_type === 'true_false') {
      const answerData = question.answer_data as { correct_answer?: boolean }
      return userAnswer === answerData.correct_answer
    }
    if (question.question_type === 'text_input') {
      const answerData = question.answer_data as { correct_answer?: string }
      const options = question.options as { min_length?: number }
      const userAnswerStr = String(userAnswer || '')
      const correctAnswerStr = answerData.correct_answer || ''

      const normalizedUser = this.normalizeAnswer(userAnswerStr)
      const normalizedCorrect = this.normalizeAnswer(correctAnswerStr)

      if (normalizedUser === normalizedCorrect) {
        return true
      }

      if (correctAnswerStr.length > 50 || (options?.min_length && options.min_length > 30)) {
        const keywordMatchScore = this.calculateKeywordMatch(userAnswerStr, correctAnswerStr)
        return keywordMatchScore >= 0.6
      }

      return normalizedUser === normalizedCorrect
    }
    return false
  }

  // Section Management Methods

  /**
   * Get all sections for a quiz
   */
  async getSectionsByQuizId(quizId: string): Promise<QuizSection[]> {
    const { data, error } = await this.supabase
      .from('quiz_sections')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index')

    if (error) {
      throw new Error(`Failed to fetch sections: ${error.message}`)
    }

    return data || []
  }

  /**
   * Create new section
   */
  async createSection(section: Omit<QuizSection, 'id' | 'created_at' | 'updated_at'>): Promise<QuizSection> {
    const { data, error } = await this.supabase
      .from('quiz_sections')
      .insert({
        quiz_id: section.quiz_id,
        title: section.title,
        description: section.description,
        order_index: section.order_index,
        settings: section.settings || {}
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create section: ${error.message}`)
    }

    const sectionData = extractSingleResult(data)
    if (!sectionData) {
      throw new Error('Failed to create section: No data returned')
    }

    return sectionData
  }

  /**
   * Update section
   */
  async updateSection(id: string, updates: Partial<QuizSection>): Promise<QuizSection> {
    const { data, error } = await this.supabase
      .from('quiz_sections')
      .update({
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.order_index !== undefined && { order_index: updates.order_index }),
        ...(updates.settings !== undefined && { settings: updates.settings })
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update section: ${error.message}`)
    }

    const sectionData = extractSingleResult(data)
    if (!sectionData) {
      throw new Error('Failed to update section: No data returned')
    }

    return sectionData
  }

  /**
   * Delete section
   */
  async deleteSection(id: string): Promise<void> {
    // First, move all questions from this section back to the quiz
    const { error: moveError } = await this.supabase
      .from('questions')
      .update({ section_id: null })
      .eq('section_id', id)

    if (moveError) {
      throw new Error(`Failed to move questions from section: ${moveError.message}`)
    }

    // Then delete the section
    const { error } = await this.supabase
      .from('quiz_sections')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete section: ${error.message}`)
    }
  }

  /**
   * Reorder sections
   */
  async reorderSections(quizId: string, sectionOrders: { id: string; order_index: number }[]): Promise<void> {
    const updates = sectionOrders.map(({ id, order_index }) => ({
      id,
      order_index
    }))

    for (const update of updates) {
      const { error } = await this.supabase
        .from('quiz_sections')
        .update({ order_index: update.order_index })
        .eq('id', update.id)
        .eq('quiz_id', quizId) // Extra safety check

      if (error) {
        throw new Error(`Failed to reorder sections: ${error.message}`)
      }
    }
  }

  /**
   * Move question to section
   */
  async moveQuestionToSection(questionId: string, sectionId: string | null): Promise<void> {
    const { error } = await this.supabase
      .from('questions')
      .update({ section_id: sectionId })
      .eq('id', questionId)

    if (error) {
      throw new Error(`Failed to move question to section: ${error.message}`)
    }
  }

  /**
   * Get questions with section information
   */
  async getQuestionsWithSections(quizId: string): Promise<Question[]> {
    const { data, error } = await this.supabase
      .from('questions')
      .select(`
        *,
        section:quiz_sections(*)
      `)
      .eq('quiz_id', quizId)
      .order('order_index')

    if (error) {
      throw new Error(`Failed to fetch questions with sections: ${error.message}`)
    }

    return data || []
  }

  // Question Management Methods

  /**
   * Create new question
   */
  async createQuestion(question: Omit<Question, 'id' | 'created_at' | 'updated_at'> & { quiz_id: string }): Promise<Question> {
    const { data, error } = await this.supabase
      .from('questions')
      .insert({
        quiz_id: question.quiz_id,
        section_id: question.section_id,
        question_type: question.question_type,
        question_text: question.question_text,
        question_content: question.question_content || {},
        options: question.options || {},
        answer_data: question.answer_data || {},
        order_index: question.order_index
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create question: ${error.message}`)
    }

    const questionData = extractSingleResult(data)
    if (!questionData) {
      throw new Error('Failed to create question: No data returned')
    }

    return questionData
  }

  /**
   * Update question
   */
  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
    const { data, error } = await this.supabase
      .from('questions')
      .update({
        ...(updates.question_type !== undefined && { question_type: updates.question_type }),
        ...(updates.question_text !== undefined && { question_text: updates.question_text }),
        ...(updates.question_content !== undefined && { question_content: updates.question_content }),
        ...(updates.options !== undefined && { options: updates.options }),
        ...(updates.answer_data !== undefined && { answer_data: updates.answer_data }),
        ...(updates.order_index !== undefined && { order_index: updates.order_index }),
        ...(updates.section_id !== undefined && { section_id: updates.section_id })
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update question: ${error.message}`)
    }

    const questionData = extractSingleResult(data)
    if (!questionData) {
      throw new Error('Failed to update question: No data returned')
    }

    return questionData
  }

  /**
   * Delete question
   */
  async deleteQuestion(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('questions')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete question: ${error.message}`)
    }
  }

  /**
   * Reorder questions
   */
  async reorderQuestions(questionOrders: { id: string; order_index: number }[]): Promise<void> {
    for (const update of questionOrders) {
      const { error } = await this.supabase
        .from('questions')
        .update({ order_index: update.order_index })
        .eq('id', update.id)

      if (error) {
        throw new Error(`Failed to reorder questions: ${error.message}`)
      }
    }
  }

  /**
   * Get questions by section
   */
  async getQuestionsBySection(sectionId: string): Promise<Question[]> {
    const { data, error } = await this.supabase
      .from('questions')
      .select('*')
      .eq('section_id', sectionId)
      .order('order_index')

    if (error) {
      throw new Error(`Failed to fetch questions by section: ${error.message}`)
    }

    return data || []
  }
}