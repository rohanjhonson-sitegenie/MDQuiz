import { useState, memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, CheckSquare, Paperclip, Edit3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { KanbanCard as KanbanCardType } from '../data/schema'
import { useKanban } from '../hooks/use-kanban'

interface KanbanCardProps {
  card: KanbanCardType
  isOverlay?: boolean
  columnColor?: string
}

function KanbanCardComponent({
  card,
  isOverlay,
  columnColor,
}: KanbanCardProps) {
  const { setSelectedCard } = useKanban()
  const [isHovered, setIsHovered] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
    },
    attributes: {
      role: 'button',
      tabIndex: 0,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const completedChecklistItems = card.checklist_items.filter(
    (item) => item.is_completed
  ).length
  const totalChecklistItems = card.checklist_items.length
  const isOverdue = card.due_date && new Date(card.due_date) < new Date()

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        boxShadow:
          isHovered && columnColor
            ? `0 4px 12px var(--color-border), 0 0 0 1px ${columnColor}40, 0 0 8px ${columnColor}30`
            : undefined,
      }}
      className={cn(
        'relative cursor-grab touch-manipulation transition-all duration-200',
        'border-border bg-card rounded-lg border shadow-sm',
        'space-y-2 p-3',
        !isHovered &&
          'hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20',
        isDragging && 'rotate-2 cursor-grabbing opacity-50 shadow-lg',
        isOverlay && 'rotate-3 shadow-xl'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setSelectedCard(card)}
      {...attributes}
      {...listeners}
    >
      {/* Labels - Trello style color bars */}
      {card.labels.length > 0 && (
        <div className='-mt-1 mb-3 flex gap-1'>
          {card.labels.map((label) => (
            <div
              key={label.id}
              className='h-1 w-8 rounded-full'
              style={{ backgroundColor: label.color }}
              title={label.name}
            />
          ))}
        </div>
      )}

      {/* Card Title */}
      <div className='mb-3'>
        <h3 className='text-card-foreground text-sm leading-5 font-normal break-words'>
          {card.title}
        </h3>
      </div>

      {/* Bottom section with metadata */}
      {(card.due_date ||
        totalChecklistItems > 0 ||
        card.attachments.length > 0 ||
        card.assignees.length > 0) && (
        <div className='text-muted-foreground flex items-center justify-between text-xs'>
          <div className='flex items-center gap-3'>
            {/* Due Date */}
            {card.due_date && (
              <div
                className={cn(
                  'flex items-center gap-1 rounded px-1.5 py-1 text-xs font-medium transition-colors',
                  isOverdue
                    ? 'border-destructive/30 bg-destructive/10 text-destructive border'
                    : cn(
                        'bg-muted/50 text-muted-foreground',
                        isHovered && 'bg-muted'
                      )
                )}
              >
                <Calendar className='h-3 w-3' />
                <span>
                  {new Date(card.due_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}

            {/* Checklist Progress */}
            {totalChecklistItems > 0 && (
              <div
                className={cn(
                  'flex items-center gap-1 rounded px-1.5 py-1 transition-colors',
                  completedChecklistItems === totalChecklistItems
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : cn(
                        'bg-muted/50 text-muted-foreground',
                        isHovered && 'bg-muted'
                      )
                )}
              >
                <CheckSquare className='h-3 w-3' />
                <span className='font-medium'>
                  {completedChecklistItems}/{totalChecklistItems}
                </span>
              </div>
            )}

            {/* Attachments */}
            {card.attachments.length > 0 && (
              <div
                className={cn(
                  'bg-muted/50 text-muted-foreground flex items-center gap-1 rounded px-1.5 py-1 transition-colors',
                  isHovered && 'bg-muted'
                )}
              >
                <Paperclip className='h-3 w-3' />
                <span className='font-medium'>{card.attachments.length}</span>
              </div>
            )}
          </div>

          {/* Assignees - Single avatar like Trello */}
          {card.assignees.length > 0 && (
            <div className='flex items-center'>
              {card.assignees.length === 1 ? (
                <Avatar className='border-border h-6 w-6 border'>
                  <AvatarFallback className='bg-primary/10 text-primary text-[10px] font-semibold'>
                    {card.assignees[0].substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className='flex -space-x-1'>
                  {card.assignees.slice(0, 2).map((assignee, index) => (
                    <Avatar
                      key={assignee}
                      className='border-card h-6 w-6 border-2'
                      style={{ zIndex: card.assignees.length - index }}
                    >
                      <AvatarFallback className='bg-primary/10 text-primary text-[10px] font-semibold'>
                        {assignee.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {card.assignees.length > 2 && (
                    <div className='border-card bg-muted text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-semibold'>
                      +{card.assignees.length - 2}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hover edit indicator - subtle like Trello */}
      <div
        className={cn(
          'absolute top-2 right-2 transition-opacity duration-200',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      >
        <Edit3 className='text-muted-foreground/50 h-3 w-3' />
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const KanbanCard = memo(KanbanCardComponent, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.card.title === nextProps.card.title &&
    prevProps.card.description === nextProps.card.description &&
    prevProps.card.labels === nextProps.card.labels &&
    prevProps.card.assignees === nextProps.card.assignees &&
    prevProps.card.due_date === nextProps.card.due_date &&
    prevProps.card.attachments === nextProps.card.attachments &&
    prevProps.card.checklist_items === nextProps.card.checklist_items &&
    prevProps.card.position === nextProps.card.position &&
    prevProps.card.column_id === nextProps.card.column_id &&
    prevProps.isOverlay === nextProps.isOverlay &&
    prevProps.columnColor === nextProps.columnColor
  )
})
