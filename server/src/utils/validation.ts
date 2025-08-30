import { z } from 'zod'
import { OpenRouterChatRequest } from '../types'
import { AppError } from '../middleware/error.middleware'

const chatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string()
})

const chatRequestSchema = z.object({
  model: z.string(),
  messages: z.array(chatMessageSchema).min(1),
  stream: z.boolean().optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().positive().optional(),
  top_p: z.number().min(0).max(1).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  presence_penalty: z.number().min(-2).max(2).optional()
})

export function validateChatRequest(data: unknown): OpenRouterChatRequest {
  try {
    return chatRequestSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(
        `Invalid request: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        400,
        'VALIDATION_ERROR'
      )
    }
    throw error
  }
}