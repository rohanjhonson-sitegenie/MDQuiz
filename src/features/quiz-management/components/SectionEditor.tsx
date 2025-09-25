import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Trash2, Save, Plus, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import type { QuizSection, QuestionType, SectionSettings } from '@/types/quiz.types'
import { QuestionTypeRegistry } from '@/lib/question-type-registry'

interface SectionEditorProps {
  section: QuizSection
  onUpdate: (updates: Partial<QuizSection>) => void
  onDelete: () => void
  className?: string
}

export function SectionEditor({ section, onUpdate, onDelete, className }: SectionEditorProps) {
  const [title, setTitle] = useState(section.title)
  const [description, setDescription] = useState(section.description || '')
  const [settings, setSettings] = useState<SectionSettings>(section.settings)
  const [hasChanges, setHasChanges] = useState(false)

  // Track changes
  useEffect(() => {
    const hasChanges = (
      title !== section.title ||
      description !== (section.description || '') ||
      JSON.stringify(settings) !== JSON.stringify(section.settings)
    )
    setHasChanges(hasChanges)
  }, [title, description, settings, section])

  const handleSave = () => {
    onUpdate({
      title,
      description,
      settings
    })
    setHasChanges(false)
  }

  const handleSettingChange = (key: keyof SectionSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const addAllowedQuestionType = (type: QuestionType) => {
    const current = settings.allowed_question_types || []
    if (!current.includes(type)) {
      handleSettingChange('allowed_question_types', [...current, type])
    }
  }

  const removeAllowedQuestionType = (type: QuestionType) => {
    const current = settings.allowed_question_types || []
    handleSettingChange('allowed_question_types', current.filter(t => t !== type))
  }

  const questionTypes = QuestionTypeRegistry.getAllTypes()
  const allowedTypes = settings.allowed_question_types || []
  const availableTypes = questionTypes.filter(qt => !allowedTypes.includes(qt.type))

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Section Settings</CardTitle>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="secondary" className="text-xs">
                Unsaved changes
              </Badge>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              size="sm"
              className="h-8"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button
              onClick={onDelete}
              variant="destructive"
              size="sm"
              className="h-8"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="section-title">Section Title</Label>
            <Input
              id="section-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter section title..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="section-description">Description (Optional)</Label>
            <Textarea
              id="section-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter section description..."
              className="mt-1"
              rows={2}
            />
          </div>
        </div>

        <Separator />

        {/* Question Type Constraints */}
        <div className="space-y-3">
          <Label>Allowed Question Types</Label>

          {/* Current allowed types */}
          <div className="flex flex-wrap gap-2">
            {allowedTypes.map(type => {
              const definition = QuestionTypeRegistry.getDefinition(type)
              return (
                <Badge
                  key={type}
                  variant="default"
                  className="flex items-center gap-1"
                >
                  {definition?.displayName || type}
                  <Button
                    onClick={() => removeAllowedQuestionType(type)}
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )
            })}
          </div>

          {/* Add new types */}
          {availableTypes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableTypes.map(definition => (
                <Button
                  key={definition.type}
                  onClick={() => addAllowedQuestionType(definition.type)}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {definition.displayName}
                </Button>
              ))}
            </div>
          )}

          {allowedTypes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No question type restrictions (all types allowed)
            </p>
          )}
        </div>

        <Separator />

        {/* Timing & Navigation */}
        <div className="space-y-3">
          <Label>Timing & Navigation</Label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="time-limit" className="text-sm">
                Time Limit (minutes)
              </Label>
              <Input
                id="time-limit"
                type="number"
                min="1"
                max="120"
                value={settings.time_limit_minutes || ''}
                onChange={(e) => handleSettingChange('time_limit_minutes',
                  e.target.value ? parseInt(e.target.value) : undefined
                )}
                placeholder="No limit"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="question-limit" className="text-sm">
                Max Questions
              </Label>
              <Input
                id="question-limit"
                type="number"
                min="1"
                max="100"
                value={settings.question_count_limit || ''}
                onChange={(e) => handleSettingChange('question_count_limit',
                  e.target.value ? parseInt(e.target.value) : undefined
                )}
                placeholder="No limit"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="allow-backward" className="text-sm">
              Allow backward navigation
            </Label>
            <Switch
              id="allow-backward"
              checked={settings.allow_backward_navigation ?? true}
              onCheckedChange={(checked) =>
                handleSettingChange('allow_backward_navigation', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="require-completion" className="text-sm">
              Require completion before next section
            </Label>
            <Switch
              id="require-completion"
              checked={settings.require_completion_before_next ?? false}
              onCheckedChange={(checked) =>
                handleSettingChange('require_completion_before_next', checked)
              }
            />
          </div>
        </div>

        <Separator />

        {/* Display Options */}
        <div className="space-y-3">
          <Label>Display Options</Label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="points-per-question" className="text-sm">
                Points per question
              </Label>
              <Input
                id="points-per-question"
                type="number"
                min="0"
                max="20"
                value={settings.points_per_question || ''}
                onChange={(e) => handleSettingChange('points_per_question',
                  e.target.value ? parseInt(e.target.value) : undefined
                )}
                placeholder="1"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="questions-per-page" className="text-sm">
                Questions per page
              </Label>
              <Input
                id="questions-per-page"
                type="number"
                min="1"
                max="10"
                value={settings.questions_per_page || ''}
                onChange={(e) => handleSettingChange('questions_per_page',
                  e.target.value ? parseInt(e.target.value) : undefined
                )}
                placeholder="All"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="shuffle-questions" className="text-sm">
              Shuffle questions in this section
            </Label>
            <Switch
              id="shuffle-questions"
              checked={settings.shuffle_questions ?? false}
              onCheckedChange={(checked) =>
                handleSettingChange('shuffle_questions', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-feedback" className="text-sm">
              Show section feedback
            </Label>
            <Switch
              id="show-feedback"
              checked={settings.show_section_feedback ?? true}
              onCheckedChange={(checked) =>
                handleSettingChange('show_section_feedback', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-progress" className="text-sm">
              Show progress bar
            </Label>
            <Switch
              id="show-progress"
              checked={settings.show_progress_bar ?? true}
              onCheckedChange={(checked) =>
                handleSettingChange('show_progress_bar', checked)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}