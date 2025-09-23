// Type guards and functional validation - no external dependencies
// Simple, debuggable validation functions

import { SimpleQuestion, SimpleQuiz, SimpleSection } from './simple-types'

// Type guards
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

// Question validation
export function isValidQuestion(data: unknown): data is SimpleQuestion {
  if (!isObject(data)) return false

  return isString(data.question_text) &&
         data.question_text.trim().length > 0 &&
         ['multiple_choice', 'true_false', 'text_input'].includes(data.question_type as string) &&
         isNumber(data.order_index)
}

// Section validation
export function isValidSection(data: unknown): data is SimpleSection {
  if (!isObject(data)) return false

  return isString(data.title) &&
         data.title.trim().length > 0 &&
         isNumber(data.order_index)
}

// Quiz validation
export function isValidQuiz(data: unknown): data is SimpleQuiz {
  if (!isObject(data)) return false

  return isString(data.title) &&
         data.title.trim().length > 0 &&
         isArray(data.questions) &&
         isArray(data.sections) &&
         isBoolean(data.published)
}

// Validation result type
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Comprehensive quiz validation
export function validateQuizData(data: unknown): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Basic structure check
  if (!isObject(data)) {
    return {
      isValid: false,
      errors: ['Quiz data must be an object'],
      warnings: []
    }
  }

  // Title validation
  if (!isString(data.title) || data.title.trim().length === 0) {
    errors.push('Quiz title is required')
  }

  // Questions validation
  if (!isArray(data.questions)) {
    errors.push('Questions must be an array')
  } else if (data.questions.length === 0) {
    errors.push('Quiz must have at least one question')
  } else {
    // Validate each question
    data.questions.forEach((question, index) => {
      if (!isValidQuestion(question)) {
        errors.push(`Question ${index + 1} is invalid`)
      } else {
        // Additional question checks
        if (!question.question_text.trim()) {
          errors.push(`Question ${index + 1} text is empty`)
        }
        if (question.question_type === 'multiple_choice' && question.options) {
          const choices = (question.options as any)?.choices
          if (!isArray(choices) || choices.length < 2) {
            warnings.push(`Question ${index + 1} should have at least 2 choices`)
          }
        }
      }
    })
  }

  // Sections validation
  if (!isArray(data.sections)) {
    errors.push('Sections must be an array')
  } else {
    data.sections.forEach((section, index) => {
      if (!isValidSection(section)) {
        errors.push(`Section ${index + 1} is invalid`)
      }
    })
  }

  // Settings validation (basic check)
  if (data.settings && !isObject(data.settings)) {
    warnings.push('Quiz settings should be an object')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Data sanitization functions
export function sanitizeQuizData(data: any): SimpleQuiz {
  // Ensure all required fields exist with defaults
  return {
    id: data.id || undefined,
    title: String(data.title || 'Untitled Quiz').trim(),
    description: data.description ? String(data.description) : undefined,
    category_id: data.category_id || undefined,
    settings: isObject(data.settings) ? data.settings : {},
    published: Boolean(data.published),
    questions: isArray(data.questions) ? data.questions.map(sanitizeQuestion) : [],
    sections: isArray(data.sections) ? data.sections.map(sanitizeSection) : [],
    created_at: data.created_at,
    updated_at: data.updated_at
  }
}

export function sanitizeQuestion(data: any, index: number = 0): SimpleQuestion {
  return {
    id: data.id || undefined,
    section_id: data.section_id || undefined,
    question_text: String(data.question_text || '').trim(),
    question_type: ['multiple_choice', 'true_false', 'text_input'].includes(data.question_type)
      ? data.question_type
      : 'multiple_choice',
    options: data.options || {},
    answer_data: data.answer_data || {},
    order_index: isNumber(data.order_index) ? data.order_index : index,
    created_at: data.created_at,
    updated_at: data.updated_at
  }
}

export function sanitizeSection(data: any, index: number = 0): SimpleSection {
  return {
    id: data.id || undefined,
    quiz_id: data.quiz_id || undefined,
    title: String(data.title || 'Untitled Section').trim(),
    description: data.description ? String(data.description) : undefined,
    order_index: isNumber(data.order_index) ? data.order_index : index,
    settings: isObject(data.settings) ? data.settings : {},
    questions: isArray(data.questions) ? data.questions.map(sanitizeQuestion) : [],
    created_at: data.created_at,
    updated_at: data.updated_at
  }
}