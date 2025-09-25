// QuizListPane adapted from ProgramPane for existing quiz schema
// 90% code reuse with modifications for quiz data structure

import { forwardRef, useEffect, useState } from 'react'
import { useQuizStore } from '@/stores/quizStore'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
// Import display utility to prevent "object object" bug (not currently used)
// import { extractDisplayText } from '@/lib/quiz-data-transforms'

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

    const [searchQuery, setSearchQuery] = useState('')

    // Load data on mount
    useEffect(() => {
      loadQuizzes()
      loadCategories()
    }, [loadQuizzes, loadCategories])


    // Filter quizzes based on search query
    const filteredQuizzes = quizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSelectQuiz = (quizId: string) => {
      setSelectedQuiz(quizId)
      onQuizSelect?.()
    }

    const handleCreateQuiz = () => {
      createQuiz()
    }


    return (
      <div className='flex h-full flex-col overflow-hidden' ref={ref}>
        {/* Header with New Quiz button */}
        <div className='p-3 pr-10 border-b border-border flex-shrink-0'>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='text-sm font-semibold text-foreground'>Quizzes</h2>
            <Button
              variant='default'
              size='sm'
              onClick={handleCreateQuiz}
              disabled={isLoading}
            >
              <Plus className='h-4 w-4 mr-1' />
              New Quiz
            </Button>
          </div>

          {/* Search input */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Search quizzes...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-9 h-9'
            />
          </div>
        </div>

        {/* Quiz list */}
        <div className='flex-1 overflow-y-auto p-2'>
          <div className='space-y-2'>
            {isLoading ? (
              <div className='p-4 text-center text-muted-foreground'>
                Loading quizzes...
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div className='p-4 text-center text-muted-foreground'>
                {searchQuery ? (
                  <>
                    <p className='text-sm'>No quizzes found</p>
                    <p className='text-xs mt-1'>Try a different search term</p>
                  </>
                ) : quizzes.length === 0 ? (
                  <>
                    <p className='text-sm'>No quizzes yet</p>
                    <p className='text-xs mt-1'>Click "New Quiz" to create one</p>
                  </>
                ) : null}
              </div>
            ) : (
              filteredQuizzes.map((quiz) => (
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