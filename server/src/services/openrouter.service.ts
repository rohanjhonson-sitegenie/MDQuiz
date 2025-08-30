import { Response } from 'express'
import { OpenRouterChatRequest } from '../types'
import { AppError } from '../middleware/error.middleware'

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'

export async function chatCompletion(request: OpenRouterChatRequest) {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'Coach Lib AI Proxy'
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new AppError(
      `OpenRouter API error: ${error}`,
      response.status,
      'OPENROUTER_ERROR'
    )
  }

  return response.json()
}

export async function chatCompletionStream(
  request: OpenRouterChatRequest,
  res: Response
): Promise<void> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'Coach Lib AI Proxy'
    },
    body: JSON.stringify({ ...request, stream: true })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new AppError(
      `OpenRouter API error: ${error}`,
      response.status,
      'OPENROUTER_ERROR'
    )
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new AppError('No response body', 500, 'STREAM_ERROR')
  }

  const decoder = new TextDecoder()
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        res.write('data: [DONE]\n\n')
        res.end()
        break
      }
      
      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.trim()) {
          res.write(`${line}\n`)
        }
      }
    }
  } catch (error) {
    // Log stream error to stderr
    process.stderr.write(`Stream error: ${error instanceof Error ? error.message : String(error)}\n`)
    res.write(`data: {"error": "Stream interrupted"}\n\n`)
    res.end()
  }
}