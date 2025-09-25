import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, GripVertical, Clock, Hash, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuizSection } from '@/types/quiz.types'
import { QuestionTypeRegistry } from '@/lib/question-type-registry'

interface SectionListProps {
  sections: QuizSection[]
  selectedSectionId?: string
  onSectionSelect: (sectionId: string) => void
  onSectionReorder: (result: { source: { index: number }; destination: { index: number } }) => void
  onCreateSection: () => void
  className?: string
}

interface SectionItemProps {
  section: QuizSection
  isSelected: boolean
  onSelect: () => void
  index: number
}

function SectionItem({ section, isSelected, onSelect, index }: SectionItemProps) {
  const settings = section.settings || {}
  const allowedTypes = settings.allowed_question_types || []
  const questionCount = section.questions?.length || 0

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        isSelected && 'ring-2 ring-primary shadow-md'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <div className="flex-shrink-0 mt-1">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm truncate">{section.title}</h3>
              <Badge variant="outline" className="text-xs">
                #{index + 1}
              </Badge>
            </div>

            {section.description && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {section.description}
              </p>
            )}

            {/* Section stats */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <span>{questionCount} questions</span>
              </div>

              {settings.time_limit_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{settings.time_limit_minutes}m</span>
                </div>
              )}

              {allowedTypes.length > 0 && allowedTypes.length < 3 && (
                <div className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  <span>
                    {allowedTypes
                      .map(type => QuestionTypeRegistry.getDefinition(type)?.displayName || type)
                      .join(', ')
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Question type badges */}
            {allowedTypes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {allowedTypes.slice(0, 3).map(type => {
                  const definition = QuestionTypeRegistry.getDefinition(type)
                  return (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="text-xs h-5"
                    >
                      {definition?.displayName || type}
                    </Badge>
                  )
                })}
                {allowedTypes.length > 3 && (
                  <Badge variant="secondary" className="text-xs h-5">
                    +{allowedTypes.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SectionList({
  sections,
  selectedSectionId,
  onSectionSelect,
  onSectionReorder,
  onCreateSection,
  className
}: SectionListProps) {
  // Simple drag and drop handling (without external library for now)
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onSectionReorder({
        source: { index: draggedIndex },
        destination: { index: dropIndex }
      })
    }
    setDraggedIndex(null)
  }

  const sortedSections = [...sections].sort((a, b) => a.order_index - b.order_index)

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Quiz Sections</h2>
        <Button
          onClick={onCreateSection}
          size="sm"
          className="h-8"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Section
        </Button>
      </div>

      {sortedSections.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-muted-foreground mb-4">
              <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No sections created yet</p>
              <p className="text-xs">Add your first section to organize questions</p>
            </div>
            <Button onClick={onCreateSection} size="sm">
              <Plus className="h-3 w-3 mr-1" />
              Create First Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedSections.map((section, index) => (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={cn(
                'transition-transform duration-200',
                draggedIndex === index && 'scale-105 opacity-50'
              )}
            >
              <SectionItem
                section={section}
                isSelected={selectedSectionId === section.id}
                onSelect={() => onSectionSelect(section.id)}
                index={index}
              />
            </div>
          ))}
        </div>
      )}

      {/* Section summary */}
      {sortedSections.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>{sortedSections.length} sections total</span>
                <span>
                  {sortedSections.reduce((total, section) =>
                    total + (section.questions?.length || 0), 0
                  )} questions total
                </span>
              </div>
              {sortedSections.some(s => s.settings.time_limit_minutes) && (
                <div className="flex justify-between items-center mt-1">
                  <span>Estimated time:</span>
                  <span>
                    {sortedSections.reduce((total, section) =>
                      total + (section.settings.time_limit_minutes || 0), 0
                    )} minutes
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}