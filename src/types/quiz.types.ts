// Quiz system types for frontend use
import { Database } from './database.types'

// Re-export database types for convenience
export type QuizCategoryRow =
  Database['public']['Tables']['quiz_categories']['Row']
export type QuizRow = Database['public']['Tables']['quizzes']['Row']
export type QuestionRow = Database['public']['Tables']['questions']['Row']
export type ResponseRow = Database['public']['Tables']['responses']['Row']

export type QuestionType = 'multiple_choice' | 'true_false' | 'text_input'
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned'

// Media content structure for questions
export interface MediaContent {
  type: 'image' | 'audio' | 'video'
  path: string
  alt?: string
  caption?: string
}

// Quiz category (extends blog_tags pattern)
export interface QuizCategory {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

// Quiz settings stored in JSONB
export interface QuizSettings {
  time_limit?: number // minutes
  randomize_questions?: boolean
  show_feedback?: boolean
  allow_retakes?: boolean
  passing_score?: number
  description?: string
}

// Main quiz interface (extends blog_posts pattern)
export interface Quiz {
  id: string
  title: string
  description: string | null
  category_id: string | null
  settings: QuizSettings
  published: boolean
  created_at: string
  updated_at: string
  // Populated relations
  category?: QuizCategory
  questions?: Question[]
}

// Question content structure for multimedia
export interface QuestionContent {
  primary_text?: string
  media_primary?: MediaContent
  additional_context?: string
  media_secondary?: MediaContent[]
}

// Option structure for multiple choice questions
export interface QuestionOption {
  id: string
  text: string
  media?: MediaContent
}

// Multiple choice options
export interface MultipleChoiceOptions {
  type: 'multiple_choice'
  allow_multiple: boolean
  options: QuestionOption[]
  randomize_order?: boolean
}

// True/false options
export interface TrueFalseOptions {
  type: 'true_false'
  true_label?: string
  false_label?: string
}

// Text input options
export interface TextInputOptions {
  type: 'text_input'
  placeholder?: string
  max_length?: number
  case_sensitive?: boolean
}

export type QuestionOptions =
  | MultipleChoiceOptions
  | TrueFalseOptions
  | TextInputOptions

// Answer validation and feedback
export interface AnswerFeedback {
  correct: string
  incorrect: string
  partial?: string
}

export interface AnswerData {
  correct_options: string[]
  scoring: {
    correct: number
    incorrect: number
    partial?: number
  }
  feedback?: AnswerFeedback
  explanation?: string
}

// Question interface
export interface Question {
  id: string
  quiz_id: string
  question_text: string
  question_type: QuestionType
  question_content: QuestionContent
  options: QuestionOptions
  answer_data: AnswerData
  order_index: number
  created_at: string
  updated_at: string
}

// Quiz session for anonymous tracking
export interface QuizSession {
  id: string
  quiz_id: string
  session_token: string
  user_agent: string | null
  status: SessionStatus
  started_at: string
  completed_at: string | null
  last_activity: string
  // Populated relations
  quiz?: Quiz
  responses?: QuestionResponse[]
  results?: QuizResult
}

// Individual question response
export interface QuestionResponse {
  id: string
  session_id: string
  question_id: string
  answer_data: Record<string, unknown> // Flexible answer structure
  response_time: number | null // milliseconds
  submitted_at: string
  // Populated relations
  question?: Question
}

// Aggregated quiz results
export interface QuizResultData {
  correct_answers: number
  total_questions: number
  score_percentage: number
  time_per_question: Record<string, number>
  question_scores: Record<string, number>
}

export interface QuizResult {
  id: string
  session_id: string
  quiz_id: string
  total_score: number
  max_possible_score: number
  completion_time: number | null // milliseconds
  results_data: QuizResultData
  calculated_at: string
  // Populated relations
  session?: QuizSession
  quiz?: Quiz
}

// DTOs for API operations
export interface CreateQuizDto {
  title: string
  description?: string
  category_id?: string
  settings: QuizSettings
  published?: boolean
}

export type UpdateQuizDto = Partial<CreateQuizDto>

export interface CreateQuestionDto {
  quiz_id: string
  question_text: string
  question_type: QuestionType
  question_content: QuestionContent
  options: QuestionOptions
  answer_data: AnswerData
  order_index?: number
}

export type UpdateQuestionDto = Partial<Omit<CreateQuestionDto, 'quiz_id'>>

export interface CreateSessionDto {
  quiz_id: string
  user_agent?: string
}

export interface SubmitResponseDto {
  session_token: string
  question_id: string
  answer_data: Record<string, unknown>
  response_time?: number
}

// Filter interfaces
export interface QuizFilters {
  category_id?: string
  published?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface SessionFilters {
  quiz_id?: string
  status?: SessionStatus
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}

// Response interfaces for API
export interface QuizListResponse {
  quizzes: Quiz[]
  total: number
  page: number
  limit: number
}

export interface SessionListResponse {
  sessions: QuizSession[]
  total: number
  page: number
  limit: number
}

export interface QuizStatsResponse {
  total_attempts: number
  completion_rate: number
  average_score: number
  average_completion_time: number
  question_analytics: Array<{
    question_id: string
    correct_rate: number
    average_response_time: number
  }>
}
