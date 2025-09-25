// Shared scoring utilities for quiz analytics
// Extracted from QuizAnalytics.tsx to prevent code duplication

export function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/[\s\-_/\\,;:.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractKeywords(text: string): string[] {
  const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very', 'just', 'but', 'or', 'and', 'if', 'because', 'while', 'it', 'its', 'that', 'this', 'these', 'those'])

  return normalizeAnswer(text)
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
}

export function calculateKeywordMatch(userAnswer: string, correctAnswer: string): number {
  const userKeywords = new Set(extractKeywords(userAnswer))
  const correctKeywords = extractKeywords(correctAnswer)

  if (correctKeywords.length === 0) return 0

  const matchedCount = correctKeywords.filter(keyword => userKeywords.has(keyword)).length
  return matchedCount / correctKeywords.length
}

export interface Question {
  id: string
  question_text: string
  question_type?: string
  answer_data?: {
    correct_answer?: any
    correct_answers?: any[]
  }
  options?: {
    correct_index?: number
    choices?: Array<{ id: number; text: string }>
  }
}

export function calculateSectionScore(
  userAnswers: Record<string, any>,
  questions: Question[]
): { score: number; maxScore: number; percentage: number } {
  let score = 0
  const maxScore = questions.length

  for (const question of questions) {
    if (!(question.id in userAnswers)) continue

    const userAnswer = userAnswers[question.id]
    let correctAnswer: any

    // Handle different question types
    if (question.question_type === 'multiple_choice') {
      correctAnswer = question.options?.correct_index
    } else {
      correctAnswer = question.answer_data?.correct_answer || question.answer_data?.correct_answers?.[0]
    }

    if (correctAnswer === undefined) continue

    // Use same logic as QuizAnalytics.tsx
    if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
      const normalizedUser = normalizeAnswer(userAnswer)
      const normalizedCorrect = normalizeAnswer(correctAnswer)

      if (normalizedUser === normalizedCorrect) {
        score++
        continue
      }

      // For longer answers, use keyword matching
      if (correctAnswer.length > 50) {
        const keywordMatchScore = calculateKeywordMatch(userAnswer, correctAnswer)
        if (keywordMatchScore >= 0.6) {
          score++
        }
      }
    } else {
      // Direct comparison for non-string answers (including numbers for multiple choice indices)
      if (userAnswer === correctAnswer) {
        score++
      }
    }
  }

  return {
    score,
    maxScore,
    percentage: maxScore > 0 ? (score / maxScore) * 100 : 0
  }
}