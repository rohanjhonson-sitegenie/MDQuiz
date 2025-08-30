import React, { useState, useCallback } from 'react'
import { defaultColumns, mockCards } from '../data/data'
import { KanbanCard, KanbanColumn } from '../data/schema'
import {
  validateCardUpdate,
  validateColumnUpdate,
  formatValidationError,
} from '../utils/validation'
import { KanbanContext, KanbanContextType } from './kanban-context'

interface KanbanProviderProps {
  children: React.ReactNode
}

export default function KanbanProvider({ children }: KanbanProviderProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(defaultColumns)
  const [cards, setCards] = useState<KanbanCard[]>([...mockCards])
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)

  const moveCard = useCallback(
    (cardId: string, newColumnId: string, newPosition: number) => {
      setCards((prevCards) => {
        const updatedCards = [...prevCards]
        const cardIndex = updatedCards.findIndex((card) => card.id === cardId)

        if (cardIndex === -1) return prevCards

        const card = { ...updatedCards[cardIndex] }

        // Remove card from its current position
        updatedCards.splice(cardIndex, 1)

        // Update card properties
        card.column_id = newColumnId
        card.position = newPosition
        card.updated_at = new Date().toISOString()

        // Recalculate positions for all cards
        const finalCards: KanbanCard[] = []

        // Process each column
        const columnIds = new Set(updatedCards.map((c) => c.column_id))
        columnIds.add(newColumnId)

        columnIds.forEach((colId) => {
          let position = 0

          if (colId === newColumnId) {
            // For the target column, insert the card at the correct position
            const colCards = updatedCards
              .filter((c) => c.column_id === colId)
              .sort((a, b) => a.position - b.position)

            for (let i = 0; i <= colCards.length; i++) {
              if (i === newPosition) {
                finalCards.push({ ...card, position })
                position++
              }
              if (i < colCards.length) {
                finalCards.push({ ...colCards[i], position })
                position++
              }
            }
          } else {
            // For other columns, just reassign positions sequentially
            const colCards = updatedCards
              .filter((c) => c.column_id === colId)
              .sort((a, b) => a.position - b.position)

            colCards.forEach((c) => {
              finalCards.push({ ...c, position })
              position++
            })
          }
        })

        return finalCards
      })
    },
    []
  )

  const updateCard = useCallback(
    (cardId: string, updates: Partial<KanbanCard>) => {
      // Validate updates before applying
      const validation = validateCardUpdate(updates)

      if (!validation.success) {
        // eslint-disable-next-line no-console
        console.error(
          'Invalid card update:',
          formatValidationError(validation.error)
        )
        // In production, you might want to show a toast notification here
        return
      }

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                ...validation.data,
                updated_at: new Date().toISOString(),
              }
            : card
        )
      )
    },
    []
  )

  const addCard = useCallback(
    (
      columnId: string,
      cardData: Omit<KanbanCard, 'id' | 'created_at' | 'updated_at'>
    ) => {
      const timestamp = new Date().toISOString()
      const newCard = {
        ...cardData,
        id: `card-${Date.now()}`,
        column_id: columnId,
        created_at: timestamp,
        updated_at: timestamp,
      }

      // Validate the complete card before adding
      const validation = validateCardUpdate(newCard)

      if (!validation.success) {
        // eslint-disable-next-line no-console
        console.error(
          'Invalid card data:',
          formatValidationError(validation.error)
        )
        return
      }

      setCards((prevCards) => [...prevCards, newCard as KanbanCard])
    },
    []
  )

  const deleteCard = useCallback((cardId: string) => {
    setCards((prevCards) => {
      const card = prevCards.find((c) => c.id === cardId)
      if (!card) return prevCards

      return prevCards
        .filter((c) => c.id !== cardId)
        .map((c) => {
          if (c.column_id === card.column_id && c.position > card.position) {
            return { ...c, position: c.position - 1 }
          }
          return c
        })
    })
  }, [])

  const moveColumn = useCallback((columnId: string, targetPosition: number) => {
    setColumns((prevColumns) => {
      const columns = [...prevColumns]
      const draggedColumn = columns.find((col) => col.id === columnId)
      if (!draggedColumn) return prevColumns

      // Sort columns by position to ensure correct order
      columns.sort((a, b) => a.position - b.position)

      const currentIndex = columns.findIndex((col) => col.id === columnId)

      // Remove the dragged column
      columns.splice(currentIndex, 1)

      // Insert at the target position
      columns.splice(targetPosition, 0, draggedColumn)

      // Update all positions to be sequential
      return columns.map((col, index) => ({
        ...col,
        position: index,
      }))
    })
  }, [])

  const updateColumn = useCallback(
    (columnId: string, updates: Partial<KanbanColumn>) => {
      // Validate updates before applying
      const validation = validateColumnUpdate(updates)

      if (!validation.success) {
        // eslint-disable-next-line no-console
        console.error(
          'Invalid column update:',
          formatValidationError(validation.error)
        )
        // In production, you might want to show a toast notification here
        return
      }

      setColumns((prevColumns) =>
        prevColumns.map((column) =>
          column.id === columnId ? { ...column, ...validation.data } : column
        )
      )
    },
    []
  )

  const addColumn = useCallback(
    (columnData: Omit<KanbanColumn, 'id' | 'created_at'>) => {
      const newColumn: KanbanColumn = {
        ...columnData,
        id: `column-${Date.now()}`,
        created_at: new Date().toISOString(),
        board_id: columnData.board_id || 'default-board',
        position: columnData.position || 0,
      }

      setColumns((prevColumns) => [...prevColumns, newColumn])
    },
    []
  )

  const deleteColumn = useCallback((columnId: string) => {
    setColumns((prevColumns) =>
      prevColumns.filter((col) => col.id !== columnId)
    )
    setCards((prevCards) =>
      prevCards.filter((card) => card.column_id !== columnId)
    )
  }, [])

  const value: KanbanContextType = {
    columns,
    cards,
    moveCard,
    updateCard,
    addCard,
    deleteCard,
    moveColumn,
    updateColumn,
    addColumn,
    deleteColumn,
    selectedCard,
    setSelectedCard,
  }

  return (
    <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>
  )
}
