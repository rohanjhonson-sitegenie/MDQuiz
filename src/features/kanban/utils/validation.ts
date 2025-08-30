import { z } from 'zod'
import {
  kanbanCardSchema,
  kanbanColumnSchema,
  kanbanBoardSchema,
  KanbanCard,
  KanbanColumn,
  KanbanBoard,
} from '../data/schema'

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError }

/**
 * Validates partial card updates
 */
export function validateCardUpdate(
  updates: Partial<KanbanCard>
): ValidationResult<Partial<KanbanCard>> {
  const partialSchema = kanbanCardSchema.partial()
  const result = partialSchema.safeParse(updates)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, error: result.error }
}

/**
 * Validates a complete card
 */
export function validateCard(card: unknown): ValidationResult<KanbanCard> {
  const result = kanbanCardSchema.safeParse(card)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, error: result.error }
}

/**
 * Validates partial column updates
 */
export function validateColumnUpdate(
  updates: Partial<KanbanColumn>
): ValidationResult<Partial<KanbanColumn>> {
  const partialSchema = kanbanColumnSchema.partial()
  const result = partialSchema.safeParse(updates)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, error: result.error }
}

/**
 * Validates a complete column
 */
export function validateColumn(
  column: unknown
): ValidationResult<KanbanColumn> {
  const result = kanbanColumnSchema.safeParse(column)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, error: result.error }
}

/**
 * Validates board updates
 */
export function validateBoardUpdate(
  updates: Partial<KanbanBoard>
): ValidationResult<Partial<KanbanBoard>> {
  const partialSchema = kanbanBoardSchema.partial()
  const result = partialSchema.safeParse(updates)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, error: result.error }
}

/**
 * Helper to get validation error messages
 */
export function getValidationErrors(error: z.ZodError): string[] {
  return error.issues.map((err) => {
    const path = err.path.join('.')
    return `${path}: ${err.message}`
  })
}

/**
 * Formats validation error for user display
 */
export function formatValidationError(error: z.ZodError): string {
  const errors = getValidationErrors(error)
  if (errors.length === 1) {
    return errors[0]
  }
  return `Multiple validation errors: ${errors.join(', ')}`
}
