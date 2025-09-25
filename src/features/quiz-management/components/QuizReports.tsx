// QuizReports - Reports tab component for analytics and export
// Displays metrics cards and response table for selected quiz

import { useQuizStore } from '@/stores/quizStore'
import { cn } from '@/lib/utils'
import { QuizMetricsCards } from './QuizMetricsCards'
import { QuizResponseTable } from './QuizResponseTable'
import { AnalyticsChartsGrid } from './AnalyticsChartsGrid'
import { useQuizAnalytics } from '@/hooks/useQuizAnalytics'
import { BarChart3, FileText, Layers } from 'lucide-react'
import { useSectionAnalytics } from '@/features/quiz-analytics/hooks/useSectionAnalytics'
import { SectionPerformanceChart } from '@/features/quiz-analytics/components/SectionPerformanceChart'

interface QuizReportsProps {
  className?: string
  quizId?: string // Optional prop for direct quiz ID
}

export function QuizReports({ className, quizId }: QuizReportsProps) {
  const { selectedQuizId, selectedQuiz } = useQuizStore()

  const activeQuizId = quizId || selectedQuizId
  const activeQuiz = quizId ? null : selectedQuiz

  const analytics = useQuizAnalytics(activeQuizId)

  // Load section analytics for sectioned quizzes
  const { sectionAnalytics } = useSectionAnalytics(activeQuizId || '')

  if (!activeQuizId) {
    return (
      <div className={cn('flex items-center justify-center h-full bg-muted/10', className)}>
        <div className='text-center text-muted-foreground'>
          <BarChart3 className='h-8 w-8 mx-auto mb-2' />
          <p>Select a quiz to view reports</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      <div className='flex-1 overflow-y-auto p-6'>
        <div className='max-w-6xl mx-auto space-y-6'>
          {activeQuiz && (
            <div className='pb-6 border-b'>
              <p className='text-lg font-medium text-muted-foreground'>
                Analytics for "{activeQuiz.title}"
              </p>
            </div>
          )}

          <QuizMetricsCards quizId={activeQuizId} />

          <AnalyticsChartsGrid
            trendData={analytics.trendData}
            questionStats={analytics.questionStats}
          />

          {/* Section Analytics (for sectioned quizzes) */}
          {sectionAnalytics.length > 0 && (
            <>
              <div className='pt-8 pb-4 border-t'>
                <div className='flex items-center gap-2 mb-1'>
                  <Layers className='h-5 w-5 text-primary' />
                  <h3 className='text-xl font-semibold text-foreground'>
                    Section-Wise Analytics
                  </h3>
                </div>
                <p className='text-sm text-muted-foreground'>
                  Performance comparison across quiz sections
                </p>
              </div>

              {/* Section Performance Comparison */}
              <SectionPerformanceChart sections={sectionAnalytics} />
            </>
          )}

          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <FileText className='h-5 w-5 text-muted-foreground' />
              <h3 className='text-lg font-semibold text-foreground'>
                Response Details
              </h3>
            </div>
            <QuizResponseTable quizId={activeQuizId} />
          </div>
        </div>
      </div>
    </div>
  )
}