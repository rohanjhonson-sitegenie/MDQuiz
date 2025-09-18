// Repository pattern implementation for existing quiz schema
// Works with quiz_categories, quizzes, questions, responses tables

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Quiz, QuizCategory, QuizRepository as IQuizRepository } from '@/types/quiz.types'

export class QuizRepository implements IQuizRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get all quizzes with optional category and question data
   */
  async getQuizzes(includeQuestions = false): Promise<Quiz[]> {
    let query = this.supabase
      .from('quizzes')
      .select('*,category:quiz_categories(*)')
      .order('updated_at', { ascending: false })

    if (includeQuestions) {
      // For now, let's just fetch quizzes without questions to avoid the complex query
      // Questions can be loaded separately when needed
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch quizzes: ${error.message}`)
    }

    return (data || []) as Quiz[]
  }

  /**
   * Get quiz by ID with all related data
   */
  async getQuizById(id: string): Promise<Quiz | null> {
    const { data, error } = await this.supabase
      .from('quizzes')
      .select(`
        *,
        category:quiz_categories(id, name, slug, description, created_at),
        questions(*)
      `)
      .eq('id', id)
      .order('order_index', { foreignTable: 'questions', ascending: true })
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null
      }
      throw new Error(`Failed to fetch quiz: ${error.message}`)
    }

    return data
  }

  /**
   * Create new quiz with questions
   */
  async createQuiz(quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>): Promise<Quiz> {
    const { questions, ...quizData } = quiz

    // Insert quiz record
    const { data: newQuiz, error: quizError } = await this.supabase
      .from('quizzes')
      .insert({
        title: quizData.title,
        description: quizData.description,
        category_id: quizData.category_id,
        settings: quizData.settings || {},
        published: quizData.published || false
      })
      .select()
      .single()

    if (quizError) {
      throw new Error(`Failed to create quiz: ${quizError.message}`)
    }

    // Insert questions if provided
    if (questions && questions.length > 0) {
      const questionsToInsert = questions.map((question, index) => ({
        quiz_id: newQuiz.id,
        question_text: question.question_text,
        question_type: question.question_type,
        question_content: question.question_content || {},
        options: question.options || {},
        answer_data: question.answer_data || {},
        order_index: question.order_index ?? index
      }))

      const { error: questionsError } = await this.supabase
        .from('questions')
        .insert(questionsToInsert)

      if (questionsError) {
        // Rollback quiz creation if questions fail
        await this.supabase.from('quizzes').delete().eq('id', newQuiz.id)
        throw new Error(`Failed to create questions: ${questionsError.message}`)
      }
    }

    // Return complete quiz with questions
    return this.getQuizById(newQuiz.id) as Promise<Quiz>
  }

  /**
   * Update existing quiz and questions
   */
  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz> {
    const { questions, ...quizUpdates } = updates

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

    // Update questions if provided
    if (questions) {
      // Delete existing questions
      const { error: deleteError } = await this.supabase
        .from('questions')
        .delete()
        .eq('quiz_id', id)

      if (deleteError) {
        throw new Error(`Failed to delete existing questions: ${deleteError.message}`)
      }

      // Insert new questions
      if (questions.length > 0) {
        const questionsToInsert = questions.map((question, index) => ({
          quiz_id: id,
          question_text: question.question_text,
          question_type: question.question_type,
          question_content: question.question_content || {},
          options: question.options || {},
          answer_data: question.answer_data || {},
          order_index: question.order_index ?? index
        }))

        const { error: insertError } = await this.supabase
          .from('questions')
          .insert(questionsToInsert)

        if (insertError) {
          throw new Error(`Failed to insert updated questions: ${insertError.message}`)
        }
      }
    }

    // Return updated quiz with questions
    return this.getQuizById(id) as Promise<Quiz>
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

    return data
  }

  /**
   * Get quiz responses for analytics
   */
  async getQuizResponses(quizId: string): Promise<Response[]> {
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
    // Get basic response count
    const { count: totalResponses, error: countError } = await this.supabase
      .from('responses')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quizId)

    if (countError) {
      throw new Error(`Failed to fetch response count: ${countError.message}`)
    }

    if (!totalResponses || totalResponses === 0) {
      return {
        totalResponses: 0,
        averageScore: 0,
        completionRate: 0
      }
    }

    // Get response data for calculations
    const { data: responses, error: responsesError } = await this.supabase
      .from('responses')
      .select('answers')
      .eq('quiz_id', quizId)

    if (responsesError) {
      throw new Error(`Failed to fetch response data: ${responsesError.message}`)
    }

    // Calculate simple completion rate (responses with answers)
    const completedResponses = responses?.filter(r => 
      r.answers && Object.keys(r.answers).length > 0
    ).length || 0

    const completionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0

    return {
      totalResponses: totalResponses || 0,
      averageScore: 0, // Would need quiz scoring logic to calculate
      completionRate
    }
  }
}