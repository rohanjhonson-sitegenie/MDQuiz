// Quiz Analytics Admin Route
// Protected route for viewing quiz analytics and response data

import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { QuizAnalytics } from '@/features/quiz-analytics/components/QuizAnalytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase-client'

export const Route = createFileRoute('/admin/_authenticated/quiz-analytics/')({
  component: QuizAnalyticsPage
})

interface Quiz {
  id: string
  title: string
  description: string | null
  published: boolean
  created_at: string
}

function QuizAnalyticsPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuizId, setSelectedQuizId] = useState<string>('')
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load available quizzes
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('id, title, description, published, created_at')
          .order('created_at', { ascending: false })

        if (error) {
          throw new Error(error.message)
        }

        setQuizzes(data || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load quizzes'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuizzes()
  }, [])

  const handleQuizSelect = (quizId: string) => {
    setSelectedQuizId(quizId)
    const quiz = quizzes.find(q => q.id === quizId)
    setSelectedQuiz(quiz || null)
  }

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Quiz Analytics</h1>
        <p className='text-muted-foreground'>
          View response data and performance metrics for your quizzes.
        </p>
      </div>

      {/* Quiz Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select a Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex items-center justify-center py-4'>
              <div className='w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin' />
            </div>
          ) : error ? (
            <p className='text-destructive'>{error}</p>
          ) : (
            <div className='space-y-4'>
              <Select value={selectedQuizId} onValueChange={handleQuizSelect}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Choose a quiz to view analytics...' />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.map((quiz) => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      <div className='flex items-center justify-between w-full'>
                        <span>{quiz.title}</span>
                        <Badge
                          variant={quiz.published ? 'default' : 'secondary'}
                          className='ml-2'
                        >
                          {quiz.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {quizzes.length === 0 && (
                <p className='text-muted-foreground text-sm'>
                  No quizzes found. Create a quiz first in the Quiz Management section.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Display */}
      {selectedQuiz && (
        <QuizAnalytics
          quizId={selectedQuiz.id}
          quizTitle={selectedQuiz.title}
        />
      )}
    </div>
  )
}