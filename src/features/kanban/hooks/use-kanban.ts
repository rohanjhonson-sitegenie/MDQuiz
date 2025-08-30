import { useContext } from 'react'
import { KanbanContext } from '../context/kanban-context'

export function useKanban() {
  const context = useContext(KanbanContext)
  if (!context) {
    throw new Error('useKanban must be used within a KanbanProvider')
  }
  return context
}
