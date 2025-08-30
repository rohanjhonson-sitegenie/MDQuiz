export interface OpenRouterChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenRouterChatRequest {
  model: string
  messages: OpenRouterChatMessage[]
  stream?: boolean
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

export interface BunnyUploadRequest {
  file: Express.Multer.File
  path?: string
}

export interface BunnyDeleteRequest {
  path: string
}

export interface BunnyListRequest {
  path?: string
}

export interface ErrorResponse {
  error: string
  code?: string
  details?: unknown
}