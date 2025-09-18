// QuizPreview component rendering existing schema data
// Live preview of quiz as it would appear to users

import { useMemo } from 'react'
import { useQuizStore } from '@/stores/quizStore'
import { parseMarkdownToQuiz } from '@/utils/markdown-transform'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, Clock, FileQuestion, AlertCircle } from 'lucide-react'

interface QuizPreviewProps {
  className?: string
}

export function QuizPreview({ className }: QuizPreviewProps) {
  const { markdownContent, selectedQuiz } = useQuizStore()

  // Parse markdown to quiz structure for preview
  const previewQuiz = useMemo(() => {
    if (!markdownContent.trim()) return null
    
    try {
      const parsed = parseMarkdownToQuiz(markdownContent)
      return {
        ...selectedQuiz,
        ...parsed
      }
    } catch (error) {
      return null
    }
  }, [markdownContent, selectedQuiz])

  if (!selectedQuiz) {
    return (
      <div className={cn('flex items-center justify-center h-full bg-muted/10', className)}>
        <div className='text-center text-muted-foreground'>
          <p>Select a quiz to see preview</p>
        </div>
      </div>
    )
  }

  if (!previewQuiz) {
    return (
      <div className={cn('flex items-center justify-center h-full bg-red-50/30', className)}>
        <div className='text-center text-red-600'>
          <AlertCircle className='h-8 w-8 mx-auto mb-2' />
          <p>Unable to parse quiz markdown</p>
          <p className='text-sm text-red-500 mt-1'>Check the editor for syntax errors</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Preview toolbar */}
      <div className='flex-shrink-0 border-b bg-muted/20 px-4 py-2'>
        <div className='flex items-center justify-between'>
          <h3 className='font-medium text-sm'>Live Preview</h3>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            {previewQuiz.questions && (
              <div className='flex items-center gap-1'>
                <FileQuestion className='h-3 w-3' />
                {previewQuiz.questions.length} questions
              </div>
            )}
            {previewQuiz.settings?.time_limit && (
              <div className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                {previewQuiz.settings.time_limit} minutes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quiz preview content */}
      <div className='flex-1 overflow-y-auto p-6 bg-gradient-to-b from-background to-muted/10'>
        <div className='max-w-3xl mx-auto space-y-6'>
          {/* Quiz header */}
          <div className='text-center space-y-3 pb-6 border-b'>
            <h1 className='text-3xl font-bold text-foreground'>
              {previewQuiz.title || 'Untitled Quiz'}
            </h1>
            
            {previewQuiz.description && (
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                {previewQuiz.description}
              </p>
            )}

            <div className='flex items-center justify-center gap-4 text-sm'>
              <Badge variant={previewQuiz.published ? 'default' : 'secondary'}>
                {previewQuiz.published ? 'Published' : 'Draft'}
              </Badge>
              
              {previewQuiz.category?.name && (
                <Badge variant='outline'>
                  {previewQuiz.category.name}
                </Badge>
              )}
              
              {previewQuiz.settings?.time_limit && (
                <div className='flex items-center gap-1 text-muted-foreground'>
                  <Clock className='h-4 w-4' />
                  {previewQuiz.settings.time_limit} minutes
                </div>
              )}
            </div>
          </div>

          {/* Questions */}
          {previewQuiz.questions && previewQuiz.questions.length > 0 ? (
            <div className='space-y-8'>
              {previewQuiz.questions.map((question, index) => (
                <div
                  key={index}
                  className='bg-card border rounded-lg p-6 shadow-sm'
                >
                  {/* Question header */}
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <div className='flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium'>
                        {index + 1}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <h3 className='text-lg font-medium text-foreground'>
                          {question.question_text}
                        </h3>
                      </div>
                    </div>
                    <Badge variant='outline' className='text-xs'>
                      {question.question_type.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Question content */}
                  {question.question_content?.additional_context && (
                    <div className='mb-4 p-3 bg-muted/50 rounded text-sm text-muted-foreground'>
                      {question.question_content.additional_context}
                    </div>
                  )}

                  {/* Answer options based on question type */}
                  <div className='space-y-3'>
                    {question.question_type === 'multiple_choice' && question.options.choices && (
                      <div className='space-y-2'>
                        {question.options.choices.map((choice, choiceIndex) => {
                          const isCorrect = question.options.correct_index === choiceIndex
                          return (
                            <div
                              key={choiceIndex}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-lg border',
                                isCorrect 
                                  ? 'bg-green-50 border-green-200 text-green-900'
                                  : 'bg-background border-border'
                              )}
                            >
                              {isCorrect ? (
                                <CheckCircle className='h-4 w-4 text-green-600' />
                              ) : (
                                <Circle className='h-4 w-4 text-muted-foreground' />
                              )}
                              <span className='flex-1'>
                                <span className='font-medium mr-2'>
                                  {String.fromCharCode(65 + choiceIndex)})
                                </span>
                                {choice}
                              </span>
                              {isCorrect && (
                                <Badge variant='secondary' className='text-xs bg-green-100 text-green-700'>
                                  Correct
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {question.question_type === 'true_false' && (
                      <div className='space-y-2'>
                        {['True', 'False'].map((option) => {
                          const isCorrect = question.answer_data.correct_answer === option.toLowerCase()
                          return (
                            <div
                              key={option}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-lg border',
                                isCorrect 
                                  ? 'bg-green-50 border-green-200 text-green-900'
                                  : 'bg-background border-border'
                              )}
                            >
                              {isCorrect ? (
                                <CheckCircle className='h-4 w-4 text-green-600' />
                              ) : (
                                <Circle className='h-4 w-4 text-muted-foreground' />
                              )}
                              <span className='flex-1'>{option}</span>
                              {isCorrect && (
                                <Badge variant='secondary' className='text-xs bg-green-100 text-green-700'>
                                  Correct
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {question.question_type === 'text_input' && (
                      <div className='space-y-2'>
                        <div className='p-3 bg-muted/50 rounded-lg border-2 border-dashed'>
                          <p className='text-sm text-muted-foreground mb-2'>Expected Answer:</p>
                          <p className='font-mono text-sm bg-background px-2 py-1 rounded border'>
                            {question.answer_data.correct_answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  {question.answer_data.explanation && (
                    <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                      <div className='flex items-start gap-2'>
                        <div className='flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5'>
                          i
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='text-sm font-medium text-blue-900 mb-1'>Explanation</p>
                          <p className='text-sm text-blue-800'>
                            {question.answer_data.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-12 text-muted-foreground'>
              <FileQuestion className='h-12 w-12 mx-auto mb-4 text-muted-foreground/50' />
              <h3 className='font-medium mb-2'>No Questions Yet</h3>
              <p className='text-sm'>Add questions in the markdown editor to see them here</p>
            </div>
          )}

          {/* Quiz footer */}
          {previewQuiz.questions && previewQuiz.questions.length > 0 && (
            <div className='text-center pt-8 border-t'>
              <Button size='lg' disabled>
                Submit Quiz
              </Button>
              <p className='text-xs text-muted-foreground mt-2'>
                This is a preview - quiz responses are not collected
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}