import { useState, useMemo, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
  pointerWithin,
  rectIntersection,
  PointerSensor,
  CollisionDetection,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import {
  KanbanCard as KanbanCardType,
  KanbanColumn as KanbanColumnType,
} from '../data/schema'
import { useKanban } from '../hooks/use-kanban'
import { KanbanCard } from './kanban-card'
import { KanbanColumn } from './kanban-column'

export function KanbanBoard() {
  const { columns, cards, moveCard, moveColumn } = useKanban()
  const [activeCard, setActiveCard] = useState<KanbanCardType | null>(null)
  const [activeColumn, setActiveColumn] = useState<KanbanColumnType | null>(
    null
  )

  // Custom collision detection
  const customCollisionDetection: CollisionDetection = (args) => {
    // First, try pointer within for more accurate detection
    const pointerCollisions = pointerWithin(args)

    // If we have pointer collisions, use them
    if (pointerCollisions.length > 0) {
      return pointerCollisions
    }

    // Otherwise, use rect intersection as fallback
    const rectCollisions = rectIntersection(args)

    if (rectCollisions.length > 0) {
      return rectCollisions
    }

    // Finally, use closest corners for edge cases
    return closestCorners(args)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns])

  // Memoize cards grouped by column for performance
  const cardsByColumn = useMemo(() => {
    const grouped: Record<string, KanbanCardType[]> = {}

    // Initialize empty arrays for each column
    columns.forEach((column) => {
      grouped[column.id] = []
    })

    // Group and sort cards by column
    cards.forEach((card) => {
      if (grouped[card.column_id]) {
        grouped[card.column_id].push(card)
      }
    })

    // Sort cards within each column by position
    Object.keys(grouped).forEach((columnId) => {
      grouped[columnId].sort((a, b) => a.position - b.position)
    })

    return grouped
  }, [cards, columns])

  const getCardsByColumn = useCallback(
    (columnId: string) => {
      return cardsByColumn[columnId] || []
    },
    [cardsByColumn]
  )

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const { type, card, column } = active.data.current || {}

    if (type === 'card') {
      setActiveCard(card)
    } else if (type === 'column') {
      setActiveColumn(column)
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    if (!activeData || !overData) return

    const isActiveCard = activeData.type === 'card'
    const isOverCard = overData.type === 'card'
    const isOverColumn = overData.type === 'column'

    if (!isActiveCard) return

    // Dropping a card over another card
    if (isActiveCard && isOverCard) {
      const activeCard = activeData.card as KanbanCardType
      const overCard = overData.card as KanbanCardType

      if (activeCard.id === overCard.id) return

      const overColumnCards = getCardsByColumn(overCard.column_id)
      const activeColumnCards = getCardsByColumn(activeCard.column_id)

      const overCardIndex = overColumnCards.findIndex(
        (c) => c.id === overCard.id
      )

      // If moving within the same column, adjust index if needed
      let targetIndex = overCardIndex
      if (activeCard.column_id === overCard.column_id) {
        const activeIndex = activeColumnCards.findIndex(
          (c) => c.id === activeCard.id
        )
        if (activeIndex < overCardIndex) {
          targetIndex = overCardIndex - 1
        }
      }

      moveCard(activeCard.id, overCard.column_id, targetIndex)
    }

    // Dropping a card over a column (empty space)
    if (isActiveCard && isOverColumn) {
      const activeCard = activeData.card as KanbanCardType
      const overColumn = overData.column as KanbanColumnType

      // Don't move if it's the same column and no specific position
      if (activeCard.column_id === overColumn.id) return

      const overColumnCards = getCardsByColumn(overColumn.id)
      moveCard(activeCard.id, overColumn.id, overColumnCards.length)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    setActiveCard(null)
    setActiveColumn(null)

    if (!over) return

    // Handle column reordering
    if (active.id !== over.id && !active.id.toString().includes('drop')) {
      const activeIndex = columnsId.indexOf(active.id as string)
      const overIndex = columnsId.indexOf(over.id as string)

      if (activeIndex !== -1 && overIndex !== -1) {
        moveColumn(active.id as string, overIndex)
        return
      }
    }

    // Handle card operations
    const activeData = active.data.current
    const overData = over.data.current

    if (!activeData || !overData) return

    const isActiveColumn = activeData.type === 'column'
    const isOverColumn = overData.type === 'column'

    if (isActiveColumn && isOverColumn) {
      const activeColumn = activeData.column as KanbanColumnType
      const overColumn = overData.column as KanbanColumnType

      if (activeColumn.id === overColumn.id) return

      const overIndex = columns.findIndex((col) => col.id === overColumn.id)
      moveColumn(activeColumn.id, overIndex)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className='h-full w-full overflow-x-auto overflow-y-hidden'>
        <div className='flex min-w-fit items-start gap-3 px-6 py-4'>
          <SortableContext
            items={columnsId}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={getCardsByColumn(column.id)}
              />
            ))}
          </SortableContext>

          <Button
            variant='ghost'
            className='border-border/50 bg-muted/10 hover:bg-muted/30 text-muted-foreground hover:text-foreground h-[40px] w-[280px] flex-shrink-0 justify-start self-start border border-dashed font-normal'
          >
            <Plus className='mr-1.5 h-3.5 w-3.5' />
            Add another list
          </Button>

          {/* Extra padding for last column drop zone */}
          <div className='w-[300px] flex-shrink-0' />
        </div>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <DragOverlay>
            {activeCard && <KanbanCard card={activeCard} isOverlay />}
            {activeColumn && (
              <KanbanColumn
                column={activeColumn}
                cards={getCardsByColumn(activeColumn.id)}
                isOverlay
              />
            )}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  )
}
