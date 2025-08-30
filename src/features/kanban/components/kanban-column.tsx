import { memo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MoreHorizontal, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  KanbanColumn as KanbanColumnType,
  KanbanCard as KanbanCardType,
} from '../data/schema'
import { KanbanCard } from './kanban-card'

interface KanbanColumnProps {
  column: KanbanColumnType
  cards: KanbanCardType[]
  isOverlay?: boolean
}

function KanbanColumnComponent({
  column,
  cards,
  isOverlay,
}: KanbanColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  })

  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `column-drop-${column.id}`,
    data: {
      type: 'column',
      column,
    },
  })

  const cardIds = cards.map((card) => card.id)

  // If this is the overlay (being dragged), only show the header
  if (isOverlay) {
    return (
      <div className={cn('w-[280px] flex-shrink-0', 'rotate-3 opacity-90')}>
        <div
          className={cn(
            'flex flex-col',
            'rounded-lg border-0 shadow-lg',
            'bg-background'
          )}
          style={{
            backgroundColor: column.color ? `${column.color}15` : undefined,
          }}
        >
          <div className='flex-shrink-0 px-1.5 py-1'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-1'>
                <div className='flex items-center gap-1'>
                  <div
                    className='text-foreground rounded px-1.5 py-0.5 text-xs font-bold'
                    style={{
                      backgroundColor: column.color
                        ? `${column.color}40`
                        : 'var(--muted)',
                    }}
                  >
                    {column.title}
                  </div>
                  <span className='text-muted-foreground text-xs font-normal'>
                    {cards.length}
                  </span>
                </div>
              </div>
              <Button variant='ghost' size='icon' className='h-3 w-3'>
                <MoreHorizontal className='h-2 w-2' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Normal column rendering
  return (
    <div
      className={cn(
        'group w-[280px] flex-shrink-0',
        isDragging && 'opacity-50'
      )}
    >
      <div
        ref={setDroppableNodeRef}
        className={cn(
          'flex flex-col',
          'rounded-lg border-0 shadow-sm',
          'bg-background h-fit'
        )}
        style={{
          backgroundColor: column.color ? `${column.color}15` : undefined,
        }}
      >
        <div
          ref={setSortableNodeRef}
          className='flex-shrink-0 px-1.5 py-1'
          style={{
            transform: CSS.Transform.toString(transform),
            transition,
          }}
        >
          <div
            className='hover:bg-muted/50 flex cursor-grab items-center justify-between rounded'
            {...attributes}
            {...listeners}
          >
            <div className='flex items-center gap-1'>
              <div className='flex items-center gap-1'>
                <div
                  className='text-foreground rounded px-1.5 py-0.5 text-xs font-bold'
                  style={{
                    backgroundColor: column.color
                      ? `${column.color}40`
                      : 'var(--muted)',
                  }}
                >
                  {column.title}
                </div>
                <span className='text-muted-foreground text-xs font-normal'>
                  {cards.length}
                </span>
              </div>
            </div>
            <Button
              variant='ghost'
              size='icon'
              className='h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100'
            >
              <MoreHorizontal className='h-2 w-2' />
            </Button>
          </div>
        </div>

        <div className={cn('px-1 pt-0 pb-0.5', isDragging && 'opacity-30')}>
          <SortableContext
            items={cardIds}
            strategy={verticalListSortingStrategy}
          >
            <div className='space-y-1'>
              {cards.map((card) => (
                <KanbanCard
                  key={card.id}
                  card={card}
                  columnColor={column.color}
                />
              ))}
            </div>
          </SortableContext>
        </div>

        <div
          className={cn(
            'flex-shrink-0 px-1 pt-0.5 pb-1',
            isDragging && 'opacity-30'
          )}
        >
          <Button
            variant='ghost'
            className='text-muted-foreground hover:text-foreground hover:bg-accent/50 h-8 w-full justify-start text-sm font-normal'
          >
            <Plus className='mr-1.5 h-3.5 w-3.5' />
            Add a card
          </Button>
        </div>
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const KanbanColumn = memo(
  KanbanColumnComponent,
  (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
      prevProps.column.id === nextProps.column.id &&
      prevProps.column.title === nextProps.column.title &&
      prevProps.column.color === nextProps.column.color &&
      prevProps.column.position === nextProps.column.position &&
      prevProps.cards.length === nextProps.cards.length &&
      prevProps.cards.every(
        (card, index) =>
          card.id === nextProps.cards[index]?.id &&
          card.position === nextProps.cards[index]?.position
      ) &&
      prevProps.isOverlay === nextProps.isOverlay
    )
  }
)
