// Quiz validation utility functions
// Simple validation system for quiz completeness and question validation

import { ParsedQuiz, ParsedQuestion } from './markdown-quiz-parser'
import { questionTypeValidations } from '@/config/questionTypes.config'

export interface QuestionValidationResult {
  questionIndex: number
  questionText: string
  errors: string[]
  isValid: boolean
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  questionErrors: QuestionValidationResult[]
  canPublish: boolean
}

export function validateQuestion(question: ParsedQuestion, index: number): QuestionValidationResult {
  const validation = questionTypeValidations[question.question_type]

  if (!validation) {
    return {
      questionIndex: index,
      questionText: question.question_text || `Question ${index + 1}`,
      errors: [`Unknown question type: ${question.question_type}`],
      isValid: false
    }
  }

  const errors = validation.validate(question)

  return {
    questionIndex: index,
    questionText: question.question_text || `Question ${index + 1}`,
    errors,
    isValid: errors.length === 0
  }
}

export function validateQuiz(quiz: ParsedQuiz): ValidationResult {
  const errors: string[] = []
  const questionErrors: QuestionValidationResult[] = []

  // Validate quiz title
  if (!quiz.title?.trim()) {
    errors.push('Quiz title is required')
  }

  // Validate questions exist
  if (!quiz.questions || quiz.questions.length === 0) {
    errors.push('Quiz must have at least one question')
  } else {
    // Validate each question
    quiz.questions.forEach((question, index) => {
      const questionValidation = validateQuestion(question, index)
      questionErrors.push(questionValidation)

      if (!questionValidation.isValid) {
        errors.push(`Question ${index + 1}: ${questionValidation.errors.join(', ')}`)
      }
    })
  }

  const isValid = errors.length === 0
  const canPublish = isValid

  return {
    isValid,
    errors,
    questionErrors,
    canPublish
  }
}