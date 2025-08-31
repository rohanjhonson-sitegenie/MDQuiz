// API-specific types for quiz system integration with Supabase
import { Database } from '../../types/database.types'

// Auto-generated database types (use these instead of manual definitions)
export type QuizCategoryRow =
  Database['public']['Tables']['quiz_categories']['Row']
export type QuizRow = Database['public']['Tables']['quizzes']['Row']
export type QuestionRow = Database['public']['Tables']['questions']['Row']
export type ResponseRow = Database['public']['Tables']['responses']['Row']

// Insert types
export type QuizCategoryInsert =
  Database['public']['Tables']['quiz_categories']['Insert']
export type QuizInsert = Database['public']['Tables']['quizzes']['Insert']
export type QuestionInsert = Database['public']['Tables']['questions']['Insert']
export type ResponseInsert = Database['public']['Tables']['responses']['Insert']

// Update types
export type QuizCategoryUpdate =
  Database['public']['Tables']['quiz_categories']['Update']
export type QuizUpdate = Database['public']['Tables']['quizzes']['Update']
export type QuestionUpdate = Database['public']['Tables']['questions']['Update']
export type ResponseUpdate = Database['public']['Tables']['responses']['Update']

// API Response types for error handling
export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
  count?: number
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, unknown>
}

// Supabase client extensions for quiz operations
export interface SupabaseQuizClient {
  // Quiz operations
  getPublishedQuizzes(): Promise<ApiResponse<QuizRow[]>>
  getQuizById(id: string): Promise<ApiResponse<QuizRow>>
  getQuizWithQuestions(
    id: string
  ): Promise<ApiResponse<QuizRow & { questions: QuestionRow[] }>>

  // Response operations
  submitResponse(response: ResponseInsert): Promise<ApiResponse<ResponseRow>>
  getQuizResponses(quizId: string): Promise<ApiResponse<ResponseRow[]>>
}
