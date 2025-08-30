import { createContext } from 'react'
import { KanbanCard, KanbanColumn } from '../data/schema'

export interface KanbanContextType {
  columns: KanbanColumn[]
  cards: KanbanCard[]

  // Card operations
  moveCard: (cardId: string, newColumnId: string, newPosition: number) => void
  updateCard: (cardId: string, updates: Partial<KanbanCard>) => void
  addCard: (
    columnId: string,
    card: Omit<KanbanCard, 'id' | 'created_at' | 'updated_at'>
  ) => void
  deleteCard: (cardId: string) => void

  // Column operations
  moveColumn: (columnId: string, newPosition: number) => void
  updateColumn: (columnId: string, updates: Partial<KanbanColumn>) => void
  addColumn: (column: Omit<KanbanColumn, 'id' | 'created_at'>) => void
  deleteColumn: (columnId: string) => void

  // UI state
  selectedCard: KanbanCard | null
  setSelectedCard: (card: KanbanCard | null) => void
}

export const KanbanContext = createContext<KanbanContextType | undefined>(
  undefined
)
