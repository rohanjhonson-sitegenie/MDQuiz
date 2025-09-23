// QuizListPane adapted from ProgramPane for existing quiz schema
// 90% code reuse with modifications for quiz data structure

import { forwardRef, useEffect } from 'react'
import { useQuizStore } from '@/stores/quizStore'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
// Import display utility to prevent "object object" bug
import { extractDisplayText } from '@/lib/quiz-data-transforms'

interface QuizListPaneProps {
  onQuizSelect?: () => void
}

export const QuizListPane = forwardRef<HTMLDivElement, QuizListPaneProps>(
  ({ onQuizSelect }, ref) => {
    const {
      quizzes,
      selectedQuizId,
      isLoading,
      setSelectedQuiz,
      createQuiz,
      loadQuizzes,
      loadCategories
    } = useQuizStore()

    // Load data on mount
    useEffect(() => {
      loadQuizzes()
      loadCategories()
    }, [loadQuizzes, loadCategories])

    const handleSelectQuiz = (quizId: string) => {
      setSelectedQuiz(quizId)
      onQuizSelect?.()
    }

    const handleCreateQuiz = () => {
      createQuiz()
    }


    return (
      <div className='flex h-full flex-col overflow-hidden' ref={ref}>


        {/* Quiz list */}
        <div className='flex-1 overflow-y-auto p-2'>
          <div className='space-y-2'>
            {isLoading ? (
              <div className='p-4 text-center text-muted-foreground'>
                Loading quizzes...
              </div>
            ) : quizzes.length === 0 ? (
              <div className='p-4 text-center text-muted-foreground'>
                No quizzes found
                <div className='mt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleCreateQuiz}
                  >
                    <Plus className='h-4 w-4 mr-1' />
                    Create your first quiz
                  </Button>
                </div>
              </div>
            ) : (
              quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() => handleSelectQuiz(quiz.id)}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer transition-colors',
                    selectedQuizId === quiz.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-accent'
                  )}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-sm font-medium text-foreground truncate'>
                        {quiz.title}
                      </h3>
                      <p className='text-xs text-muted-foreground mt-1'>
                        {quiz.questions?.length || 0} questions • {quiz.updated_at ? new Date(quiz.updated_at).toLocaleDateString() : 'New'}
                      </p>
                    </div>
                    <Badge
                      variant={quiz.published ? 'default' : 'secondary'}
                      className='text-xs ml-2'
                    >
                      {quiz.published ? 'Live' : 'Draft'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }
)

QuizListPane.displayName = 'QuizListPane'