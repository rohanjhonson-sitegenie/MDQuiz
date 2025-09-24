// QuizMetricsCards - Overview metrics display using Card components
// Shows total responses, completion rate, and basic quiz statistics

import { useEffect, useState } from 'react'
import { useQuizStore } from '@/stores/quizStore'
import { QuizRepository } from '@/services/quiz-repository'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react'

interface QuizMetricsCardsProps {
  quizId: string
}

interface QuizAnalytics {
  totalResponses: number
  completionRate: number
  averageScore: number
  publishedStatus: boolean
}

export function QuizMetricsCards({ quizId }: QuizMetricsCardsProps) {
  const { selectedQuiz } = useQuizStore()
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const supabase = createClient()
        const repository = new QuizRepository(supabase)

        // Load both stats and quiz metadata
        const [stats, quizData] = await Promise.all([
          repository.getQuizStats(quizId),
          repository.getQuizById(quizId)
        ])

        setAnalytics({
          totalResponses: stats.totalResponses,
          completionRate: stats.completionRate,
          averageScore: stats.averageScore,
          publishedStatus: quizData?.published ?? false
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    if (quizId) {
      loadAnalytics()
    }
  }, [quizId, selectedQuiz?.published])

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardHeader className='pb-3'>
              <div className='h-4 bg-muted rounded w-3/4'></div>
            </CardHeader>
            <CardContent>
              <div className='h-8 bg-muted rounded w-1/2 mb-2'></div>
              <div className='h-3 bg-muted rounded w-full'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className='border-destructive bg-destructive/5'>
        <CardContent className='pt-6'>
          <p className='text-destructive text-sm'>Error loading metrics: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {/* Total Responses */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Responses</CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{analytics.totalResponses}</div>
          <p className='text-xs text-muted-foreground'>
            Quiz submissions received
          </p>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Completion Rate</CardTitle>
          <CheckCircle className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{analytics.completionRate.toFixed(1)}%</div>
          <p className='text-xs text-muted-foreground'>
            Responses with answers
          </p>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Average Score</CardTitle>
          <TrendingUp className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            {analytics.averageScore > 0 ? analytics.averageScore.toFixed(1) : 'N/A'}
          </div>
          <p className='text-xs text-muted-foreground'>
            Auto-scoring not implemented
          </p>
        </CardContent>
      </Card>

      {/* Publication Status */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Status</CardTitle>
          <Clock className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-2'>
            <Badge variant={analytics.publishedStatus ? 'default' : 'secondary'}>
              {analytics.publishedStatus ? 'Published' : 'Draft'}
            </Badge>
          </div>
          <p className='text-xs text-muted-foreground mt-2'>
            {analytics.publishedStatus ? 'Live and accepting responses' : 'Not accepting responses'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}