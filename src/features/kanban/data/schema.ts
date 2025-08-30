import { z } from 'zod'
import { sanitizeText, sanitizeColor } from '../utils/sanitize'

// Custom validation to prevent XSS

export const kanbanLabelSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1)
    .max(50)
    .transform((val) => sanitizeText(val)),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
    .transform((val) => sanitizeColor(val)),
})

export const kanbanChecklistItemSchema = z.object({
  id: z.string(),
  card_id: z.string(),
  title: z
    .string()
    .min(1)
    .max(200)
    .transform((val) => sanitizeText(val)),
  is_completed: z.boolean(),
  position: z.number().int().min(0),
})

export const kanbanAttachmentSchema = z.object({
  id: z.string(),
  card_id: z.string(),
  filename: z
    .string()
    .max(255)
    .transform((val) => sanitizeText(val)),
  url: z.string().url(),
  type: z.string().regex(/^[a-zA-Z0-9/\-.]+$/, 'Invalid MIME type'),
  size: z.number().positive(),
  uploaded_at: z.string(),
})

export const kanbanCardSchema = z.object({
  id: z.string(),
  column_id: z.string(),
  title: z
    .string()
    .min(1)
    .max(200)
    .transform((val) => sanitizeText(val)),
  description: z
    .string()
    .max(5000)
    .transform((val) => sanitizeText(val))
    .optional(),
  position: z.number().int().min(0),
  labels: z.array(kanbanLabelSchema),
  due_date: z.string().optional(),
  assignees: z.array(z.string()),
  attachments: z.array(kanbanAttachmentSchema),
  checklist_items: z.array(kanbanChecklistItemSchema),
  created_at: z.string(),
  updated_at: z.string(),
})

export const kanbanColumnSchema = z.object({
  id: z.string(),
  board_id: z.string(),
  title: z
    .string()
    .min(1)
    .max(100)
    .transform((val) => sanitizeText(val)),
  position: z.number().int().min(0),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
    .transform((val) => sanitizeColor(val))
    .optional(),
  wip_limit: z.number().int().positive().optional(),
  created_at: z.string(),
})

export const kanbanBoardSchema = z.object({
  id: z.string(),
  title: z
    .string()
    .min(1)
    .max(100)
    .transform((val) => sanitizeText(val)),
  description: z
    .string()
    .max(1000)
    .transform((val) => sanitizeText(val))
    .optional(),
  created_at: z.string(),
  updated_at: z.string(),
  user_id: z.string(),
})

export type KanbanLabel = z.infer<typeof kanbanLabelSchema>
export type KanbanChecklistItem = z.infer<typeof kanbanChecklistItemSchema>
export type KanbanAttachment = z.infer<typeof kanbanAttachmentSchema>
export type KanbanCard = z.infer<typeof kanbanCardSchema>
export type KanbanColumn = z.infer<typeof kanbanColumnSchema>
export type KanbanBoard = z.infer<typeof kanbanBoardSchema>
