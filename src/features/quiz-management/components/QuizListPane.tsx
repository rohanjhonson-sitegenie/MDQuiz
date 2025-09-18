// QuizListPane adapted from ProgramPane for existing quiz schema
// 90% code reuse with modifications for quiz data structure

import { forwardRef, useEffect } from 'react'
import { useQuizStore } from '@/stores/quizStore'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, FileQuestion, Clock } from 'lucide-react'

interface QuizListPaneProps {
  onQuizSelect?: () => void
}

export const QuizListPane = forwardRef<HTMLDivElement, QuizListPaneProps>(
  ({ onQuizSelect }, ref) => {
    const {
      quizzes,
      categories,
      selectedQuizId,
      selectedCategoryId,
      isLoading,
      setSelectedQuiz,
      setSelectedCategory,
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
        {/* Header section */}
        <div className='flex-shrink-0 border-b px-4 py-3'>
          <div className='flex items-center justify-between mb-2'>
            <h2 className='text-lg font-semibold'>Quiz Management</h2>
            <Button
              size='sm'
              onClick={handleCreateQuiz}
              disabled={isLoading}
            >
              <Plus className='h-4 w-4 mr-1' />
              New Quiz
            </Button>
          </div>
          <p className='text-muted-foreground text-sm'>
            Select a quiz to edit or create a new one
          </p>
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className='flex-shrink-0 border-b px-4 py-2'>
            <div className='flex flex-wrap gap-1'>
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'text-xs px-2 py-1 rounded-full transition-colors',
                  !selectedCategoryId
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'text-xs px-2 py-1 rounded-full transition-colors',
                    selectedCategoryId === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quiz list */}
        <ScrollArea className='flex-1 overflow-y-auto'>
          <div className='p-2 pr-4'>
            {isLoading ? (
              <div className='p-4 text-center text-muted-foreground'>
                Loading quizzes...
              </div>
            ) : quizzes.length === 0 ? (
              <div className='p-4 text-center text-muted-foreground'>
                {selectedCategoryId ? 'No quizzes in this category' : 'No quizzes found'}
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
                <button
                  key={quiz.id}
                  onClick={() => handleSelectQuiz(quiz.id)}
                  className={cn(
                    'hover:bg-accent hover:text-accent-foreground mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors',
                    'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
                    selectedQuizId === quiz.id &&
                      'bg-accent text-accent-foreground'
                  )}
                >
                  <div className='flex items-center gap-3 min-w-0 flex-1'>
                    <div className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                      quiz.published 
                        ? 'bg-green-100 text-green-600'
                        : 'bg-yellow-100 text-yellow-600'
                    )}>
                      <FileQuestion className='h-4 w-4' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='font-medium truncate'>{quiz.title}</p>
                      <p className='text-muted-foreground text-xs truncate'>
                        {quiz.description || 'No description'}
                      </p>
                      <div className='flex items-center gap-3 mt-1'>
                        {quiz.category && (
                          <span className='text-xs text-muted-foreground'>
                            {quiz.category.name}
                          </span>
                        )}
                        {quiz.questions && quiz.questions.length > 0 && (
                          <span className='text-xs text-muted-foreground flex items-center gap-1'>
                            <FileQuestion className='h-3 w-3' />
                            {quiz.questions.length} questions
                          </span>
                        )}
                        {quiz.settings.time_limit && (
                          <span className='text-xs text-muted-foreground flex items-center gap-1'>
                            <Clock className='h-3 w-3' />
                            {quiz.settings.time_limit}min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='flex flex-col items-end gap-1'>
                    <Badge 
                      variant={quiz.published ? 'default' : 'secondary'}
                      className='text-xs'
                    >
                      {quiz.published ? 'Published' : 'Draft'}
                    </Badge>
                    <div className='text-xs text-muted-foreground'>
                      {new Date(quiz.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    )
  }
)

QuizListPane.displayName = 'QuizListPane'