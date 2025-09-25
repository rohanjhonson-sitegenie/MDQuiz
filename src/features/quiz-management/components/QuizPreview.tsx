// QuizPreview component rendering existing schema data
// Live preview of quiz as it would appear to users

import { useMemo } from 'react'
import { useQuizStore } from '@/stores/quizStore'
import { parseMarkdownQuiz, generateQuizSlug } from '@/lib/markdown-quiz-parser'
import { useQuizValidation } from '@/hooks/useQuizValidation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, Clock, FileQuestion, AlertCircle, ExternalLink, AlertTriangle, BarChart3 } from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface QuizPreviewProps {
  className?: string
}

export function QuizPreview({ className }: QuizPreviewProps) {
  const { markdownContent, selectedQuiz, publishQuiz, unpublishQuiz, isLoading } = useQuizStore()
  const { validation, canPublish, hasErrors } = useQuizValidation(markdownContent)

  // Parse markdown to quiz structure for preview
  const previewQuiz = useMemo(() => {
    if (!markdownContent.trim()) return null

    try {
      const parsed = parseMarkdownQuiz(markdownContent)

      // Flatten questions from sections for preview display
      let questionsForPreview = parsed.questions || []
      const sectionTitleMap = new Map<string, string>()
      if (parsed.structure_type === 'sectioned' && parsed.sections.length > 0) {
        questionsForPreview = parsed.sections.flatMap(section =>
          (section.questions || []).map(q => {
            if (q.section_id) {
              sectionTitleMap.set(q.section_id, section.title)
            }
            return q
          })
        )
      }

      return {
        ...selectedQuiz,
        ...parsed,
        questions: questionsForPreview,
        sectionTitleMap
      }
    } catch (_error) {
      return null
    }
  }, [markdownContent, selectedQuiz])

  const handleViewLiveQuiz = () => {
    if (previewQuiz?.published && previewQuiz?.title) {
      const slug = generateQuizSlug(previewQuiz.title)
      const quizUrl = `/quiz/${slug}`
      window.open(quizUrl, '_blank')
    }
  }

  const handlePublishToggle = async () => {
    if (!selectedQuiz?.id) {
      return
    }

    if (selectedQuiz.published) {
      await unpublishQuiz(selectedQuiz.id)
    } else {
      if (canPublish) {
        await publishQuiz(selectedQuiz.id)
      }
    }
  }

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
      {/* Quiz preview content */}
      <div className='flex-1 overflow-y-auto p-6'>
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
              {previewQuiz.published ? (
                <>
                  <button
                    onClick={handleViewLiveQuiz}
                    className='hover:scale-105 transition-transform'
                    title='Click to view live quiz'
                  >
                    <Badge variant='default' className='cursor-pointer hover:bg-primary/80 flex items-center gap-1 h-9 px-3'>
                      Published
                      <ExternalLink className='h-3 w-3' />
                    </Badge>
                  </button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handlePublishToggle}
                    disabled={isLoading}
                    className='h-9 px-3'
                  >
                    Unpublish
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant='secondary' className='h-9 px-3'>
                    Draft
                  </Badge>
                  <Button
                    variant='default'
                    size='sm'
                    onClick={handlePublishToggle}
                    disabled={isLoading || !canPublish}
                    title={!canPublish ? 'Fix validation issues before publishing' : 'Publish quiz'}
                    className='h-9 px-3'
                  >
                    {isLoading ? 'Publishing...' : 'Publish'}
                  </Button>
                </>
              )}

              {selectedQuiz?.category_id && (
                <Badge variant='outline' className='h-9 px-3'>
                  Category
                </Badge>
              )}

              {previewQuiz.settings?.time_limit && (
                <div className='flex items-center gap-1 text-muted-foreground'>
                  <Clock className='h-4 w-4' />
                  {previewQuiz.settings.time_limit} minutes
                </div>
              )}

              {selectedQuiz?.id && (
                <Button asChild variant='outline' size='sm' className='h-9 px-3'>
                  <Link to={`/admin/quiz-analytics/$quizId`} params={{ quizId: selectedQuiz.id }}>
                    <BarChart3 className='h-4 w-4 mr-1' />
                    View Reports
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Validation Status */}
          {hasErrors && (
            <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
              <div className='flex items-start gap-3'>
                <AlertTriangle className='h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5' />
                <div className='flex-1'>
                  <h3 className='font-medium text-orange-900 mb-2'>
                    Quiz Validation Issues ({validation.errors.length})
                  </h3>
                  <ul className='space-y-1 text-sm text-orange-800'>
                    {validation.errors.map((error, index) => (
                      <li key={index} className='flex items-start gap-2'>
                        <span className='text-orange-600 mt-1'>•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                  {!canPublish && (
                    <div className='mt-3 p-2 bg-orange-100 rounded text-sm text-orange-900'>
                      <strong>Cannot publish:</strong> Fix the issues above before publishing this quiz.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!hasErrors && validation.questionErrors.length > 0 && (
            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
              <div className='flex items-center gap-2'>
                <CheckCircle className='h-5 w-5 text-green-600' />
                <span className='font-medium text-green-900'>
                  Quiz validation passed - ready to publish
                </span>
              </div>
            </div>
          )}

          {/* Questions */}
          {previewQuiz.questions && previewQuiz.questions.length > 0 ? (
            <div className='space-y-8'>
              {previewQuiz.questions.map((question, index) => {
                const questionValidation = validation.questionErrors.find(q => q.questionIndex === index)
                const hasQuestionErrors = questionValidation && !questionValidation.isValid
                const currentSectionTitle = question.section_id ? previewQuiz.sectionTitleMap?.get(question.section_id) : undefined
                const previousSectionTitle = index > 0 && previewQuiz.questions[index - 1].section_id ? previewQuiz.sectionTitleMap?.get(previewQuiz.questions[index - 1].section_id) : undefined
                const showSectionHeader = currentSectionTitle && currentSectionTitle !== previousSectionTitle

                return (
                  <div key={index}>
                    {/* Section Header for sectioned quizzes */}
                    {showSectionHeader && (
                      <div className='mb-6 pb-3 border-b border-border'>
                        <h2 className='text-xl font-semibold text-foreground flex items-center gap-2'>
                          <div className='w-6 h-6 bg-primary/10 text-primary rounded flex items-center justify-center text-xs font-bold'>
                            S
                          </div>
                          {currentSectionTitle}
                        </h2>
                      </div>
                    )}

                    <div
                    className={cn(
                      'bg-card border rounded-lg p-6 shadow-sm',
                      hasQuestionErrors && 'border-red-200 bg-red-50/30'
                    )}
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
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline' className='text-xs'>
                        {question.question_type.replace('_', ' ')}
                      </Badge>
                      {hasQuestionErrors && (
                        <Badge variant='destructive' className='text-xs'>
                          <AlertTriangle className='h-3 w-3 mr-1' />
                          Issues
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Question validation errors */}
                  {hasQuestionErrors && questionValidation && (
                    <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                      <div className='flex items-start gap-2'>
                        <AlertTriangle className='h-4 w-4 text-red-600 flex-shrink-0 mt-0.5' />
                        <div className='flex-1'>
                          <p className='text-sm font-medium text-red-900 mb-1'>Question Issues:</p>
                          <ul className='space-y-1'>
                            {questionValidation.errors.map((error, errorIndex) => (
                              <li key={errorIndex} className='text-sm text-red-800'>
                                • {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Question content */}
                  {question.question_content?.additional_context && (
                    <div className='mb-4 p-3 bg-muted/50 rounded text-sm text-muted-foreground'>
                      {String(question.question_content.additional_context)}
                    </div>
                  )}

                  {/* Answer options based on question type */}
                  <div className='space-y-3'>
                    {question.question_type === 'multiple_choice' && question.options.choices && (
                      <div className='space-y-2'>
                        {(() => {
                          // Handle both string[] and object[] formats for backward compatibility
                          const choices = question.options.choices as string[] | Array<{ id: number; text: string }>

                          return choices.map((choice, choiceIndex) => {
                            // Normalize choice data
                            const choiceData = typeof choice === 'string'
                              ? { id: choiceIndex, text: choice }
                              : choice

                            const correctIndex = (question.options as { correct_index?: number }).correct_index
                            const isCorrect = correctIndex === choiceData.id
                            return (
                              <div
                                key={choiceData.id}
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
                                  {choiceData.text}
                                </span>
                              {isCorrect && (
                                <Badge variant='secondary' className='text-xs bg-green-100 text-green-700'>
                                  Correct
                                </Badge>
                              )}
                            </div>
                          )
                          })
                        })()}
                      </div>
                    )}

                    {question.question_type === 'true_false' && question.options.choices && (
                      <div className='space-y-2'>
                        {(() => {
                          // Handle both string[] and object[] formats for backward compatibility
                          const choices = question.options.choices as string[] | Array<{ id: number; text: string }>

                          return choices.map((choice, choiceIndex) => {
                            // Normalize choice data
                            const choiceData = typeof choice === 'string'
                              ? { id: choiceIndex, text: choice }
                              : choice

                            const correctAnswer = (question.answer_data as { correct_answer?: boolean }).correct_answer
                            const isCorrect = (correctAnswer === true && choiceData.id === 0) || (correctAnswer === false && choiceData.id === 1)
                            return (
                              <div
                                key={choiceData.id}
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
                                <span className='flex-1'>{choiceData.text}</span>
                                {isCorrect && (
                                  <Badge variant='secondary' className='text-xs bg-green-100 text-green-700'>
                                    Correct
                                  </Badge>
                                )}
                              </div>
                            )
                          })
                        })()}
                      </div>
                    )}

                    {question.question_type === 'text_input' && (
                      <div className='space-y-2'>
                        <div className='p-3 bg-muted/50 rounded-lg border-2 border-dashed'>
                          <p className='text-sm text-muted-foreground mb-2'>Expected Answer:</p>
                          <p className='font-mono text-sm bg-background px-2 py-1 rounded border'>
                            {(question.answer_data as { correct_answer?: string }).correct_answer || 'No answer provided'}
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
                            {String(question.answer_data?.explanation || '')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                  </div>
                )
              })}
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