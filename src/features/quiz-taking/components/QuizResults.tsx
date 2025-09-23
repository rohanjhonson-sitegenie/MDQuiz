// QuizResults - Displays quiz completion confirmation and basic results
// Shows after successful submission with option to take again

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, RotateCcw, Home } from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface Quiz {
  id: string
  title: string
  description?: string
  questions: unknown[]
}

interface QuizResultsProps {
  quiz: Quiz
  answers: Record<string, unknown>
}

export function QuizResults({ quiz, answers }: QuizResultsProps) {
  const answeredQuestions = Object.keys(answers).length
  const totalQuestions = quiz.questions.length
  const completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100)

  return (
    <div className='container max-w-2xl mx-auto py-12 px-4'>
      <Card className='text-center'>
        <CardHeader className='pb-4'>
          <div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
            <CheckCircle className='h-8 w-8 text-green-600' />
          </div>
          <CardTitle className='text-2xl text-green-600'>
            Quiz Completed!
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-6'>
          <div>
            <h3 className='text-lg font-medium mb-2'>{quiz.title}</h3>
            <p className='text-muted-foreground'>
              Thank you for completing this quiz. Your responses have been submitted successfully.
            </p>
          </div>

          <div className='bg-muted/50 rounded-lg p-4'>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <p className='text-muted-foreground'>Questions Answered</p>
                <p className='font-medium'>{answeredQuestions} of {totalQuestions}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Completion Rate</p>
                <p className='font-medium'>{completionPercentage}%</p>
              </div>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <Button
              onClick={() => window.location.reload()}
              variant='outline'
              className='flex items-center gap-2'
            >
              <RotateCcw className='h-4 w-4' />
              Take Again
            </Button>

            <Button asChild>
              <Link to='/'>
                <Home className='h-4 w-4 mr-2' />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className='text-xs text-muted-foreground pt-4 border-t'>
            <p>
              Your responses are stored anonymously. No personal information is collected.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}