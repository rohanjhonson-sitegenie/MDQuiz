// Real-time quiz validation hook
// Provides validation state and canPublish boolean

import { useMemo } from 'react'
import { parseMarkdownQuiz } from '@/lib/markdown-quiz-parser'
import { validateQuiz, ValidationResult } from '@/lib/quiz-validation'

export function useQuizValidation(markdownContent: string) {
  const validation = useMemo(() => {
    if (!markdownContent?.trim()) {
      return {
        isValid: false,
        errors: ['Markdown content is required'],
        questionErrors: [],
        canPublish: false
      } as ValidationResult
    }

    try {
      const parsedQuiz = parseMarkdownQuiz(markdownContent)

      // Flatten questions from sections if needed for validation
      let questionsToValidate = parsedQuiz.questions || []
      if (parsedQuiz.structure_type === 'sectioned' && parsedQuiz.sections.length > 0) {
        questionsToValidate = parsedQuiz.sections.flatMap(section =>
          section.questions || []
        )
      }

      // Create validation object with flattened questions
      const quizForValidation = {
        ...parsedQuiz,
        questions: questionsToValidate
      }

      return validateQuiz(quizForValidation)
    } catch (error) {
      return {
        isValid: false,
        errors: [`Parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        questionErrors: [],
        canPublish: false
      } as ValidationResult
    }
  }, [markdownContent])

  return {
    validation,
    canPublish: validation.canPublish,
    hasErrors: !validation.isValid,
    errorCount: validation.errors.length,
    questionErrorCount: validation.questionErrors.filter(q => !q.isValid).length
  }
}