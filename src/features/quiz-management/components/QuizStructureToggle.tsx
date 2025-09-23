import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface QuizStructureToggleProps {
  currentMode: 'mixed' | 'sectioned'
  onModeChange: (mode: 'mixed' | 'sectioned') => void
  questionCount: number
  sectionCount?: number
  isLoading?: boolean
  className?: string
}

export function QuizStructureToggle({
  currentMode,
  onModeChange,
  questionCount,
  sectionCount = 0,
  isLoading = false,
  className
}: QuizStructureToggleProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingMode, setPendingMode] = useState<'mixed' | 'sectioned' | null>(null)
  const [featureCardsExpanded, setFeatureCardsExpanded] = useState(false)

  const handleToggle = (newMode: 'mixed' | 'sectioned') => {
    // If switching to sectioned and there are already questions, show confirmation
    if (newMode === 'sectioned' && currentMode === 'mixed' && questionCount > 0 && sectionCount === 0) {
      setPendingMode(newMode)
      setShowConfirmation(true)
      return
    }

    // If switching to mixed from sectioned with sections, show confirmation
    if (newMode === 'mixed' && currentMode === 'sectioned' && sectionCount > 0) {
      setPendingMode(newMode)
      setShowConfirmation(true)
      return
    }

    // Safe to switch directly
    onModeChange(newMode)
  }

  const confirmModeChange = () => {
    if (pendingMode) {
      onModeChange(pendingMode)
      setPendingMode(null)
      setShowConfirmation(false)
    }
  }

  const cancelModeChange = () => {
    setPendingMode(null)
    setShowConfirmation(false)
  }

  const isSwitched = currentMode === 'sectioned'

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="structure-toggle" className="text-sm font-medium">
                  Quiz Structure
                </Label>
              </div>

              <Badge
                variant={currentMode === 'sectioned' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {currentMode === 'sectioned' ? 'Sectioned' : 'Mixed'}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground text-right">
                <div>{questionCount} questions</div>
                {currentMode === 'sectioned' && (
                  <div>{sectionCount} sections</div>
                )}
              </div>

              <Switch
                id="structure-toggle"
                checked={isSwitched}
                onCheckedChange={(checked) => handleToggle(checked ? 'sectioned' : 'mixed')}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            {currentMode === 'mixed' ? (
              <div className="flex items-start gap-2">
                <div>
                  <strong>Mixed Mode:</strong> All questions are in a single sequence.
                  Simple structure, suitable for basic quizzes.
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <div>
                  <strong>Sectioned Mode:</strong> Questions are organized into sections
                  with individual settings for timing, question types, and navigation.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="space-y-3">
              <div>
                <strong>Are you sure you want to switch to {pendingMode} mode?</strong>
              </div>

              {pendingMode === 'sectioned' && currentMode === 'mixed' && questionCount > 0 && (
                <div className="text-sm">
                  Your {questionCount} existing questions will be moved to a new default section.
                  You can then reorganize them into multiple sections as needed.
                </div>
              )}

              {pendingMode === 'mixed' && currentMode === 'sectioned' && sectionCount > 0 && (
                <div className="text-sm">
                  Your {sectionCount} sections will be removed and all questions will be moved
                  to a single sequence. Section-specific settings will be lost.
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={confirmModeChange}
                  size="sm"
                  variant="default"
                  disabled={isLoading}
                >
                  {isLoading ? 'Switching...' : 'Continue'}
                </Button>
                <Button
                  onClick={cancelModeChange}
                  size="sm"
                  variant="outline"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Mode-specific information - Collapsible */}
      {!showConfirmation && (
        <Card className={cn(
          "transition-colors duration-200",
          currentMode === 'sectioned' ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"
        )}>
          <CardContent className="p-3">
            {/* Collapsible Header */}
            <div
              className="flex items-center justify-between cursor-pointer hover:bg-black/5 rounded p-1 -m-1 transition-colors"
              onClick={() => setFeatureCardsExpanded(!featureCardsExpanded)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setFeatureCardsExpanded(!featureCardsExpanded)
                }
              }}
              aria-expanded={featureCardsExpanded}
              aria-label={`${featureCardsExpanded ? 'Hide' : 'Show'} ${currentMode} mode features`}
            >
              <div className={cn(
                "text-xs font-medium",
                currentMode === 'sectioned' ? "text-blue-900" : "text-green-900"
              )}>
                {currentMode === 'sectioned' ? 'Sectioned Mode Features' : 'Mixed Mode Features'}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-4 w-4 p-0",
                  currentMode === 'sectioned' ? "text-blue-700 hover:text-blue-900" : "text-green-700 hover:text-green-900"
                )}
              >
                {featureCardsExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* Collapsible Content */}
            <div className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              featureCardsExpanded ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
            )}>
              <div className="text-xs">
                {currentMode === 'sectioned' ? (
                  <ul className="text-blue-800 space-y-0.5 ml-3 list-disc">
                    <li>Individual section timing and navigation settings</li>
                    <li>Question type restrictions per section</li>
                    <li>Section-specific feedback and scoring</li>
                    <li>Progressive disclosure of quiz content</li>
                  </ul>
                ) : (
                  <ul className="text-green-800 space-y-0.5 ml-3 list-disc">
                    <li>Simple linear question flow</li>
                    <li>Single set of quiz-wide settings</li>
                    <li>Easy question reordering</li>
                    <li>Perfect for straightforward assessments</li>
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}