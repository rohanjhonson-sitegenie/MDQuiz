// Question Type Registry System
// Provides dynamic validation and configuration for different question types

import { z } from 'zod'
import type { QuestionType } from '../types/quiz.types'

export interface QuestionTypeDefinition {
  type: QuestionType
  displayName: string
  description: string
  validationSchema: z.ZodSchema
  defaultOptions: Record<string, any>
  defaultAnswerData: Record<string, any>
  uiComponent: string
  category: 'objective' | 'subjective'
  maxPoints: number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

// Question type definitions with validation schemas
export const QUESTION_TYPE_REGISTRY: Record<QuestionType, QuestionTypeDefinition> = {
  multiple_choice: {
    type: 'multiple_choice',
    displayName: 'Multiple Choice',
    description: 'Single or multiple correct answers from a list of options',
    category: 'objective',
    maxPoints: 10,
    validationSchema: z.object({
      choices: z.array(z.string().min(1, 'Choice cannot be empty')).min(2, 'At least 2 choices required').max(10, 'Maximum 10 choices allowed'),
      correct_index: z.number().min(0).optional(),
      correct_indices: z.array(z.number().min(0)).optional(),
      allow_multiple: z.boolean().default(false),
      case_sensitive: z.boolean().default(false)
    }).refine(data => {
      if (data.allow_multiple) {
        return data.correct_indices && data.correct_indices.length > 0
      } else {
        return typeof data.correct_index === 'number'
      }
    }, {
      message: 'Must specify correct answer(s)'
    }),
    defaultOptions: {
      choices: ['Option A', 'Option B', 'Option C'],
      allow_multiple: false,
      case_sensitive: false,
      correct_index: 0
    },
    defaultAnswerData: {
      correct_answer: 'Option A',
      points: 1,
      explanation: ''
    },
    uiComponent: 'MultipleChoiceEditor'
  },

  true_false: {
    type: 'true_false',
    displayName: 'True/False',
    description: 'Binary choice between true and false',
    category: 'objective',
    maxPoints: 5,
    validationSchema: z.object({
      display_as: z.enum(['true_false', 'yes_no', 'correct_incorrect']).default('true_false')
    }),
    defaultOptions: {
      display_as: 'true_false'
    },
    defaultAnswerData: {
      correct_answer: true,
      points: 1,
      explanation: ''
    },
    uiComponent: 'TrueFalseEditor'
  },

  text_input: {
    type: 'text_input',
    displayName: 'Short Answer',
    description: 'Free text response with flexible validation',
    category: 'subjective',
    maxPoints: 15,
    validationSchema: z.object({
      min_length: z.number().min(0).optional(),
      max_length: z.number().min(1).max(1000).optional(),
      case_sensitive: z.boolean().default(false),
      allow_partial_credit: z.boolean().default(false),
      validation_type: z.enum(['exact_match', 'contains', 'regex', 'keywords']).default('exact_match'),
      keywords: z.array(z.string()).optional(),
      regex_pattern: z.string().optional()
    }).refine(data => {
      if (data.max_length && data.min_length && data.max_length < data.min_length) {
        return false
      }
      return true
    }, {
      message: 'Maximum length must be greater than minimum length'
    }),
    defaultOptions: {
      min_length: 1,
      max_length: 200,
      case_sensitive: false,
      allow_partial_credit: true,
      validation_type: 'contains'
    },
    defaultAnswerData: {
      correct_answer: '',
      points: 1,
      explanation: '',
      keywords: []
    },
    uiComponent: 'TextInputEditor'
  }
}

// Enhanced question type utilities
export class QuestionTypeRegistry {
  static getDefinition(type: QuestionType): QuestionTypeDefinition | null {
    return QUESTION_TYPE_REGISTRY[type] || null
  }

  static getAllTypes(): QuestionTypeDefinition[] {
    return Object.values(QUESTION_TYPE_REGISTRY)
  }

  static getTypesByCategory(category: 'objective' | 'subjective'): QuestionTypeDefinition[] {
    return Object.values(QUESTION_TYPE_REGISTRY).filter(def => def.category === category)
  }

  static validateQuestionOptions(type: QuestionType, options: any): ValidationResult {
    const definition = this.getDefinition(type)
    if (!definition) {
      return {
        isValid: false,
        errors: [`Unknown question type: ${type}`]
      }
    }

    try {
      definition.validationSchema.parse(options)
      return {
        isValid: true,
        errors: []
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }
      }
      return {
        isValid: false,
        errors: ['Validation failed']
      }
    }
  }

  static createDefaultQuestion(type: QuestionType): {
    question_type: QuestionType
    options: Record<string, any>
    answer_data: Record<string, any>
  } {
    const definition = this.getDefinition(type)
    if (!definition) {
      throw new Error(`Unknown question type: ${type}`)
    }

    return {
      question_type: type,
      options: { ...definition.defaultOptions },
      answer_data: { ...definition.defaultAnswerData }
    }
  }

  static getMaxPointsForType(type: QuestionType): number {
    const definition = this.getDefinition(type)
    return definition?.maxPoints || 1
  }

  static isObjectiveType(type: QuestionType): boolean {
    const definition = this.getDefinition(type)
    return definition?.category === 'objective'
  }

  static isSubjectiveType(type: QuestionType): boolean {
    const definition = this.getDefinition(type)
    return definition?.category === 'subjective'
  }
}

// Section validation utilities
export class SectionValidator {
  static validateSectionSettings(settings: any): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate allowed question types
    if (settings.allowed_question_types) {
      const validTypes = Object.keys(QUESTION_TYPE_REGISTRY)
      const invalidTypes = settings.allowed_question_types.filter(
        (type: string) => !validTypes.includes(type)
      )
      if (invalidTypes.length > 0) {
        errors.push(`Invalid question types: ${invalidTypes.join(', ')}`)
      }
    }

    // Validate time limits
    if (settings.time_limit_minutes && settings.time_limit_minutes < 1) {
      errors.push('Time limit must be at least 1 minute')
    }

    // Validate question count limit
    if (settings.question_count_limit && settings.question_count_limit < 1) {
      errors.push('Question count limit must be at least 1')
    }

    // Validate points per question
    if (settings.points_per_question && settings.points_per_question < 0) {
      errors.push('Points per question cannot be negative')
    }

    // Validate questions per page
    if (settings.questions_per_page && settings.questions_per_page < 1) {
      errors.push('Questions per page must be at least 1')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  static validateQuestionsAgainstSection(questions: any[], sectionSettings: any): ValidationResult {
    const errors: string[] = []

    // Check allowed question types
    if (sectionSettings.allowed_question_types) {
      const disallowedQuestions = questions.filter(
        q => !sectionSettings.allowed_question_types.includes(q.question_type)
      )
      if (disallowedQuestions.length > 0) {
        errors.push(`${disallowedQuestions.length} questions have disallowed types for this section`)
      }
    }

    // Check question count limit
    if (sectionSettings.question_count_limit && questions.length > sectionSettings.question_count_limit) {
      errors.push(`Section has ${questions.length} questions but limit is ${sectionSettings.question_count_limit}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}