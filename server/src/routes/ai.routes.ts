import { Router } from 'express'
import { aiRateLimiter } from '../middleware/rate-limit.middleware'
import { authenticateRequest } from '../middleware/auth.middleware'
import { chatCompletion, chatCompletionStream } from '../services/openrouter.service'
import { validateChatRequest } from '../utils/validation'
import { AppError } from '../middleware/error.middleware'

const router = Router()

// Apply authentication and rate limiting to all AI routes
router.use(authenticateRequest)
router.use(aiRateLimiter)

/**
 * @swagger
 * /api/ai/chat/completions:
 *   post:
 *     summary: Create chat completion
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: Chat completion response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *           text/event-stream:
 *             schema:
 *               type: string
 *               description: Server-sent events stream
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/chat/completions', async (req, res, next) => {
  try {
    const validatedData = validateChatRequest(req.body)
    
    if (validatedData.stream) {
      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      res.setHeader('X-Accel-Buffering', 'no') // Disable Nginx buffering
      
      await chatCompletionStream(validatedData, res)
    } else {
      const response = await chatCompletion(validatedData)
      res.json(response)
    }
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/ai/models:
 *   get:
 *     summary: List available AI models
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available models
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       context_length:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 */
router.get('/models', async (_req, res, next) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': _req.headers.referer || 'http://localhost:3001',
        'X-Title': 'Coach Lib AI Proxy'
      }
    })

    if (!response.ok) {
      throw new AppError('Failed to fetch models', response.status)
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    next(error)
  }
})

export default router