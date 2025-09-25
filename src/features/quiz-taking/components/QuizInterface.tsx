// QuizInterface - Main component for anonymous quiz taking
// Handles quiz display, navigation, and response submission

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QuestionRenderer } from './QuestionRenderer'
import { QuizResults } from './QuizResults'
import { PreQuizContactForm } from './PreQuizContactForm'
import { useQuizData, PublicQuiz } from '@/hooks/useQuizData'
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react'

// Using types from useQuizData hook

interface QuizInterfaceProps {
  quizSlug: string
}

export function QuizInterface({ quizSlug }: QuizInterfaceProps) {
  const [quiz, setQuiz] = useState<PublicQuiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Contact form state
  const [showContactForm, setShowContactForm] = useState(false)
  const [hasProvidedContact, setHasProvidedContact] = useState(false)
  const [contactData, setContactData] = useState<{ email: string; name?: string } | null>(null)

  // Section-based timer state
  const [sectionTimeLeft, setSectionTimeLeft] = useState<number | null>(null)
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null)
  const [timerHasStarted, setTimerHasStarted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const { isLoading, error, getPublishedQuiz, submitQuizResponse } = useQuizData()

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoadError(null)
        const quizData = await getPublishedQuiz(quizSlug)

        if (!quizData) {
          setLoadError('Quiz not found or not published')
          setQuiz(null)
          return
        }

        if (!quizData.id) {
          setLoadError('Quiz data is incomplete (missing ID)')
          setQuiz(null)
          return
        }

        setQuiz(quizData)


        // Initialize timer for mixed mode quizzes
        if (quizData.structure_type === 'mixed') {
          const globalTimeLimit = quizData.settings?.time_limit_minutes as number | undefined
          if (globalTimeLimit && globalTimeLimit > 0) {
            const seconds = globalTimeLimit * 60
            // Only set timer if one isn't already running
            if (sectionTimeLeft === null) {
              setSectionTimeLeft(seconds)
            }
          }
        }

        // Check contact requirement and show form if needed
        const contactRequirement = quizData.settings?.contact_requirement || 'optional'
        if (contactRequirement === 'required' || contactRequirement === 'optional') {
          setShowContactForm(true)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load quiz'
        setLoadError(errorMessage)
        setQuiz(null)
      }
    }

    loadQuiz()
  }, [quizSlug, getPublishedQuiz])

  // Helper function to get current question's section info
  const getCurrentQuestionSection = useCallback(() => {
    if (!quiz || !quiz.sections || quiz.structure_type !== 'sectioned') {
      return null
    }

    const currentQ = quiz.questions[currentQuestion]
    if (!currentQ || !currentQ.id) return null

    // Find the section that contains this question
    const section = quiz.sections.find(s =>
      s.questions?.some(q => q && q.id === currentQ.id)
    )

    return section || null
  }, [quiz, currentQuestion])

  // Section timer management - separated into two effects
  useEffect(() => {
    if (!quiz || quiz.structure_type !== 'sectioned') {
      setCurrentSectionId(null)
      // Don't reset timer for mixed mode if it's already running
      if (!timerHasStarted) {
        setSectionTimeLeft(null)
      }
      return
    }

    // Find section directly in effect
    const currentQ = quiz.questions[currentQuestion]
    if (!currentQ || !currentQ.id) {
      return
    }

    const section = quiz.sections?.find(s =>
      s.questions?.some(q => q && q.id === currentQ.id)
    )

    if (!section || !section.id) {
      return
    }

    // Only update if different section
    if (section.id !== currentSectionId) {

      // Check if this section has a time limit
      const timeLimit = section.settings?.time_limit_minutes as number | undefined

      if (timeLimit && timeLimit > 0) {
        const seconds = timeLimit * 60
        setCurrentSectionId(section.id)
        setSectionTimeLeft(seconds)
      } else {
        setCurrentSectionId(section.id)
        setSectionTimeLeft(null)
      }
    }
  }, [quiz, currentQuestion, currentSectionId])

  // Handle quiz submission (defined before handleTimerExpired which uses it)
  const handleSubmit = useCallback(async () => {
    if (!quiz) {
      setSubmitError('Quiz data not loaded. Please refresh and try again.')
      return
    }

    if (!quiz.id) {
      setSubmitError('Quiz ID is missing. Please refresh and try again.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await submitQuizResponse(
        quiz.id,
        answers,
        sessionId,
        contactData?.email,
        contactData?.name
      )

      if (result.success) {
        setIsSubmitted(true)
      } else {
        setSubmitError(result.error || 'Failed to submit quiz. Please try again.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit quiz. Please try again.'
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }, [quiz, sessionId, answers, contactData, submitQuizResponse])

  // Handle timer expiration (defined before useEffect that uses it)
  const handleTimerExpired = useCallback(() => {
    if (!quiz) return

    if (quiz.structure_type === 'mixed') {
      // For mixed mode quizzes, submit the entire quiz when timer expires
      handleSubmit()
      return
    }

    // For sectioned quizzes, handle section-by-section navigation
    const currentSection = getCurrentQuestionSection()

    if (!currentSection || !currentSection.questions) {
      handleSubmit()
      return
    }

    // Find the last question in current section
    const currentSectionQuestions = quiz.questions.filter(q =>
      q && q.id && currentSection.questions?.some(sq => sq && sq.id === q.id)
    )

    if (currentSectionQuestions.length === 0) {
      handleSubmit()
      return
    }

    const lastQuestionInSection = currentSectionQuestions[currentSectionQuestions.length - 1]
    if (!lastQuestionInSection || !lastQuestionInSection.id) {
      handleSubmit()
      return
    }

    const lastQuestionIndex = quiz.questions.findIndex(q => q && q.id === lastQuestionInSection.id)

    if (lastQuestionIndex >= quiz.questions.length - 1) {
      // This was the last section, auto-submit
      handleSubmit()
    } else {
      // Move to the next section
      setCurrentQuestion(lastQuestionIndex + 1)
    }
  }, [quiz, getCurrentQuestionSection, handleSubmit])

  // Effect to start timer when sectionTimeLeft is set for the first time
  useEffect(() => {
    // Only start timer if we don't already have one running and we have time > 0
    if (!timerRef.current && sectionTimeLeft !== null && sectionTimeLeft > 0) {
      const intervalId = setInterval(() => {
        setSectionTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            return 0 // Don't clear interval here, let the expiration effect handle it
          }
          return prev - 1
        })
      }, 1000)

      timerRef.current = intervalId
      setTimerHasStarted(true)
    }
  }, [sectionTimeLeft])

  // Cleanup effect - only runs on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  // Page refresh/close protection - prevent users from accidentally losing progress
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Only show warning if quiz is in progress (not submitted and has answers or timer running)
      const hasAnswers = Object.keys(answers).length > 0
      const timerActive = timerHasStarted && sectionTimeLeft !== null && sectionTimeLeft > 0
      const quizInProgress = !isSubmitted && (hasAnswers || timerActive)

      if (quizInProgress) {
        event.preventDefault()
        event.returnValue = '' // Required for Chrome
        return '' // Required for some older browsers
      }
    }

    // Add the event listener
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [answers, timerHasStarted, sectionTimeLeft, isSubmitted])

  // Separate effect to handle timer expiration
  useEffect(() => {
    if (sectionTimeLeft === 0 && timerRef.current && timerHasStarted) {
      clearInterval(timerRef.current)
      timerRef.current = null
      setTimerHasStarted(false)
      handleTimerExpired()
    }
  }, [sectionTimeLeft, handleTimerExpired, timerHasStarted])


  // Handle contact form submission
  const handleContactSubmit = useCallback((data: { email: string; name?: string }) => {
    setContactData(data)
    setHasProvidedContact(true)
    setShowContactForm(false)
  }, [])

  // Handle contact form skip
  const handleContactSkip = useCallback(() => {
    setHasProvidedContact(true)
    setShowContactForm(false)
  }, [])


  // Format time for display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  const handleAnswerChange = useCallback((questionId: string, answer: unknown) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }, [])

  const handleNext = useCallback(() => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }, [quiz, currentQuestion])

  // Helper function to check if backward navigation is allowed
  const isBackwardNavigationAllowed = useCallback(() => {
    if (!quiz) {
      return true
    }

    if (quiz.structure_type === 'sectioned') {
      const section = getCurrentQuestionSection()
      const allowBackward = section?.settings?.allow_backward_navigation as boolean | undefined
      return allowBackward !== false // Default to true if not explicitly set to false
    } else {
      // Mixed mode - check global settings
      const allowBackward = quiz.settings?.allow_backward_navigation as boolean | undefined
      return allowBackward !== false // Default to true if not explicitly set to false
    }
  }, [quiz, getCurrentQuestionSection])

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0 && isBackwardNavigationAllowed()) {
      setCurrentQuestion(prev => prev - 1)
    }
  }, [currentQuestion, isBackwardNavigationAllowed])

  // Helper function to check if this is the first question in its section
  const isFirstQuestionInSection = useCallback(() => {
    if (!quiz || !quiz.sections || quiz.structure_type !== 'sectioned') {
      return false
    }

    const currentQ = quiz.questions[currentQuestion]
    const section = getCurrentQuestionSection()

    if (!section || !currentQ || !currentQ.id) return false
    if (!section.questions || section.questions.length === 0) return false

    // Check if this is the first question in the section
    const sectionQuestions = section.questions.sort((a, b) => a.order_index - b.order_index)
    return sectionQuestions[0]?.id === currentQ.id
  }, [quiz, currentQuestion, getCurrentQuestionSection])

  // Helper function to check if progress bar should be shown
  const shouldShowProgressBar = useCallback(() => {
    if (!quiz || quiz.structure_type !== 'sectioned') {
      return true // Show progress bar for non-sectioned quizzes
    }

    const section = getCurrentQuestionSection()
    const showProgressBar = section?.settings?.show_progress_bar as boolean | undefined
    return showProgressBar !== false // Default to true if not explicitly set to false
  }, [quiz, getCurrentQuestionSection])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  if (error || loadError) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <AlertCircle className='h-12 w-12 text-destructive mx-auto mb-4' />
              <h2 className='text-xl font-semibold mb-2'>Unable to Load Quiz</h2>
              <p className='text-muted-foreground mb-4'>
                {error || loadError || 'The quiz you\'re looking for doesn\'t exist or has been unpublished.'}
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant='outline'
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <AlertCircle className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h2 className='text-xl font-semibold mb-2'>Quiz Not Found</h2>
              <p className='text-muted-foreground'>
                The quiz you're looking for doesn't exist or has been unpublished.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    if (!quiz) {
      return (
        <div className='flex items-center justify-center min-h-screen'>
          <Card className='w-full max-w-md'>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <CheckCircle className='h-12 w-12 text-green-600 mx-auto mb-4' />
                <h2 className='text-xl font-semibold mb-2'>Quiz Submitted Successfully</h2>
                <p className='text-muted-foreground mb-4'>
                  Your responses have been recorded. Thank you for completing the quiz!
                </p>
                <Button onClick={() => window.location.reload()} variant='outline'>
                  Take Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
    return <QuizResults quiz={quiz} answers={answers} />
  }

  const contactRequirement = quiz.settings?.contact_requirement || 'optional'
  const isContactRequired = contactRequirement === 'required'

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100
  const currentQ = quiz.questions[currentQuestion]

  if (!currentQ) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <AlertCircle className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h2 className='text-xl font-semibold mb-2'>Question Not Found</h2>
              <p className='text-muted-foreground mb-4'>
                Unable to load the current question.
              </p>
              <Button onClick={() => window.location.reload()} variant='outline'>
                Reload Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isLastQuestion = currentQuestion === quiz.questions.length - 1
  const hasAnswer = answers[currentQ.id] !== undefined

  return (
    <>
      {/* Pre-Quiz Contact Form */}
      {showContactForm && (
        <PreQuizContactForm
          isOpen={showContactForm}
          isRequired={isContactRequired}
          quizTitle={quiz.title}
          onSubmit={handleContactSubmit}
          onSkip={contactRequirement === 'optional' ? handleContactSkip : undefined}
        />
      )}

        <div className='container max-w-4xl mx-auto py-8 px-4'>
          {/* Quiz Header */}
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle className='text-2xl'>{quiz.title}</CardTitle>
              {quiz.description && (
                <p className='text-muted-foreground'>{quiz.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm text-muted-foreground'>
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </span>
                <div className='flex items-center gap-4'>
                  {sectionTimeLeft !== null && (
                    <div className='flex items-center gap-2 text-sm font-medium text-orange-600'>
                      <Clock className='h-4 w-4' />
                      <span>{formatTime(sectionTimeLeft)}</span>
                    </div>
                  )}
                  <span className='text-sm text-muted-foreground'>
                    {Math.round(progress)}% Complete
                  </span>
                </div>
              </div>
              {shouldShowProgressBar() && (
                <Progress value={progress} className='h-2' />
              )}
            </CardContent>
          </Card>

          {/* Section Header (for sectioned quizzes) */}
          {quiz.structure_type === 'sectioned' && isFirstQuestionInSection() && (() => {
            const section = getCurrentQuestionSection()
            return section ? (
              <Card className='mb-6 border-primary/20 bg-primary/5'>
                <CardContent className='pt-6'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold'>
                      S
                    </div>
                    <div>
                      <h2 className='text-xl font-semibold text-foreground'>{section.title}</h2>
                      {section.description && (
                        <p className='text-sm text-muted-foreground mt-1'>{section.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null
          })()}

          {/* Question */}
          <Card className='mb-6'>
            <CardContent className='pt-6'>
              <QuestionRenderer
                question={currentQ}
                answer={answers[currentQ.id]}
                onAnswerChange={(answer) => handleAnswerChange(currentQ.id, answer)}
              />
            </CardContent>
          </Card>

          {/* Submit Error Alert */}
          {submitError && (
            <Alert variant='destructive' className='mb-6'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                {submitError}
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation */}
          <div className='flex items-center justify-between'>
            <Button
              variant='outline'
              onClick={handlePrevious}
              disabled={currentQuestion === 0 || isSubmitting || !isBackwardNavigationAllowed() || isFirstQuestionInSection()}
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Previous
            </Button>

            <div className='flex gap-2'>
              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!hasAnswer || isSubmitting}
                  className='bg-green-600 hover:bg-green-700'
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className='h-4 w-4 mr-2' />
                      Submit Quiz
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!hasAnswer || isSubmitting}
                >
                  Next
                  <ArrowRight className='h-4 w-4 ml-2' />
                </Button>
              )}
            </div>
          </div>
        </div>
    </>
  )
}