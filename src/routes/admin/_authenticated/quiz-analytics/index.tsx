// Quiz Analytics Landing Route - follows admin route pattern
// Landing page for quiz analytics with quiz selection

import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, FileText, Users } from 'lucide-react'
import { QuizRepository } from '@/services/quiz-repository'
import { createClient } from '@/lib/supabase'

interface Quiz {
  id: string
  title: string
  description?: string
  published: boolean
  created_at: string
}

function QuizAnalyticsIndex() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const supabase = createClient()
        const repository = new QuizRepository(supabase)
        const data = await repository.getQuizzes(false) // Don't need questions for list
        setQuizzes(data)
      } catch (_error) {
        // Loading failed silently
      } finally {
        setIsLoading(false)
      }
    }

    loadQuizzes()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 mx-auto mb-4 animate-spin" />
          <p>Loading quizzes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Quiz Analytics</h1>
          <p className="text-muted-foreground">
            View detailed reports and analytics for your quizzes
          </p>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Quizzes Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create some quizzes first to view their analytics and reports.
            </p>
            <Button asChild>
              <Link to="/admin/quiz-management">
                Go to Quiz Management
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <Badge variant={quiz.published ? 'default' : 'secondary'}>
                    {quiz.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                {quiz.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {quiz.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Analytics Available</span>
                  </div>
                  <Button asChild size="sm">
                    <Link to={`/admin/quiz-analytics/$quizId`} params={{ quizId: quiz.id }}>
                      View Reports
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/admin/_authenticated/quiz-analytics/')({
  component: QuizAnalyticsIndex,
})