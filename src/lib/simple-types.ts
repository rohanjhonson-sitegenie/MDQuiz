// Simple TypeScript interfaces - no complex validation, maximum reliability
// Replaces the complex Zod validation system with basic runtime checks

// ============================================================================
// CORE QUESTION TYPES
// ============================================================================

export interface MultipleChoiceOption {
  id: number
  text: string
}

export interface MultipleChoiceOptions {
  choices: MultipleChoiceOption[]
  correct_index: number
}

export interface TrueFalseAnswer {
  correct_answer: boolean
  explanation?: string
}

export interface TextInputAnswer {
  correct_answer: string
  case_sensitive?: boolean
  allow_partial_match?: boolean
}

// ============================================================================
// QUESTION TYPES
// ============================================================================

interface BaseQuestion {
  id?: string
  section_id?: string
  question_text: string
  question_content?: Record<string, any>
  order_index: number
  created_at?: string
  updated_at?: string
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  question_type: 'multiple_choice'
  options: MultipleChoiceOptions
  answer_data?: Record<string, any>
}

export interface TrueFalseQuestion extends BaseQuestion {
  question_type: 'true_false'
  options: Record<string, any>
  answer_data: TrueFalseAnswer
}

export interface TextInputQuestion extends BaseQuestion {
  question_type: 'text_input'
  options?: Record<string, any>
  answer_data: TextInputAnswer
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | TextInputQuestion

// ============================================================================
// SECTION TYPES
// ============================================================================

export interface QuizSectionSettings {
  time_limit_minutes?: number
  allow_backward_navigation?: boolean
  allowed_question_types?: string[]
  show_section_feedback?: boolean
  passing_threshold?: number
  require_completion_before_next?: boolean
  points_per_question?: number
  show_progress_bar?: boolean
  shuffle_questions?: boolean
  questions_per_page?: number
  section_summary_enabled?: boolean
}

export interface QuizSection {
  id?: string
  quiz_id?: string
  title: string
  description?: string
  order_index: number
  settings?: QuizSectionSettings
  questions?: Question[]
  created_at?: string
  updated_at?: string
}

// ============================================================================
// QUIZ TYPES
// ============================================================================

export interface QuizSettings {
  structure_type?: 'mixed' | 'sectioned'
  time_limit?: number
  show_feedback?: boolean
  randomize_questions?: boolean
  passing_score?: number
  max_attempts?: number
  show_correct_answers?: boolean
  allow_review?: boolean
}

export interface Quiz {
  id: string
  title: string
  description?: string
  category_id?: string
  settings?: QuizSettings
  published?: boolean
  questions?: Question[]
  sections?: QuizSection[]
  created_at?: string
  updated_at?: string
}

// ============================================================================
// SIMPLE VALIDATION FUNCTIONS
// ============================================================================

// Fix for "object object" display issue
export function safeDisplayText(value: any): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    // Handle common object cases
    if (value.text) return String(value.text)
    if (value.title) return String(value.title)
    if (value.label) return String(value.label)
    return JSON.stringify(value) // Better than "[object Object]"
  }
  return String(value)
}

// Basic validation without throwing errors
export function validateQuestion(question: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!question.question_text) errors.push('Question text is required')
  if (!question.question_type) errors.push('Question type is required')
  if (typeof question.order_index !== 'number') errors.push('Order index must be a number')

  // Type-specific validation
  if (question.question_type === 'multiple_choice') {
    if (!question.options?.choices?.length) errors.push('Multiple choice questions need choices')
    if (typeof question.options?.correct_index !== 'number') errors.push('Correct index is required')
  }

  return { valid: errors.length === 0, errors }
}

export function validateQuiz(quiz: any): { valid: boolean; errors: string[]; canPublish?: boolean } {
  const errors: string[] = []

  if (!quiz.title) errors.push('Quiz title is required')
  if (!quiz.id) errors.push('Quiz ID is required')

  // Check if quiz has questions (either standalone or in sections)
  const hasQuestions = (quiz.questions && quiz.questions.length > 0) ||
                      (quiz.sections && quiz.sections.some((section: any) => section.questions && section.questions.length > 0))

  if (!hasQuestions) {
    errors.push('Quiz must have at least one question')
  }

  // Validate standalone questions if present
  if (quiz.questions) {
    quiz.questions.forEach((question: any, index: number) => {
      const questionValidation = validateQuestion(question)
      if (!questionValidation.valid) {
        errors.push(`Question ${index + 1}: ${questionValidation.errors.join(', ')}`)
      }
    })
  }

  // Validate section questions if present
  if (quiz.sections) {
    quiz.sections.forEach((section: any, sectionIndex: number) => {
      if (!section.title) {
        errors.push(`Section ${sectionIndex + 1} must have a title`)
      }
      if (section.questions) {
        section.questions.forEach((question: any, questionIndex: number) => {
          const questionValidation = validateQuestion(question)
          if (!questionValidation.valid) {
            errors.push(`Section "${section.title}" Question ${questionIndex + 1}: ${questionValidation.errors.join(', ')}`)
          }
        })
      }
    })
  }

  const canPublish = errors.length === 0 && hasQuestions

  return { valid: errors.length === 0, errors, canPublish }
}

// ============================================================================
// SIMPLE DATA HELPERS
// ============================================================================

// Ensure objects have required fields with defaults
export function normalizeQuiz(data: any): Quiz {
  return {
    id: data.id || '',
    title: data.title || 'Untitled Quiz',
    description: data.description || '',
    category_id: data.category_id,
    settings: {
      structure_type: 'mixed',
      ...data.settings
    },
    published: Boolean(data.published),
    questions: Array.isArray(data.questions) ? data.questions : [],
    sections: Array.isArray(data.sections) ? data.sections : [],
    created_at: data.created_at,
    updated_at: data.updated_at
  }
}

// Safe JSON parsing for database fields
export function safeJsonParse(value: any, fallback: any = {}) {
  if (typeof value === 'object' && value !== null) return value
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  }
  return fallback
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class SimpleValidationError extends Error {
  constructor(message: string, public details: string[] = []) {
    super(message)
    this.name = 'SimpleValidationError'
  }
}

// User-friendly error formatting
export function formatErrors(errors: string[]): string {
  if (errors.length === 0) return ''
  if (errors.length === 1) return errors[0]
  return `Multiple issues found:\n• ${errors.join('\n• ')}`
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

export interface QuizStore {
  // Navigation state
  selectedQuizId: string | null
  selectedCategoryId: string | null
  paneWidths: {
    quizList: number
    editor: number
  }
  activePane: 'list' | 'editor'
  quizPanelCollapsed: boolean

  // Data state
  quizzes: Quiz[]
  categories: any[]
  sections: QuizSection[]
  selectedQuiz: Quiz | null
  selectedSectionId: string | null
  markdownContent: string
  isLoading: boolean
  error: string | null

  // Navigation actions
  setSelectedQuiz: (quizId: string | null) => void
  setSelectedCategory: (categoryId: string | null) => void
  setSelectedSection: (sectionId: string | null) => void
  setPaneWidth: (pane: 'quizList' | 'editor', width: number) => void
  setActivePane: (pane: 'list' | 'editor') => void
  toggleQuizPanel: () => void
  setMarkdownContent: (content: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Data loading actions
  loadQuizzes: () => Promise<void>
  loadCategories: () => Promise<void>
  loadQuizById: (quizId: string) => Promise<void>

  // Quiz operations
  createQuiz: () => Promise<void>
  saveQuiz: () => Promise<void>
  deleteQuiz: (quizId: string) => Promise<void>
  publishQuiz: (quizId?: string) => Promise<void>
  unpublishQuiz: (quizId?: string) => Promise<void>

  // Section Management Actions
  loadSections: (quizId: string) => Promise<void>
  createSection: (quizId: string, title: string) => Promise<void>
  updateSection: (sectionId: string, updates: Partial<QuizSection>) => Promise<void>
  deleteSection: (sectionId: string) => Promise<void>
  reorderSections: (sectionOrders: { id: string; order_index: number }[]) => Promise<void>
  moveQuestionToSection: (questionId: string, sectionId: string | null) => Promise<void>
  toggleQuizStructure: (quizId: string, structureType: 'mixed' | 'sectioned') => Promise<void>

  // Question Management Actions
  createQuestion: (question: Omit<Question, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateQuestion: (questionId: string, updates: Partial<Question>) => Promise<void>
  deleteQuestion: (questionId: string) => Promise<void>
  reorderQuestions: (questionOrders: { id: string; order_index: number }[]) => Promise<void>
}