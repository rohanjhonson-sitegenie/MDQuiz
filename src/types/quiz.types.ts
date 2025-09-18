// TypeScript interfaces matching existing quiz schema from supabase/migrations/03_create_quiz_tables.sql

// Database table interfaces (matching existing schema exactly)

export interface QuizCategory {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface Quiz {
  id: string
  title: string
  description: string | null
  category_id: string | null
  settings: QuizSettings
  published: boolean
  created_at: string
  updated_at: string
  category?: QuizCategory // Optional joined data
  questions?: Question[] // Optional joined data
}

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

export interface Response {
  id: string
  quiz_id: string
  session_id: string
  answers: Record<string, any>
  respondent_name: string | null
  respondent_email: string | null
  submitted_at: string
}

// JSONB field type definitions

export interface QuizSettings {
  time_limit?: number // in minutes
  randomize_questions?: boolean
  show_feedback?: boolean
  passing_score?: number
  allow_retakes?: boolean
  [key: string]: any // Allow additional settings
}

export interface QuestionContent {
  media_url?: string
  media_type?: 'image' | 'video' | 'audio'
  additional_context?: string
  [key: string]: any // Allow additional content
}

export interface QuestionOptions {
  choices?: string[] // For multiple choice
  correct_index?: number // For multiple choice
  case_sensitive?: boolean // For text input
  min_length?: number // For text input
  max_length?: number // For text input
  [key: string]: any // Allow additional options
}

export interface AnswerData {
  correct_answer: string | number | boolean
  explanation?: string
  points?: number
  validation_rules?: ValidationRule[]
  [key: string]: any // Allow additional answer data
}

export interface ValidationRule {
  type: 'exact_match' | 'contains' | 'regex' | 'numeric_range'
  value: string | number
  case_sensitive?: boolean
}

// Enums and utility types

export type QuestionType = 'multiple_choice' | 'true_false' | 'text_input'

export type QuizStatus = 'draft' | 'published'

// UI state types

export interface NavigationState {
  selectedQuizId: string | null
  selectedCategoryId: string | null
  paneWidths: {
    quizList: number
    editor: number
  }
  activePane: 'list' | 'editor'
}

// Store state interface

export interface QuizStore extends NavigationState {
  quizzes: Quiz[]
  categories: QuizCategory[]
  selectedQuiz: Quiz | null
  markdownContent: string
  isLoading: boolean
  error: string | null
  
  // Actions
  setSelectedQuiz: (quizId: string | null) => void
  setSelectedCategory: (categoryId: string | null) => void
  setPaneWidth: (pane: 'quizList' | 'editor', width: number) => void
  setActivePane: (pane: 'list' | 'editor') => void
  setMarkdownContent: (content: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  loadQuizzes: () => Promise<void>
  loadCategories: () => Promise<void>
  loadQuizById: (quizId: string) => Promise<void>
  saveQuiz: () => Promise<void>
  createQuiz: () => Promise<void>
  deleteQuiz: (quizId: string) => Promise<void>
}

// Repository interfaces

export interface QuizRepository {
  getQuizzes(): Promise<Quiz[]>
  getQuizById(id: string): Promise<Quiz | null>
  createQuiz(quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>): Promise<Quiz>
  updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz>
  deleteQuiz(id: string): Promise<void>
  getCategories(): Promise<QuizCategory[]>
  createCategory(category: Omit<QuizCategory, 'id' | 'created_at'>): Promise<QuizCategory>
}