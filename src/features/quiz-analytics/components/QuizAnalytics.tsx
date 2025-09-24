// QuizAnalytics - Basic analytics dashboard for quiz administrators
// Displays response statistics and allows data export

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase-client'
import { BarChart3, Download, Users, TrendingUp, Calendar, Loader2, AlertCircle } from 'lucide-react'

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

interface QuizAnalyticsData {
  totalResponses: number
  uniqueSessions: number
  completionRate: number
  averageScore?: number
  responsesByDay: Array<{ date: string; count: number }>
  questionStats: Array<{
    questionId: string
    questionText: string
    totalAnswers: number
    correctAnswers?: number
  }>
}

interface QuizAnalyticsProps {
  quizId: string
  quizTitle?: string
}

export function QuizAnalytics({ quizId, quizTitle }: QuizAnalyticsProps) {
  const [analytics, setAnalytics] = useState<QuizAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch responses for this quiz
      const { data: responses, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .eq('quiz_id', quizId)

      if (responsesError) {
        throw new Error(responsesError.message)
      }

      // Fetch quiz questions for context
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, question_text, answer_data')
        .eq('quiz_id', quizId)
        .order('order_index')

      if (questionsError) {
        throw new Error(questionsError.message)
      }

      // Calculate basic analytics
      const totalResponses = responses?.length || 0
      const uniqueSessions = new Set(responses?.map(r => r.session_id) || []).size

      // Calculate completion rate (responses vs total questions)
      const totalQuestions = questions?.length || 0
      const completedResponses = responses?.filter(r =>
        Object.keys(r.answers || {}).length === totalQuestions
      ).length || 0
      const completionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0

      // Group responses by date
      const responsesByDay = responses?.reduce((acc: Record<string, number>, response) => {
        const date = new Date(response.submitted_at).toDateString()
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {}) || {}

      const responsesByDayArray = Object.entries(responsesByDay).map(([date, count]) => ({
        date,
        count: count as number
      })).slice(-7) // Last 7 days

      // Calculate question statistics
      const questionStats = questions?.map(question => {
        const totalAnswers = responses?.filter(r =>
          r.answers && question.id in r.answers
        ).length || 0

        // Calculate correct answers if answer data exists
        let correctAnswers: number | undefined
        if (question.answer_data && question.answer_data.correct_answers) {
          correctAnswers = responses?.filter(r => {
            const userAnswer = r.answers?.[question.id]
            const correctAnswer = question.answer_data.correct_answers?.[0]
            if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
              const normalizedUser = normalizeAnswer(userAnswer)
              const normalizedCorrect = normalizeAnswer(correctAnswer)

              if (normalizedUser === normalizedCorrect) {
                return true
              }

              if (correctAnswer.length > 50) {
                const keywordMatchScore = calculateKeywordMatch(userAnswer, correctAnswer)
                return keywordMatchScore >= 0.6
              }

              return false
            }
            return userAnswer === correctAnswer
          }).length || 0
        }

        return {
          questionId: question.id,
          questionText: question.question_text,
          totalAnswers,
          correctAnswers
        }
      }) || []

      setAnalytics({
        totalResponses,
        uniqueSessions,
        completionRate,
        responsesByDay: responsesByDayArray,
        questionStats
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [quizId])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const handleExportResponses = useCallback(async () => {
    setIsExporting(true)
    setExportError(null)

    try {
      const { data: responses, error } = await supabase
        .from('responses')
        .select('*')
        .eq('quiz_id', quizId)

      if (error) {
        throw new Error(error.message)
      }

      if (!responses || responses.length === 0) {
        setExportError('No responses available to export.')
        return
      }

      // Convert to CSV with proper escaping
      const csvContent = [
        ['Session ID', 'Submitted At', 'Respondent Name', 'Respondent Email', 'Answers'],
        ...responses.map(response => [
          response.session_id || '',
          response.submitted_at || '',
          response.respondent_name || '',
          response.respondent_email || '',
          `"${JSON.stringify(response.answers).replace(/"/g, '""')}"` // Escape quotes in JSON
        ])
      ].map(row => row.map(cell =>
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(',')).join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `quiz-${quizTitle?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'responses'}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Show success feedback (we'll add a toast later, for now just clear any errors)
      setExportError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export responses'
      setExportError(errorMessage)
    } finally {
      setIsExporting(false)
    }
  }, [quizId, quizTitle])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='text-center text-muted-foreground'>
            <p>Failed to load analytics: {error}</p>
            <Button onClick={loadAnalytics} variant='outline' className='mt-4'>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='text-center text-muted-foreground'>
            <p>No analytics data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Quiz Analytics</h2>
          {quizTitle && (
            <p className='text-muted-foreground'>{quizTitle}</p>
          )}
        </div>
        <Button
          onClick={handleExportResponses}
          variant='outline'
          disabled={isExporting || analytics.totalResponses === 0}
        >
          {isExporting ? (
            <>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              Exporting...
            </>
          ) : (
            <>
              <Download className='h-4 w-4 mr-2' />
              Export Responses
            </>
          )}
        </Button>
      </div>

      {/* Export Error Alert */}
      {exportError && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            {exportError}
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center space-x-2'>
              <Users className='h-4 w-4 text-blue-600' />
              <div>
                <p className='text-sm text-muted-foreground'>Total Responses</p>
                <p className='text-2xl font-bold'>{analytics.totalResponses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center space-x-2'>
              <Users className='h-4 w-4 text-green-600' />
              <div>
                <p className='text-sm text-muted-foreground'>Unique Sessions</p>
                <p className='text-2xl font-bold'>{analytics.uniqueSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center space-x-2'>
              <TrendingUp className='h-4 w-4 text-orange-600' />
              <div>
                <p className='text-sm text-muted-foreground'>Completion Rate</p>
                <p className='text-2xl font-bold'>{analytics.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center space-x-2'>
              <Calendar className='h-4 w-4 text-purple-600' />
              <div>
                <p className='text-sm text-muted-foreground'>This Week</p>
                <p className='text-2xl font-bold'>
                  {analytics.responsesByDay.reduce((sum, day) => sum + day.count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Performance */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BarChart3 className='h-5 w-5' />
            Question Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {analytics.questionStats.map((question, index) => (
              <div key={question.questionId} className='flex items-center justify-between p-3 border rounded'>
                <div className='flex-1'>
                  <p className='font-medium'>Q{index + 1}</p>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='text-right'>
                    <p className='text-sm text-muted-foreground'>Responses</p>
                    <p className='font-medium'>{question.totalAnswers}</p>
                  </div>
                  {question.correctAnswers !== undefined && (
                    <div className='text-right'>
                      <p className='text-sm text-muted-foreground'>Correct</p>
                      <Badge variant='outline'>
                        {question.totalAnswers > 0
                          ? `${((question.correctAnswers / question.totalAnswers) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}