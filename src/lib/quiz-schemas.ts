// Strict TypeScript schemas with runtime validation for quiz data
// Prevents data format inconsistencies across the entire pipeline

import { z } from 'zod'

// ============================================================================
// CORE QUESTION SCHEMAS
// ============================================================================

// Multiple Choice Question Schema
export const MultipleChoiceOptionSchema = z.object({
  id: z.number().int().min(0),
  text: z.string().min(1, 'Choice text cannot be empty')
})

export const MultipleChoiceOptionsSchema = z.object({
  choices: z.array(MultipleChoiceOptionSchema).min(2, 'Multiple choice questions need at least 2 choices'),
  correct_index: z.number().int().min(0)
}).refine(
  (data) => data.correct_index < data.choices.length,
  {
    message: "correct_index must be within choices array bounds",
    path: ["correct_index"]
  }
)

// True/False Question Schema
export const TrueFalseOptionSchema = z.object({
  choices: z.array(z.object({
    id: z.literal(0).or(z.literal(1)),
    text: z.enum(['True', 'False'])
  })).length(2)
})

export const TrueFalseAnswerSchema = z.object({
  correct_answer: z.boolean(),
  explanation: z.string().optional()
})

// Text Input Question Schema
export const TextInputAnswerSchema = z.object({
  correct_answer: z.string().min(1, 'Text input answer cannot be empty'),
  case_sensitive: z.boolean().optional().default(false),
  allow_partial_match: z.boolean().optional().default(false)
})

// ============================================================================
// UNIFIED QUESTION SCHEMA
// ============================================================================

// Base question schema that all question types extend
const BaseQuestionSchema = z.object({
  id: z.string().uuid().optional(),
  section_id: z.string().uuid().optional(),
  question_text: z.string().min(1, 'Question text cannot be empty'),
  question_content: z.record(z.unknown()).default({}),
  order_index: z.number().int().min(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

// Multiple Choice Question
export const MultipleChoiceQuestionSchema = BaseQuestionSchema.extend({
  question_type: z.literal('multiple_choice'),
  options: MultipleChoiceOptionsSchema,
  answer_data: z.record(z.unknown()).default({})
})

// True/False Question
export const TrueFalseQuestionSchema = BaseQuestionSchema.extend({
  question_type: z.literal('true_false'),
  options: TrueFalseOptionSchema,
  answer_data: TrueFalseAnswerSchema
})

// Text Input Question
export const TextInputQuestionSchema = BaseQuestionSchema.extend({
  question_type: z.literal('text_input'),
  options: z.record(z.unknown()).default({}),
  answer_data: TextInputAnswerSchema
})

// Union of all question types
export const QuestionSchema = z.union([
  MultipleChoiceQuestionSchema,
  TrueFalseQuestionSchema,
  TextInputQuestionSchema
])

// ============================================================================
// SECTION SCHEMA
// ============================================================================

export const QuizSectionSchema = z.object({
  id: z.string().uuid().optional(),
  quiz_id: z.string().uuid(),
  title: z.string().min(1, 'Section title cannot be empty'),
  description: z.string().optional(),
  order_index: z.number().int().min(0),
  settings: z.object({
    time_limit_minutes: z.number().positive().optional(),
    allow_backward_navigation: z.boolean().optional(),
    allowed_question_types: z.array(z.enum(['multiple_choice', 'true_false', 'text_input'])).optional(),
    show_section_feedback: z.boolean().optional(),
    passing_threshold: z.number().min(0).max(100).optional(),
    require_completion_before_next: z.boolean().optional(),
    points_per_question: z.number().positive().optional(),
    show_progress_bar: z.boolean().optional(),
    shuffle_questions: z.boolean().optional(),
    questions_per_page: z.number().positive().optional(),
    section_summary_enabled: z.boolean().optional()
  }).default({}),
  questions: z.array(QuestionSchema).optional().default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

// ============================================================================
// QUIZ SCHEMA
// ============================================================================

export const QuizSettingsSchema = z.object({
  structure_type: z.enum(['mixed', 'sectioned']).default('mixed'),
  time_limit: z.number().positive().optional(),
  show_feedback: z.boolean().optional(),
  randomize_questions: z.boolean().optional(),
  passing_score: z.number().min(0).max(100).optional(),
  max_attempts: z.number().positive().optional(),
  show_correct_answers: z.boolean().optional(),
  allow_review: z.boolean().optional()
})

export const QuizSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Quiz title cannot be empty'),
  description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  settings: QuizSettingsSchema.default({}),
  published: z.boolean().default(false),
  questions: z.array(QuestionSchema).default([]),
  sections: z.array(QuizSectionSchema).default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

// ============================================================================
// PARSED QUIZ SCHEMAS (for markdown parser output)
// ============================================================================

// Base parsed question schema (without the optional database fields)
const BaseParsedQuestionSchema = z.object({
  id: z.string().uuid().optional(),
  section_id: z.string().uuid().optional(),
  question_text: z.string().min(1, 'Question text cannot be empty'),
  question_content: z.record(z.unknown()).default({}),
  order_index: z.number().int().min(0)
})

// Parsed Multiple Choice Question
export const ParsedMultipleChoiceQuestionSchema = BaseParsedQuestionSchema.extend({
  question_type: z.literal('multiple_choice'),
  options: MultipleChoiceOptionsSchema,
  answer_data: z.record(z.unknown()).default({})
})

// Parsed True/False Question
export const ParsedTrueFalseQuestionSchema = BaseParsedQuestionSchema.extend({
  question_type: z.literal('true_false'),
  options: TrueFalseOptionSchema,
  answer_data: TrueFalseAnswerSchema
})

// Parsed Text Input Question
export const ParsedTextInputQuestionSchema = BaseParsedQuestionSchema.extend({
  question_type: z.literal('text_input'),
  options: z.record(z.unknown()).default({}),
  answer_data: TextInputAnswerSchema
})

// Union of all parsed question types
export const ParsedQuestionSchema = z.union([
  ParsedMultipleChoiceQuestionSchema,
  ParsedTrueFalseQuestionSchema,
  ParsedTextInputQuestionSchema
])

export const ParsedSectionSchema = z.object({
  id: z.string().uuid().optional(),
  quiz_id: z.string().uuid().optional(),
  title: z.string().min(1, 'Section title cannot be empty'),
  description: z.string().optional(),
  order_index: z.number().int().min(0),
  settings: z.object({
    time_limit_minutes: z.number().positive().optional(),
    allow_backward_navigation: z.boolean().optional(),
    allowed_question_types: z.array(z.enum(['multiple_choice', 'true_false', 'text_input'])).optional(),
    show_section_feedback: z.boolean().optional(),
    passing_threshold: z.number().min(0).max(100).optional(),
    require_completion_before_next: z.boolean().optional(),
    points_per_question: z.number().positive().optional(),
    show_progress_bar: z.boolean().optional(),
    shuffle_questions: z.boolean().optional(),
    questions_per_page: z.number().positive().optional(),
    section_summary_enabled: z.boolean().optional()
  }).default({}),
  questions: z.array(ParsedQuestionSchema).default([])
})

export const ParsedQuizSchema = z.object({
  title: z.string().min(1, 'Quiz title cannot be empty'),
  description: z.string().optional(),
  questions: z.array(ParsedQuestionSchema).default([]),
  sections: z.array(ParsedSectionSchema).default([]),
  settings: QuizSettingsSchema.default({}),
  structure_type: z.enum(['mixed', 'sectioned']).default('mixed')
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type MultipleChoiceOption = z.infer<typeof MultipleChoiceOptionSchema>
export type MultipleChoiceOptions = z.infer<typeof MultipleChoiceOptionsSchema>
export type TrueFalseOption = z.infer<typeof TrueFalseOptionSchema>
export type TrueFalseAnswer = z.infer<typeof TrueFalseAnswerSchema>
export type TextInputAnswer = z.infer<typeof TextInputAnswerSchema>

export type Question = z.infer<typeof QuestionSchema>
export type MultipleChoiceQuestion = z.infer<typeof MultipleChoiceQuestionSchema>
export type TrueFalseQuestion = z.infer<typeof TrueFalseQuestionSchema>
export type TextInputQuestion = z.infer<typeof TextInputQuestionSchema>

export type QuizSection = z.infer<typeof QuizSectionSchema>
export type QuizSettings = z.infer<typeof QuizSettingsSchema>
export type Quiz = z.infer<typeof QuizSchema>

export type ParsedQuestion = z.infer<typeof ParsedQuestionSchema>
export type ParsedSection = z.infer<typeof ParsedSectionSchema>
export type ParsedQuiz = z.infer<typeof ParsedQuizSchema>

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export class QuizValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError['errors'],
    public field?: string
  ) {
    super(message)
    this.name = 'QuizValidationError'
  }
}

// Safe validation functions that return results instead of throwing
export const validateQuestion = (data: unknown): { success: true; data: Question } | { success: false; error: QuizValidationError } => {
  try {
    const validated = QuestionSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: new QuizValidationError(
          'Question validation failed',
          error.errors,
          'question'
        )
      }
    }
    throw error
  }
}

export const validateQuiz = (data: unknown): { success: true; data: Quiz } | { success: false; error: QuizValidationError } => {
  try {
    const validated = QuizSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: new QuizValidationError(
          'Quiz validation failed',
          error.errors,
          'quiz'
        )
      }
    }
    throw error
  }
}

export const validateParsedQuiz = (data: unknown): { success: true; data: ParsedQuiz } | { success: false; error: QuizValidationError } => {
  try {
    const validated = ParsedQuizSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: new QuizValidationError(
          'Parsed quiz validation failed',
          error.errors,
          'parsed_quiz'
        )
      }
    }
    throw error
  }
}

// Strict validation functions that throw errors (for critical paths)
export const strictValidateQuestion = (data: unknown): Question => {
  return QuestionSchema.parse(data)
}

export const strictValidateQuiz = (data: unknown): Quiz => {
  return QuizSchema.parse(data)
}

export const strictValidateParsedQuiz = (data: unknown): ParsedQuiz => {
  return ParsedQuizSchema.parse(data)
}

// Helper to format validation errors for user display
export const formatValidationError = (error: QuizValidationError): string => {
  const fieldErrors = error.errors.map(err => {
    const path = err.path.length > 0 ? err.path.join('.') : 'root'
    return `${path}: ${err.message}`
  })

  return `Validation failed:\n${fieldErrors.join('\n')}`
}