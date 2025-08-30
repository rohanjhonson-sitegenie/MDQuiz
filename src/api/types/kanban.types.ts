export interface KanbanBoard {
  id: string
  title: string
  description?: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface KanbanColumn {
  id: string
  board_id: string
  title: string
  position: number
  color?: string
  wip_limit?: number
  created_at: string
}

export interface KanbanCard {
  id: string
  column_id: string
  title: string
  description?: string
  position: number
  labels: KanbanLabel[]
  due_date?: string
  assignees: string[]
  attachments: KanbanAttachment[]
  checklist_items: KanbanChecklistItem[]
  created_at: string
  updated_at: string
}

export interface KanbanLabel {
  id: string
  name: string
  color: string
}

export interface KanbanAttachment {
  id: string
  card_id: string
  filename: string
  url: string
  type: string
  size: number
  uploaded_at: string
}

export interface KanbanChecklistItem {
  id: string
  card_id: string
  title: string
  is_completed: boolean
  position: number
}

export type DragType = 'card' | 'column'

export interface DragData {
  type: DragType
  item: KanbanCard | KanbanColumn
}
