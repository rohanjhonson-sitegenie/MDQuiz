// Question type validation configuration
// Simple config object with validation rules for each question type

import { QuestionType } from '@/types/quiz.types'

export interface QuestionTypeValidation {
  requiredFields: string[]
  validate: (question: Record<string, unknown>) => string[]
}

export const questionTypeValidations: Record<QuestionType, QuestionTypeValidation> = {
  multiple_choice: {
    requiredFields: ['question_text', 'options'],
    validate: (question) => {
      const errors: string[] = []

      if (!question.question_text || typeof question.question_text !== 'string' || !question.question_text.trim()) {
        errors.push('Question text is required')
      }

      const choices = (question.options as any)?.choices
      if (!choices || !Array.isArray(choices) || choices.length < 2) {
        errors.push('Multiple choice questions must have at least 2 options')
      }

      // NEW SCHEMA: Check for correct_index (single number) instead of correct_answers (array)
      const correctIndex = (question.options as any)?.correct_index
      if (correctIndex === undefined || correctIndex === null) {
        errors.push('Multiple choice questions must have at least one correct answer')
      }

      return errors
    }
  },

  true_false: {
    requiredFields: ['question_text', 'answer_data'],
    validate: (question) => {
      const errors: string[] = []

      if (!question.question_text || typeof question.question_text !== 'string' || !question.question_text.trim()) {
        errors.push('Question text is required')
      }

      // NEW SCHEMA: Check for correct_answer (boolean) instead of correct_answers (array)
      const correctAnswer = (question.answer_data as any)?.correct_answer
      if (correctAnswer === undefined || correctAnswer === null) {
        errors.push('True/false questions must have exactly one correct answer')
      }

      return errors
    }
  },

  text_input: {
    requiredFields: ['question_text', 'answer_data'],
    validate: (question) => {
      const errors: string[] = []

      if (!question.question_text || typeof question.question_text !== 'string' || !question.question_text.trim()) {
        errors.push('Question text is required')
      }

      // NEW SCHEMA: Check for correct_answer (string) instead of correct_answers (array)
      const correctAnswer = (question.answer_data as any)?.correct_answer
      if (!correctAnswer || typeof correctAnswer !== 'string' || !correctAnswer.trim()) {
        errors.push('Text input questions must have a correct answer')
      }

      return errors
    }
  }
}