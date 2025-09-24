import { useState, useEffect } from 'react'
import { QuizRepository } from '@/services/quiz-repository'
import { createClient } from '@/lib/supabase'

interface QuizQuestion {
  id: string
  question_text: string
  question_type: string
  options: Record<string, unknown>
  answer_data: Record<string, unknown>
}

interface ResponseData {
  id: string
  session_id: string
  answers: Record<string, unknown>
  respondent_name?: string
  respondent_email?: string
  submitted_at: string
}

interface TrendDataPoint {
  date: string
  count: number
}

interface QuestionStat {
  questionId: string
  questionText: string
  correctCount: number
  totalCount: number
  percentage: number
}

interface QuizAnalytics {
  responses: ResponseData[]
  questions: QuizQuestion[]
  trendData: TrendDataPoint[]
  questionStats: QuestionStat[]
  isLoading: boolean
  error: string | null
}

function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/[\s\-_/\\,;:.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very', 'just', 'but', 'or', 'and', 'if', 'because', 'while', 'it', 'its', 'that', 'this', 'these', 'those'])

  return normalizeAnswer(text)
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
}

function calculateKeywordMatch(userAnswer: string, correctAnswer: string): number {
  const userKeywords = new Set(extractKeywords(userAnswer))
  const correctKeywords = extractKeywords(correctAnswer)

  if (correctKeywords.length === 0) return 0

  const matchedCount = correctKeywords.filter(keyword => userKeywords.has(keyword)).length
  return matchedCount / correctKeywords.length
}

function isAnswerCorrect(question: QuizQuestion, userAnswer: unknown): boolean {
  if (question.question_type === 'multiple_choice') {
    const options = question.options as { correct_index?: number }
    return userAnswer === options.correct_index
  }
  if (question.question_type === 'true_false') {
    const answerData = question.answer_data as { correct_answer?: boolean }
    return userAnswer === answerData.correct_answer
  }
  if (question.question_type === 'text_input') {
    const answerData = question.answer_data as { correct_answer?: string }
    const options = question.options as { validation_type?: string; min_length?: number }
    const userAnswerStr = String(userAnswer || '')
    const correctAnswerStr = answerData.correct_answer || ''

    const normalizedUser = normalizeAnswer(userAnswerStr)
    const normalizedCorrect = normalizeAnswer(correctAnswerStr)

    if (normalizedUser === normalizedCorrect) {
      return true
    }

    if (correctAnswerStr.length > 50 || (options?.min_length && options.min_length > 30)) {
      const keywordMatchScore = calculateKeywordMatch(userAnswerStr, correctAnswerStr)
      return keywordMatchScore >= 0.6
    }

    return normalizedUser === normalizedCorrect
  }
  return false
}

function calculateTrendData(responses: ResponseData[]): TrendDataPoint[] {
  const grouped = responses.reduce((acc, response) => {
    const date = new Date(response.submitted_at).toLocaleDateString()
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function calculateQuestionStats(responses: ResponseData[], questions: QuizQuestion[]): QuestionStat[] {
  return questions.map(question => {
    let correct = 0
    let total = 0

    responses.forEach(response => {
      const userAnswer = response.answers[question.id]
      if (userAnswer !== undefined) {
        total++
        if (isAnswerCorrect(question, userAnswer)) {
          correct++
        }
      }
    })

    return {
      questionId: question.id,
      questionText: question.question_text,
      correctCount: correct,
      totalCount: total,
      percentage: total > 0 ? (correct / total) * 100 : 0
    }
  }).filter(stat => stat.totalCount > 0)
}

export function useQuizAnalytics(quizId: string | undefined): QuizAnalytics {
  const [analytics, setAnalytics] = useState<QuizAnalytics>({
    responses: [],
    questions: [],
    trendData: [],
    questionStats: [],
    isLoading: true,
    error: null
  })

  useEffect(() => {
    if (!quizId) {
      setAnalytics({
        responses: [],
        questions: [],
        trendData: [],
        questionStats: [],
        isLoading: false,
        error: null
      })
      return
    }

    const loadAnalytics = async () => {
      try {
        setAnalytics(prev => ({ ...prev, isLoading: true, error: null }))

        const supabase = createClient()
        const repository = new QuizRepository(supabase)

        const [responsesData, quizData] = await Promise.all([
          repository.getQuizResponses(quizId),
          repository.getQuizById(quizId)
        ])

        const responses = responsesData as ResponseData[]
        const questions = (quizData?.questions || []) as QuizQuestion[]

        const trendData = calculateTrendData(responses)
        const questionStats = calculateQuestionStats(responses, questions)

        setAnalytics({
          responses,
          questions,
          trendData,
          questionStats,
          isLoading: false,
          error: null
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics'
        setAnalytics(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }))
      }
    }

    loadAnalytics()
  }, [quizId])

  return analytics
}