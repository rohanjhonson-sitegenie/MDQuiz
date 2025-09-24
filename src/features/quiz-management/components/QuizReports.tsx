// QuizReports - Reports tab component for analytics and export
// Displays metrics cards and response table for selected quiz

import { useQuizStore } from '@/stores/quizStore'
import { cn } from '@/lib/utils'
import { QuizMetricsCards } from './QuizMetricsCards'
import { QuizResponseTable } from './QuizResponseTable'
import { BarChart3, FileText } from 'lucide-react'

interface QuizReportsProps {
  className?: string
  quizId?: string // Optional prop for direct quiz ID
}

export function QuizReports({ className, quizId }: QuizReportsProps) {
  const { selectedQuizId, selectedQuiz } = useQuizStore()

  // Use provided quizId or fall back to store selected quiz
  const activeQuizId = quizId || selectedQuizId
  const activeQuiz = quizId ? null : selectedQuiz // When using prop quizId, we don't need store quiz data

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
      {/* Reports content */}
      <div className='flex-1 overflow-y-auto p-6'>
        <div className='max-w-6xl mx-auto space-y-6'>
          {/* Quiz subtitle - only show when we have quiz title from store */}
          {activeQuiz && (
            <div className='pb-6 border-b'>
              <p className='text-lg font-medium text-muted-foreground'>
                Analytics for "{activeQuiz.title}"
              </p>
            </div>
          )}

          {/* Metrics overview */}
          <QuizMetricsCards quizId={activeQuizId} />

          {/* Response details */}
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