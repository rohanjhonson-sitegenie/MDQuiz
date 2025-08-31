// API-specific types for quiz system integration with Supabase

export interface Database {
  public: {
    Tables: {
      quiz_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          created_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          title: string
          description: string | null
          category_id: string | null
          settings: Record<string, any>
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          category_id?: string
          settings?: Record<string, any>
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category_id?: string
          settings?: Record<string, any>
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          quiz_id: string
          question_text: string
          question_type: string
          question_content: Record<string, any>
          options: Record<string, any>
          answer_data: Record<string, any>
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          question_text: string
          question_type: string
          question_content?: Record<string, any>
          options?: Record<string, any>
          answer_data?: Record<string, any>
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          question_text?: string
          question_type?: string
          question_content?: Record<string, any>
          options?: Record<string, any>
          answer_data?: Record<string, any>
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      quiz_sessions: {
        Row: {
          id: string
          quiz_id: string
          session_token: string
          user_agent: string | null
          status: string
          started_at: string
          completed_at: string | null
          last_activity: string
        }
        Insert: {
          id?: string
          quiz_id: string
          session_token: string
          user_agent?: string
          status?: string
          started_at?: string
          completed_at?: string
          last_activity?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          session_token?: string
          user_agent?: string
          status?: string
          started_at?: string
          completed_at?: string
          last_activity?: string
        }
      }
      question_responses: {
        Row: {
          id: string
          session_id: string
          question_id: string
          answer_data: Record<string, any>
          response_time: number | null
          submitted_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question_id: string
          answer_data: Record<string, any>
          response_time?: number
          submitted_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          question_id?: string
          answer_data?: Record<string, any>
          response_time?: number
          submitted_at?: string
        }
      }
      quiz_results: {
        Row: {
          id: string
          session_id: string
          quiz_id: string
          total_score: number
          max_possible_score: number
          completion_time: number | null
          results_data: Record<string, any>
          calculated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          quiz_id: string
          total_score?: number
          max_possible_score?: number
          completion_time?: number
          results_data?: Record<string, any>
          calculated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          quiz_id?: string
          total_score?: number
          max_possible_score?: number
          completion_time?: number
          results_data?: Record<string, any>
          calculated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Supabase query result types
export type QuizCategoryRow = Database['public']['Tables']['quiz_categories']['Row']
export type QuizRow = Database['public']['Tables']['quizzes']['Row']
export type QuestionRow = Database['public']['Tables']['questions']['Row']
export type QuizSessionRow = Database['public']['Tables']['quiz_sessions']['Row']
export type QuestionResponseRow = Database['public']['Tables']['question_responses']['Row']
export type QuizResultRow = Database['public']['Tables']['quiz_results']['Row']

// Insert types
export type QuizCategoryInsert = Database['public']['Tables']['quiz_categories']['Insert']
export type QuizInsert = Database['public']['Tables']['quizzes']['Insert']
export type QuestionInsert = Database['public']['Tables']['questions']['Insert']
export type QuizSessionInsert = Database['public']['Tables']['quiz_sessions']['Insert']
export type QuestionResponseInsert = Database['public']['Tables']['question_responses']['Insert']
export type QuizResultInsert = Database['public']['Tables']['quiz_results']['Insert']

// Update types
export type QuizCategoryUpdate = Database['public']['Tables']['quiz_categories']['Update']
export type QuizUpdate = Database['public']['Tables']['quizzes']['Update']
export type QuestionUpdate = Database['public']['Tables']['questions']['Update']
export type QuizSessionUpdate = Database['public']['Tables']['quiz_sessions']['Update']
export type QuestionResponseUpdate = Database['public']['Tables']['question_responses']['Update']
export type QuizResultUpdate = Database['public']['Tables']['quiz_results']['Update']

// API Response types for error handling
export interface ApiResponse<T = any> {
  data: T | null
  error: string | null
  count?: number
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

// Supabase client extensions
export interface SupabaseQuizClient {
  // Quiz operations
  getPublishedQuizzes(): Promise<ApiResponse<QuizRow[]>>
  getQuizById(id: string): Promise<ApiResponse<QuizRow>>
  getQuizWithQuestions(id: string): Promise<ApiResponse<QuizRow & { questions: QuestionRow[] }>>
  
  // Session operations
  createSession(session: QuizSessionInsert): Promise<ApiResponse<QuizSessionRow>>
  updateSession(sessionId: string, updates: QuizSessionUpdate): Promise<ApiResponse<QuizSessionRow>>
  getSessionByToken(token: string): Promise<ApiResponse<QuizSessionRow>>
  
  // Response operations
  submitResponse(response: QuestionResponseInsert): Promise<ApiResponse<QuestionResponseRow>>
  getSessionResponses(sessionId: string): Promise<ApiResponse<QuestionResponseRow[]>>
  
  // Results operations
  calculateResults(sessionId: string): Promise<ApiResponse<QuizResultRow>>
  getSessionResults(sessionId: string): Promise<ApiResponse<QuizResultRow>>
}

// Validation schemas for runtime type checking
export interface QuizValidationSchema {
  title: { required: true; type: 'string'; maxLength: 255 }
  description: { required: false; type: 'string' }
  category_id: { required: false; type: 'string'; format: 'uuid' }
  settings: { required: false; type: 'object' }
  published: { required: false; type: 'boolean' }
}

export interface QuestionValidationSchema {
  quiz_id: { required: true; type: 'string'; format: 'uuid' }
  question_text: { required: true; type: 'string'; maxLength: 1000 }
  question_type: { required: true; type: 'string'; enum: ['multiple_choice', 'true_false', 'text_input'] }
  question_content: { required: false; type: 'object' }
  options: { required: false; type: 'object' }
  answer_data: { required: false; type: 'object' }
  order_index: { required: false; type: 'number'; minimum: 0 }
}

export interface SessionValidationSchema {
  quiz_id: { required: true; type: 'string'; format: 'uuid' }
  session_token: { required: true; type: 'string'; minLength: 32 }
  user_agent: { required: false; type: 'string' }
  status: { required: false; type: 'string'; enum: ['in_progress', 'completed', 'abandoned'] }
}

export interface ResponseValidationSchema {
  session_id: { required: true; type: 'string'; format: 'uuid' }
  question_id: { required: true; type: 'string'; format: 'uuid' }
  answer_data: { required: true; type: 'object' }
  response_time: { required: false; type: 'number'; minimum: 0 }
}