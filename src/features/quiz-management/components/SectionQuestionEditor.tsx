// Section-aware question editor for adding and editing questions within sections
// Provides a form-based interface for creating questions with different types

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Plus, X, Save, ArrowUp, ArrowDown, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Question, QuestionType, QuizSection } from '@/types/quiz.types'
import { QUESTION_TYPE_REGISTRY } from '@/lib/question-type-registry'

interface SectionQuestionEditorProps {
  section: QuizSection
  questions: Question[]
  onAddQuestion: (question: Omit<Question, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => Promise<void>
  onDeleteQuestion: (questionId: string) => Promise<void>
  onReorderQuestions: (questionOrders: { id: string; order_index: number }[]) => Promise<void>
  isLoading?: boolean
  className?: string
}

export function SectionQuestionEditor({
  section,
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onReorderQuestions,
  isLoading = false,
  className
}: SectionQuestionEditorProps) {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question_type: 'multiple_choice',
    question_text: '',
    question_content: {},
    options: { choices: ['Option A', 'Option B'] },
    answer_data: { correct_answer: '', explanation: '' }
  })

  const allowedQuestionTypes = section.settings.allowed_question_types || ['multiple_choice', 'true_false', 'text_input']
  const sectionQuestions = questions.filter(q => q.section_id === section.id).sort((a, b) => a.order_index - b.order_index)

  const handleQuestionTypeChange = useCallback((questionType: QuestionType) => {
    const typeDefinition = QUESTION_TYPE_REGISTRY[questionType]
    setNewQuestion(prev => ({
      ...prev,
      question_type: questionType,
      options: typeDefinition.defaultOptions,
      answer_data: typeDefinition.defaultAnswerData
    }))
  }, [])

  const handleAddQuestion = useCallback(async () => {
    if (!newQuestion.question_text?.trim()) return

    try {
      await onAddQuestion({
        ...newQuestion,
        section_id: section.id,
        quiz_id: section.quiz_id,
        order_index: sectionQuestions.length,
        question_text: newQuestion.question_text,
        question_type: newQuestion.question_type || 'multiple_choice',
        question_content: newQuestion.question_content || {},
        options: newQuestion.options || {},
        answer_data: newQuestion.answer_data || {}
      } as Omit<Question, 'id' | 'created_at' | 'updated_at'>)

      // Reset form
      setNewQuestion({
        question_type: 'multiple_choice',
        question_text: '',
        question_content: {},
        options: { choices: ['Option A', 'Option B'] },
        answer_data: { correct_answer: '', explanation: '' }
      })
      setIsAddingQuestion(false)
    } catch (error) {
      console.error('Failed to add question:', error)
    }
  }, [newQuestion, section, sectionQuestions.length, onAddQuestion])

  const handleMoveQuestion = useCallback((questionId: string, direction: 'up' | 'down') => {
    const currentIndex = sectionQuestions.findIndex(q => q.id === questionId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= sectionQuestions.length) return

    const reorderedQuestions = [...sectionQuestions]
    const [movedQuestion] = reorderedQuestions.splice(currentIndex, 1)
    reorderedQuestions.splice(newIndex, 0, movedQuestion)

    const questionOrders = reorderedQuestions.map((question, index) => ({
      id: question.id,
      order_index: index
    }))

    onReorderQuestions(questionOrders)
  }, [sectionQuestions, onReorderQuestions])

  const renderQuestionEditor = (question: Partial<Question>, isNew: boolean = false) => {
    const questionType = question.question_type || 'multiple_choice'
    const typeDefinition = QUESTION_TYPE_REGISTRY[questionType]

    return (
      <div className="space-y-4">
        {/* Question Type Selection */}
        <div className="space-y-2">
          <Label>Question Type</Label>
          <Select
            value={questionType}
            onValueChange={(value: QuestionType) => {
              if (isNew) {
                handleQuestionTypeChange(value)
              } else {
                // Handle existing question type change
                onUpdateQuestion(question.id!, { question_type: value })
              }
            }}
            disabled={!isNew} // Don't allow changing type for existing questions
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allowedQuestionTypes.map(type => {
                const definition = QUESTION_TYPE_REGISTRY[type]
                return (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      <span>{definition.displayName}</span>
                      <Badge variant="outline" className="text-xs">
                        {definition.category}
                      </Badge>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{typeDefinition.description}</p>
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <Label>Question Text</Label>
          <Textarea
            value={question.question_text || ''}
            onChange={(e) => {
              if (isNew) {
                setNewQuestion(prev => ({ ...prev, question_text: e.target.value }))
              } else {
                onUpdateQuestion(question.id!, { question_text: e.target.value })
              }
            }}
            placeholder="Enter your question..."
            rows={3}
          />
        </div>

        {/* Question Type Specific Options */}
        {questionType === 'multiple_choice' && (
          <div className="space-y-3">
            <Label>Answer Choices</Label>
            {(question.options?.choices || []).map((choice, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={choice}
                  onChange={(e) => {
                    const newChoices = [...(question.options?.choices || [])]
                    newChoices[index] = e.target.value
                    const updates = {
                      options: { ...question.options, choices: newChoices }
                    }
                    if (isNew) {
                      setNewQuestion(prev => ({ ...prev, ...updates }))
                    } else {
                      onUpdateQuestion(question.id!, updates)
                    }
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                />
                <Switch
                  checked={question.options?.correct_index === index}
                  onCheckedChange={(checked) => {
                    const updates = {
                      options: { ...question.options, correct_index: checked ? index : undefined },
                      answer_data: { ...question.answer_data, correct_answer: checked ? choice : '' }
                    }
                    if (isNew) {
                      setNewQuestion(prev => ({ ...prev, ...updates }))
                    } else {
                      onUpdateQuestion(question.id!, updates)
                    }
                  }}
                  aria-label="Mark as correct answer"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newChoices = (question.options?.choices || []).filter((_, i) => i !== index)
                    const updates = {
                      options: { ...question.options, choices: newChoices }
                    }
                    if (isNew) {
                      setNewQuestion(prev => ({ ...prev, ...updates }))
                    } else {
                      onUpdateQuestion(question.id!, updates)
                    }
                  }}
                  disabled={(question.options?.choices || []).length <= 2}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newChoices = [...(question.options?.choices || []), `Option ${String.fromCharCode(65 + (question.options?.choices || []).length)}`]
                const updates = {
                  options: { ...question.options, choices: newChoices }
                }
                if (isNew) {
                  setNewQuestion(prev => ({ ...prev, ...updates }))
                } else {
                  onUpdateQuestion(question.id!, updates)
                }
              }}
              disabled={(question.options?.choices || []).length >= 10}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Choice
            </Button>
          </div>
        )}

        {questionType === 'true_false' && (
          <div className="space-y-3">
            <Label>Correct Answer</Label>
            <Select
              value={question.answer_data?.correct_answer || 'true'}
              onValueChange={(value) => {
                const updates = {
                  answer_data: { ...question.answer_data, correct_answer: value }
                }
                if (isNew) {
                  setNewQuestion(prev => ({ ...prev, ...updates }))
                } else {
                  onUpdateQuestion(question.id!, updates)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {questionType === 'text_input' && (
          <div className="space-y-2">
            <Label>Expected Answer</Label>
            <Input
              value={question.answer_data?.correct_answer || ''}
              onChange={(e) => {
                const updates = {
                  answer_data: { ...question.answer_data, correct_answer: e.target.value }
                }
                if (isNew) {
                  setNewQuestion(prev => ({ ...prev, ...updates }))
                } else {
                  onUpdateQuestion(question.id!, updates)
                }
              }}
              placeholder="Enter the expected answer..."
            />
          </div>
        )}

        {/* Explanation */}
        <div className="space-y-2">
          <Label>Explanation (Optional)</Label>
          <Textarea
            value={question.answer_data?.explanation || ''}
            onChange={(e) => {
              const updates = {
                answer_data: { ...question.answer_data, explanation: e.target.value }
              }
              if (isNew) {
                setNewQuestion(prev => ({ ...prev, ...updates }))
              } else {
                onUpdateQuestion(question.id!, updates)
              }
            }}
            placeholder="Explain why this is the correct answer..."
            rows={2}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{section.title}</h3>
          <p className="text-sm text-muted-foreground">
            {sectionQuestions.length} question{sectionQuestions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => setIsAddingQuestion(true)}
          size="sm"
          disabled={isLoading || isAddingQuestion}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Question
        </Button>
      </div>

      {/* Allowed Question Types */}
      <div className="flex flex-wrap gap-1">
        {allowedQuestionTypes.map(type => {
          const definition = QUESTION_TYPE_REGISTRY[type]
          return (
            <Badge key={type} variant="secondary" className="text-xs">
              {definition.displayName}
            </Badge>
          )
        })}
      </div>

      <Separator />

      {/* Add New Question Form */}
      {isAddingQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderQuestionEditor(newQuestion, true)}
            <div className="flex gap-2">
              <Button onClick={handleAddQuestion} disabled={isLoading || !newQuestion.question_text?.trim()}>
                <Save className="h-4 w-4 mr-1" />
                Add Question
              </Button>
              <Button variant="outline" onClick={() => setIsAddingQuestion(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Questions */}
      <div className="space-y-3">
        {sectionQuestions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Q{index + 1}</span>
                  <Badge variant="outline" className="text-xs">
                    {QUESTION_TYPE_REGISTRY[question.question_type].displayName}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveQuestion(question.id, 'up')}
                    disabled={index === 0 || isLoading}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveQuestion(question.id, 'down')}
                    disabled={index === sectionQuestions.length - 1 || isLoading}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteQuestion(question.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">{question.question_text}</p>
                  {question.answer_data?.explanation && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Explanation:</strong> {question.answer_data.explanation}
                    </p>
                  )}
                </div>

                {question.question_type === 'multiple_choice' && question.options?.choices && (
                  <div className="space-y-1">
                    {question.options.choices.map((choice, choiceIndex) => (
                      <div key={choiceIndex} className="flex items-center gap-2 text-sm">
                        <span className={cn(
                          "w-6 h-6 flex items-center justify-center rounded border text-xs",
                          question.options?.correct_index === choiceIndex
                            ? "bg-green-100 border-green-500 text-green-700"
                            : "bg-muted border-border"
                        )}>
                          {String.fromCharCode(65 + choiceIndex)}
                        </span>
                        <span>{choice}</span>
                      </div>
                    ))}
                  </div>
                )}

                {question.question_type === 'true_false' && (
                  <p className="text-sm">
                    <strong>Answer:</strong> {question.answer_data?.correct_answer}
                  </p>
                )}

                {question.question_type === 'text_input' && (
                  <p className="text-sm">
                    <strong>Expected Answer:</strong> {question.answer_data?.correct_answer}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sectionQuestions.length === 0 && !isAddingQuestion && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No questions in this section yet.</p>
          <p className="text-sm">Click "Add Question" to get started.</p>
        </div>
      )}
    </div>
  )
}