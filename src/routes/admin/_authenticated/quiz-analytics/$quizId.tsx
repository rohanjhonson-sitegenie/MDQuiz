// Individual Quiz Analytics Route - full-screen dedicated view
// Reuses QuizReports component in full-screen layout

import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { QuizReports } from '@/features/quiz-management/components/QuizReports'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import { QuizRepository } from '@/services/quiz-repository'
import { createClient } from '@/lib/supabase'

interface QuizAnalyticsParams {
  quizId: string
}

function QuizAnalyticsDetail() {
  const { quizId } = Route.useParams()
  const [quizTitle, setQuizTitle] = useState<string | null>(null)

  useEffect(() => {
    const loadQuizTitle = async () => {
      try {
        const supabase = createClient()
        const repository = new QuizRepository(supabase)
        const quiz = await repository.getQuizById(quizId)
        setQuizTitle(quiz?.title || null)
      } catch (_error) {
        // Failed to load quiz title, continue without it
        setQuizTitle(null)
      }
    }

    if (quizId) {
      loadQuizTitle()
    }
  }, [quizId])

  return (
    <div className="min-h-screen bg-background">
      {/* Header with navigation */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/quiz-analytics">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Analytics
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">
                  Quiz Analytics
                  {quizTitle && <span className="text-muted-foreground font-normal"> - {quizTitle}</span>}
                </h1>
                <p className="text-sm text-muted-foreground">Detailed reporting and insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen reports content */}
      <div className="container mx-auto p-0">
        <QuizReports className="min-h-[calc(100vh-120px)]" quizId={quizId} />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/admin/_authenticated/quiz-analytics/$quizId')({
  component: QuizAnalyticsDetail,
  params: {
    parse: (params): QuizAnalyticsParams => ({
      quizId: params.quizId,
    }),
    stringify: (params: QuizAnalyticsParams) => ({
      quizId: params.quizId,
    }),
  },
})