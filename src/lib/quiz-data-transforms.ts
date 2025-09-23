// Data transformation layer for quiz data between different formats
// Handles conversions between parser output, database format, and display format

import {
  type ParsedQuiz,
  type ParsedQuestion,
  type ParsedSection,
  type Quiz,
  type Question,
  type QuizSection,
  strictValidateParsedQuiz,
  strictValidateQuiz,
  validateParsedQuiz,
  validateQuiz,
  QuizValidationError,
  formatValidationError
} from './quiz-schemas'

// ============================================================================
// DATABASE SERIALIZATION LAYER
// ============================================================================

/**
 * Transforms parsed quiz data to database-safe format
 * Ensures all JSON fields are properly structured and validated
 */
export const serializeQuizForDatabase = (parsedQuiz: ParsedQuiz, quizId: string): Quiz => {
  // Validate input
  const validation = validateParsedQuiz(parsedQuiz)
  if (!validation.success) {
    throw new Error(`Cannot serialize invalid parsed quiz: ${formatValidationError(validation.error)}`)
  }

  const validated = validation.data

  // Transform questions with proper database structure
  const serializedQuestions: Question[] = validated.questions.map((question, index) => {
    const baseQuestion = {
      id: question.id || undefined, // Let database generate if not provided
      section_id: question.section_id,
      question_text: question.question_text,
      question_type: question.question_type,
      question_content: question.question_content,
      order_index: question.order_index ?? index
    }

    // Ensure options and answer_data are properly structured based on question type
    switch (question.question_type) {
      case 'multiple_choice':
        return {
          ...baseQuestion,
          question_type: 'multiple_choice' as const,
          options: {
            choices: question.options.choices,
            correct_index: question.options.correct_index
          },
          answer_data: question.answer_data || {}
        }

      case 'true_false':
        return {
          ...baseQuestion,
          question_type: 'true_false' as const,
          options: {
            choices: [
              { id: 0, text: 'True' },
              { id: 1, text: 'False' }
            ]
          },
          answer_data: {
            correct_answer: question.answer_data.correct_answer,
            explanation: question.answer_data.explanation
          }
        }

      case 'text_input':
        return {
          ...baseQuestion,
          question_type: 'text_input' as const,
          options: {},
          answer_data: {
            correct_answer: question.answer_data.correct_answer,
            case_sensitive: question.answer_data.case_sensitive ?? false,
            allow_partial_match: question.answer_data.allow_partial_match ?? false
          }
        }

      default:
        throw new Error(`Unknown question type: ${(question as any).question_type}`)
    }
  })

  // Transform sections
  const serializedSections: QuizSection[] = validated.sections.map((section, index) => ({
    id: section.id || undefined,
    quiz_id: quizId,
    title: section.title,
    description: section.description,
    order_index: section.order_index ?? index,
    settings: section.settings,
    questions: section.questions?.map(q => {
      const questionWithSection = { ...q, section_id: section.id }
      return serializeQuestionForDatabase(questionWithSection)
    }) || []
  }))

  const serialized: Quiz = {
    id: quizId,
    title: validated.title,
    description: validated.description,
    category_id: undefined, // Will be set by caller if needed
    settings: {
      ...validated.settings,
      structure_type: validated.structure_type
    },
    published: false, // Will be set by caller if needed
    questions: serializedQuestions,
    sections: serializedSections
  }

  // Validate output
  const outputValidation = validateQuiz(serialized)
  if (!outputValidation.success) {
    throw new Error(`Serialization produced invalid quiz: ${formatValidationError(outputValidation.error)}`)
  }

  return outputValidation.data
}

/**
 * Transforms a single parsed question to database format
 */
export const serializeQuestionForDatabase = (question: ParsedQuestion): Question => {
  const baseQuestion = {
    id: question.id,
    section_id: question.section_id,
    question_text: question.question_text,
    question_type: question.question_type,
    question_content: question.question_content,
    order_index: question.order_index
  }

  switch (question.question_type) {
    case 'multiple_choice':
      return {
        ...baseQuestion,
        question_type: 'multiple_choice' as const,
        options: {
          choices: question.options.choices,
          correct_index: question.options.correct_index
        },
        answer_data: question.answer_data || {}
      }

    case 'true_false':
      return {
        ...baseQuestion,
        question_type: 'true_false' as const,
        options: {
          choices: [
            { id: 0, text: 'True' },
            { id: 1, text: 'False' }
          ]
        },
        answer_data: {
          correct_answer: question.answer_data.correct_answer,
          explanation: question.answer_data.explanation
        }
      }

    case 'text_input':
      return {
        ...baseQuestion,
        question_type: 'text_input' as const,
        options: {},
        answer_data: {
          correct_answer: question.answer_data.correct_answer,
          case_sensitive: question.answer_data.case_sensitive ?? false,
          allow_partial_match: question.answer_data.allow_partial_match ?? false
        }
      }

    default:
      throw new Error(`Unknown question type: ${(question as any).question_type}`)
  }
}

// ============================================================================
// DATABASE DESERIALIZATION LAYER
// ============================================================================

/**
 * Transforms database quiz data to safe internal format
 * Handles legacy data formats and ensures consistency
 */
export const deserializeQuizFromDatabase = (dbQuiz: any): Quiz => {
  // Handle legacy or malformed data gracefully
  const normalizedQuiz = {
    id: dbQuiz.id,
    title: dbQuiz.title || 'Untitled Quiz',
    description: dbQuiz.description || '',
    category_id: dbQuiz.category_id,
    settings: normalizeQuizSettings(dbQuiz.settings),
    published: Boolean(dbQuiz.published),
    questions: (dbQuiz.questions || []).map(normalizeQuestion),
    sections: (dbQuiz.sections || []).map(normalizeSection),
    created_at: dbQuiz.created_at,
    updated_at: dbQuiz.updated_at
  }

  // Validate the normalized data
  const validation = validateQuiz(normalizedQuiz)
  if (!validation.success) {
    console.warn('Database quiz failed validation, attempting repair:', validation.error)
    return repairQuizData(normalizedQuiz)
  }

  return validation.data
}

/**
 * Normalizes question data from database, handling legacy formats
 */
const normalizeQuestion = (dbQuestion: any): Question => {
  // Handle options field that might be stringified JSON
  let options = {}
  if (typeof dbQuestion.options === 'string') {
    try {
      options = JSON.parse(dbQuestion.options)
    } catch (e) {
      console.warn('Failed to parse question options JSON:', e)
      options = {}
    }
  } else if (typeof dbQuestion.options === 'object' && dbQuestion.options !== null) {
    options = dbQuestion.options
  }

  // Handle answer_data field that might be stringified JSON
  let answerData = {}
  if (typeof dbQuestion.answer_data === 'string') {
    try {
      answerData = JSON.parse(dbQuestion.answer_data)
    } catch (e) {
      console.warn('Failed to parse answer_data JSON:', e)
      answerData = {}
    }
  } else if (typeof dbQuestion.answer_data === 'object' && dbQuestion.answer_data !== null) {
    answerData = dbQuestion.answer_data
  }

  // Normalize based on question type
  const questionType = dbQuestion.question_type || 'multiple_choice'

  switch (questionType) {
    case 'multiple_choice':
      return {
        id: dbQuestion.id,
        section_id: dbQuestion.section_id,
        question_text: dbQuestion.question_text || '',
        question_type: 'multiple_choice',
        question_content: dbQuestion.question_content || {},
        options: normalizeMultipleChoiceOptions(options),
        answer_data: answerData,
        order_index: dbQuestion.order_index || 0,
        created_at: dbQuestion.created_at,
        updated_at: dbQuestion.updated_at
      }

    case 'true_false':
      return {
        id: dbQuestion.id,
        section_id: dbQuestion.section_id,
        question_text: dbQuestion.question_text || '',
        question_type: 'true_false',
        question_content: dbQuestion.question_content || {},
        options: {
          choices: [
            { id: 0, text: 'True' },
            { id: 1, text: 'False' }
          ]
        },
        answer_data: normalizeTrueFalseAnswer(answerData),
        order_index: dbQuestion.order_index || 0,
        created_at: dbQuestion.created_at,
        updated_at: dbQuestion.updated_at
      }

    case 'text_input':
      return {
        id: dbQuestion.id,
        section_id: dbQuestion.section_id,
        question_text: dbQuestion.question_text || '',
        question_type: 'text_input',
        question_content: dbQuestion.question_content || {},
        options: {},
        answer_data: normalizeTextInputAnswer(answerData),
        order_index: dbQuestion.order_index || 0,
        created_at: dbQuestion.created_at,
        updated_at: dbQuestion.updated_at
      }

    default:
      // Default to multiple choice for unknown types
      return {
        id: dbQuestion.id,
        section_id: dbQuestion.section_id,
        question_text: dbQuestion.question_text || '',
        question_type: 'multiple_choice',
        question_content: dbQuestion.question_content || {},
        options: { choices: [], correct_index: 0 },
        answer_data: {},
        order_index: dbQuestion.order_index || 0,
        created_at: dbQuestion.created_at,
        updated_at: dbQuestion.updated_at
      }
  }
}

/**
 * Normalizes multiple choice options, handling various legacy formats
 */
const normalizeMultipleChoiceOptions = (options: any): { choices: Array<{ id: number; text: string }>; correct_index: number } => {
  if (!options || typeof options !== 'object') {
    return { choices: [], correct_index: 0 }
  }

  let choices: Array<{ id: number; text: string }> = []

  if (Array.isArray(options.choices)) {
    choices = options.choices.map((choice, index) => {
      if (typeof choice === 'string') {
        return { id: index, text: choice }
      } else if (choice && typeof choice === 'object') {
        return {
          id: typeof choice.id === 'number' ? choice.id : index,
          text: String(choice.text || choice.label || choice.value || `Option ${index + 1}`)
        }
      } else {
        return { id: index, text: `Option ${index + 1}` }
      }
    })
  }

  const correctIndex = typeof options.correct_index === 'number'
    ? Math.max(0, Math.min(options.correct_index, choices.length - 1))
    : 0

  return { choices, correct_index: correctIndex }
}

/**
 * Normalizes true/false answer data
 */
const normalizeTrueFalseAnswer = (answerData: any): { correct_answer: boolean; explanation?: string } => {
  return {
    correct_answer: Boolean(answerData?.correct_answer),
    explanation: answerData?.explanation || undefined
  }
}

/**
 * Normalizes text input answer data
 */
const normalizeTextInputAnswer = (answerData: any): { correct_answer: string; case_sensitive?: boolean; allow_partial_match?: boolean } => {
  return {
    correct_answer: String(answerData?.correct_answer || ''),
    case_sensitive: Boolean(answerData?.case_sensitive),
    allow_partial_match: Boolean(answerData?.allow_partial_match)
  }
}

/**
 * Normalizes quiz settings, providing defaults for missing values
 */
const normalizeQuizSettings = (settings: any): any => {
  if (!settings || typeof settings !== 'object') {
    return { structure_type: 'mixed' }
  }

  return {
    structure_type: settings.structure_type === 'sectioned' ? 'sectioned' : 'mixed',
    time_limit: typeof settings.time_limit === 'number' ? settings.time_limit : undefined,
    show_feedback: Boolean(settings.show_feedback),
    randomize_questions: Boolean(settings.randomize_questions),
    passing_score: typeof settings.passing_score === 'number' ? settings.passing_score : undefined,
    max_attempts: typeof settings.max_attempts === 'number' ? settings.max_attempts : undefined,
    show_correct_answers: Boolean(settings.show_correct_answers),
    allow_review: Boolean(settings.allow_review)
  }
}

/**
 * Normalizes section data from database
 */
const normalizeSection = (dbSection: any): QuizSection => {
  return {
    id: dbSection.id,
    quiz_id: dbSection.quiz_id,
    title: dbSection.title || 'Untitled Section',
    description: dbSection.description,
    order_index: dbSection.order_index || 0,
    settings: dbSection.settings || {},
    questions: (dbSection.questions || []).map(normalizeQuestion),
    created_at: dbSection.created_at,
    updated_at: dbSection.updated_at
  }
}

/**
 * Attempts to repair quiz data that failed validation
 */
const repairQuizData = (quiz: any): Quiz => {
  console.warn('Attempting to repair invalid quiz data')

  // Basic repair: ensure required fields exist
  const repaired = {
    id: quiz.id || 'temp-id',
    title: quiz.title || 'Untitled Quiz',
    description: quiz.description || '',
    category_id: quiz.category_id,
    settings: quiz.settings || { structure_type: 'mixed' },
    published: Boolean(quiz.published),
    questions: Array.isArray(quiz.questions) ? quiz.questions : [],
    sections: Array.isArray(quiz.sections) ? quiz.sections : [],
    created_at: quiz.created_at,
    updated_at: quiz.updated_at
  }

  // Try validation again
  const validation = validateQuiz(repaired)
  if (validation.success) {
    console.warn('Quiz data repair successful')
    return validation.data
  }

  // If still failing, return minimal valid quiz
  console.error('Quiz data repair failed, returning minimal valid quiz')
  return {
    id: quiz.id || 'temp-id',
    title: 'Corrupted Quiz (Repair Needed)',
    description: 'This quiz data was corrupted and needs manual repair',
    settings: { structure_type: 'mixed' },
    published: false,
    questions: [],
    sections: []
  }
}

// ============================================================================
// MARKDOWN CONVERSION UTILITIES
// ============================================================================

/**
 * Converts quiz data back to markdown format for editing
 */
export const quizToMarkdown = (quiz: Quiz): string => {
  let markdown = `# ${quiz.title}\n\n`

  if (quiz.description) {
    markdown += `${quiz.description}\n\n`
  }

  if (quiz.settings?.structure_type === 'sectioned' && quiz.sections.length > 0) {
    // Sectioned quiz format
    for (const section of quiz.sections) {
      markdown += `## Section: ${section.title}\n`

      if (section.description) {
        markdown += `${section.description}\n\n`
      }

      if (Object.keys(section.settings).length > 0) {
        const settingsStr = Object.entries(section.settings)
          .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
          .join(', ')
        markdown += `> Settings: ${settingsStr}\n\n`
      }

      for (const question of section.questions || []) {
        markdown += questionToMarkdown(question)
        markdown += '\n'
      }
    }
  } else {
    // Mixed quiz format
    for (const question of quiz.questions) {
      markdown += questionToMarkdown(question, true) // Use legacy format for mixed
      markdown += '\n'
    }
  }

  return markdown
}

/**
 * Converts a single question back to markdown format
 */
const questionToMarkdown = (question: Question, legacyFormat = false): string => {
  const headerLevel = legacyFormat ? '##' : '###'
  const questionNum = question.order_index + 1
  let markdown = `${headerLevel} Q${questionNum}\n${question.question_text}\n\n`

  switch (question.question_type) {
    case 'multiple_choice':
      const mcOptions = question.options as { choices: Array<{ id: number; text: string }>; correct_index: number }
      mcOptions.choices.forEach((choice) => {
        const isCorrect = choice.id === mcOptions.correct_index ? 'x' : ' '
        markdown += `- [${isCorrect}] ${choice.text}\n`
      })
      break

    case 'true_false':
      const tfAnswer = question.answer_data as { correct_answer: boolean; explanation?: string }
      const answer = tfAnswer.correct_answer ? 'True' : 'False'
      const explanation = tfAnswer.explanation || ''
      markdown += `${answer}: ${explanation}\n`
      break

    case 'text_input':
      const tiAnswer = question.answer_data as { correct_answer: string }
      markdown += `Answer: ${tiAnswer.correct_answer}\n`
      break
  }

  return markdown
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Deep clones and validates quiz data
 */
export const cloneAndValidateQuiz = (quiz: Quiz): Quiz => {
  const cloned = JSON.parse(JSON.stringify(quiz))
  return strictValidateQuiz(cloned)
}

/**
 * Safely extracts display text from question options (prevents "object object")
 */
export const extractDisplayText = (options: any): string => {
  if (!options) return 'No options'

  if (typeof options === 'string') {
    try {
      options = JSON.parse(options)
    } catch {
      return options.substring(0, 50) + (options.length > 50 ? '...' : '')
    }
  }

  if (options.choices && Array.isArray(options.choices)) {
    const choiceTexts = options.choices
      .map((choice: any) => {
        if (typeof choice === 'string') return choice
        if (choice && typeof choice === 'object') return choice.text || choice.label || String(choice)
        return String(choice)
      })
      .filter(Boolean)
      .slice(0, 3)

    return choiceTexts.join(', ') + (options.choices.length > 3 ? '...' : '')
  }

  return 'Options available'
}