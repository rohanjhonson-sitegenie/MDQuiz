// QuizResponseTable - Individual response data table with export
// Uses existing DataTable component with custom columns for responses

import { useEffect, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { QuizRepository } from '@/services/quiz-repository'
import { createClient } from '@/lib/supabase'
import { DataTable } from '@/components/ui/data-table/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Download, Calendar, User, ChevronDown, ChevronRight, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuizResponseTableProps {
  quizId: string
}

interface ResponseData {
  id: string
  session_id: string
  answers: Record<string, unknown>
  respondent_name?: string
  respondent_email?: string
  submitted_at: string
}

interface QuizQuestion {
  id: string
  question_text: string
  question_type: string
  options: Record<string, unknown>
  answer_data: Record<string, unknown>
}

export function QuizResponseTable({ quizId }: QuizResponseTableProps) {
  const [responses, setResponses] = useState<ResponseData[]>([])
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const supabase = createClient()
        const repository = new QuizRepository(supabase)

        // Load both responses and quiz questions
        const [responsesData, quizData] = await Promise.all([
          repository.getQuizResponses(quizId),
          repository.getQuizById(quizId) // This includes questions by default
        ])

        setResponses(responsesData as ResponseData[])
        setQuestions(quizData?.questions || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    if (quizId) {
      loadData()
    }
  }, [quizId])

  // Helper functions for answer analysis
  const getAnswerText = (question: QuizQuestion, userAnswer: unknown): string => {
    if (question.question_type === 'multiple_choice') {
      const choices = (question.options as { choices?: Array<{ id: number; text: string }> }).choices || []
      const choice = choices.find(c => c.id === userAnswer)
      return choice ? choice.text : `Option ${userAnswer}`
    }
    if (question.question_type === 'true_false') {
      return userAnswer === true ? 'True' : 'False'
    }
    if (question.question_type === 'text_input') {
      return String(userAnswer || 'No answer')
    }
    return String(userAnswer || 'No answer')
  }

  const getCorrectAnswerText = (question: QuizQuestion): string => {
    if (question.question_type === 'multiple_choice') {
      const options = question.options as { choices?: Array<{ id: number; text: string }>; correct_index?: number }
      const choices = options.choices || []
      const correctChoice = choices.find(c => c.id === options.correct_index)
      return correctChoice ? correctChoice.text : 'Unknown'
    }
    if (question.question_type === 'true_false') {
      const answerData = question.answer_data as { correct_answer?: boolean }
      return answerData.correct_answer === true ? 'True' : 'False'
    }
    if (question.question_type === 'text_input') {
      const answerData = question.answer_data as { correct_answer?: string }
      return answerData.correct_answer || 'No answer provided'
    }
    return 'Unknown'
  }

  const isAnswerCorrect = (question: QuizQuestion, userAnswer: unknown): boolean => {
    if (question.question_type === 'multiple_choice') {
      const options = question.options as { correct_index?: number }
      return userAnswer === options.correct_index
    }
    if (question.question_type === 'true_false') {
      const answerData = question.answer_data as { correct_answer?: boolean }
      return userAnswer === answerData.correct_answer
    }
    if (question.question_type === 'text_input') {
      const answerData = question.answer_data as { correct_answer?: string }
      return String(userAnswer || '').toLowerCase().trim() === (answerData.correct_answer || '').toLowerCase().trim()
    }
    return false
  }

  const getResponseScore = (response: ResponseData): { correct: number; total: number } => {
    let correct = 0
    let total = 0

    Object.entries(response.answers).forEach(([questionId, userAnswer]) => {
      const question = questions.find(q => q.id === questionId)
      if (question) {
        total++
        if (isAnswerCorrect(question, userAnswer)) {
          correct++
        }
      }
    })

    return { correct, total }
  }

  // Component for detailed answer breakdown
  const AnswerDetails = ({ response }: { response: ResponseData }) => {
    const [isOpen, setIsOpen] = useState(false)
    const score = getResponseScore(response)

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Badge
              variant={score.correct === score.total ? "default" : score.correct > score.total * 0.5 ? "secondary" : "destructive"}
              className="text-xs"
            >
              {score.correct}/{score.total} correct
            </Badge>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-2 max-w-2xl">
            {Object.entries(response.answers).map(([questionId, userAnswer]) => {
              const question = questions.find(q => q.id === questionId)
              if (!question) return null

              const correct = isAnswerCorrect(question, userAnswer)
              const userAnswerText = getAnswerText(question, userAnswer)
              const correctAnswerText = getCorrectAnswerText(question)

              return (
                <div
                  key={questionId}
                  className={cn(
                    "p-3 rounded-lg border text-sm",
                    correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  )}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {correct ? (
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate" title={question.question_text}>
                        {question.question_text.length > 60
                          ? `${question.question_text.substring(0, 60)}...`
                          : question.question_text}
                      </p>
                    </div>
                  </div>
                  <div className="ml-6 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Given:</span>
                      <span className={correct ? "text-green-700" : "text-red-700 font-medium"}>
                        {userAnswerText}
                      </span>
                    </div>
                    {!correct && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Correct:</span>
                        <span className="text-green-700 font-medium">{correctAnswerText}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  const handleExport = async () => {
    try {
      // Create headers with question columns
      const baseHeaders = ['Session ID', 'Respondent Name', 'Respondent Email', 'Score', 'Total Questions', 'Submitted At']

      // Add question-specific columns
      const questionHeaders: string[] = []
      questions.forEach((question, index) => {
        const questionNum = index + 1
        questionHeaders.push(
          `Q${questionNum} Question`,
          `Q${questionNum} Given Answer`,
          `Q${questionNum} Correct Answer`,
          `Q${questionNum} Status`
        )
      })

      const allHeaders = [...baseHeaders, ...questionHeaders]

      // Create CSV rows
      const csvRows = responses.map(response => {
        const score = getResponseScore(response)
        const baseData = [
          response.session_id,
          response.respondent_name || 'Anonymous',
          response.respondent_email || 'N/A',
          `${score.correct}/${score.total}`,
          score.total.toString(),
          new Date(response.submitted_at).toLocaleString()
        ]

        // Add question-specific data
        const questionData: string[] = []
        questions.forEach((question) => {
          const userAnswer = response.answers[question.id]
          const userAnswerText = userAnswer !== undefined ? getAnswerText(question, userAnswer) : 'No answer'
          const correctAnswerText = getCorrectAnswerText(question)
          const isCorrect = userAnswer !== undefined ? isAnswerCorrect(question, userAnswer) : false

          // Escape quotes and commas for CSV
          const escapeCSV = (text: string) => {
            if (text.includes(',') || text.includes('"') || text.includes('\n')) {
              return `"${text.replace(/"/g, '""')}"`
            }
            return text
          }

          questionData.push(
            escapeCSV(question.question_text),
            escapeCSV(userAnswerText),
            escapeCSV(correctAnswerText),
            isCorrect ? 'Correct' : 'Incorrect'
          )
        })

        return [...baseData, ...questionData].join(',')
      })

      const csvContent = [allHeaders.join(','), ...csvRows].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `quiz-responses-detailed-${quizId}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (_err) {
      // Export failed silently
    }
  }

  const columns: ColumnDef<ResponseData>[] = [
    {
      accessorKey: 'session_id',
      header: 'Session ID',
      cell: ({ row }) => (
        <div className='font-mono text-sm'>
          {row.getValue('session_id') as string}
        </div>
      ),
    },
    {
      accessorKey: 'respondent_name',
      header: 'Respondent',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <User className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm'>
            {(row.getValue('respondent_name') as string) || 'Anonymous'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'answers',
      header: 'Responses',
      cell: ({ row }) => {
        return <AnswerDetails response={row.original} />
      },
    },
    {
      accessorKey: 'submitted_at',
      header: 'Submitted',
      cell: ({ row }) => (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Calendar className='h-4 w-4' />
          {new Date(row.getValue('submitted_at') as string).toLocaleDateString()}
        </div>
      ),
    },
  ]

  if (error) {
    return (
      <div className='border border-destructive bg-destructive/5 rounded-lg p-4'>
        <p className='text-destructive text-sm'>Error loading responses: {error}</p>
      </div>
    )
  }

  const toolbar = (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <span className='text-sm text-muted-foreground'>
          {responses.length} response{responses.length !== 1 ? 's' : ''}
        </span>
      </div>
      <Button
        variant='outline'
        size='sm'
        onClick={handleExport}
        disabled={responses.length === 0}
        className='flex items-center gap-2'
      >
        <Download className='h-4 w-4' />
        Export CSV
      </Button>
    </div>
  )

  return (
    <div className='space-y-4'>
      <DataTable
        columns={columns}
        data={responses}
        toolbar={toolbar}
        pagination={true}
        enableRowSelection={false}
      />

      {responses.length === 0 && !isLoading && (
        <div className='text-center py-8 text-muted-foreground'>
          <p>No responses yet for this quiz</p>
          <p className='text-xs mt-1'>Responses will appear here once users submit the quiz</p>
        </div>
      )}
    </div>
  )
}