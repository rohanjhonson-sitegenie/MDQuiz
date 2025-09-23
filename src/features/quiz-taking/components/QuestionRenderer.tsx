// QuestionRenderer - Renders different question types with appropriate UI
// Supports multiple_choice, true_false, and text_input question types

import { useCallback } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
// import { cn } from '@/lib/utils'

interface Question {
  id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'text_input'
  options: Record<string, unknown>
  order_index: number
}

interface QuestionRendererProps {
  question: Question
  answer?: unknown
  onAnswerChange: (answer: unknown) => void
}

export function QuestionRenderer({ question, answer, onAnswerChange }: QuestionRendererProps) {
  const handleMultipleChoiceChange = useCallback((value: string) => {
    onAnswerChange(parseInt(value))
  }, [onAnswerChange])

  const handleTrueFalseChange = useCallback((value: string) => {
    onAnswerChange(value === '0') // Convert '0' (True) to true, '1' (False) to false
  }, [onAnswerChange])

  const handleTextInputChange = useCallback((value: string) => {
    onAnswerChange(value)
  }, [onAnswerChange])

  return (
    <div className='space-y-6'>
      {/* Question Text */}
      <h3 className='text-lg font-medium leading-relaxed'>
        {question.question_text}
      </h3>

      {/* Question Type Specific Rendering */}
      {question.question_type === 'multiple_choice' && (
        <RadioGroup
          value={answer?.toString() || ''}
          onValueChange={handleMultipleChoiceChange}
          className='space-y-3'
        >
          {(() => {
            // Handle both string[] and object[] formats for backward compatibility
            const choices = (question.options as { choices?: string[] | Array<{ id?: number; text: string }> })?.choices || []

            return choices.map((choice, index) => {
              // Normalize choice data - handle both string and object formats
              const choiceData = typeof choice === 'string'
                ? { id: index, text: choice }
                : { id: choice.id ?? index, text: choice.text }

              return (
                <div key={choiceData.id} className='flex items-center space-x-3'>
                  <RadioGroupItem
                    value={choiceData.id.toString()}
                    id={`choice-${choiceData.id}`}
                    className='mt-0.5'
                  />
                  <Label
                    htmlFor={`choice-${choiceData.id}`}
                    className='text-sm leading-relaxed cursor-pointer flex-1'
                  >
                    {choiceData.text}
                  </Label>
                </div>
              )
            })
          })()}
        </RadioGroup>
      )}

      {question.question_type === 'true_false' && (
        <RadioGroup
          value={answer === true ? '0' : answer === false ? '1' : ''}
          onValueChange={handleTrueFalseChange}
          className='space-y-3'
        >
          {(() => {
            // Use the same standardized format as multiple choice
            const choices = (question.options as { choices?: string[] | Array<{ id?: number; text: string }> })?.choices || [
              { id: 0, text: 'True' },
              { id: 1, text: 'False' }
            ]

            return choices.map((choice, index) => {
              // Normalize choice data
              const choiceData = typeof choice === 'string'
                ? { id: index, text: choice }
                : { id: choice.id ?? index, text: choice.text }

              return (
                <div key={choiceData.id} className='flex items-center space-x-3'>
                  <RadioGroupItem
                    value={choiceData.id.toString()}
                    id={`choice-${choiceData.id}`}
                    className='mt-0.5'
                  />
                  <Label
                    htmlFor={`choice-${choiceData.id}`}
                    className='text-sm cursor-pointer'
                  >
                    {choiceData.text}
                  </Label>
                </div>
              )
            })
          })()}
        </RadioGroup>
      )}

      {question.question_type === 'text_input' && (
        <div className='space-y-2'>
          <Label htmlFor='text-answer' className='text-sm font-medium'>
            Your Answer:
          </Label>
          <Textarea
            id='text-answer'
            value={(answer as string) || ''}
            onChange={(e) => handleTextInputChange(e.target.value)}
            placeholder='Type your answer here...'
            className='min-h-[100px] resize-none'
            maxLength={500}
          />
          <p className='text-xs text-muted-foreground text-right'>
            {((answer as string)?.length) || 0}/500 characters
          </p>
        </div>
      )}
    </div>
  )
}