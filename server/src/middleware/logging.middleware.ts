import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export function loggingMiddleware(req: Request & { userId?: string }, res: Response, next: NextFunction): void {
  const startTime = Date.now()
  
  // Log request
  logger.logRequest(req, {
    body: req.body,
    query: req.query,
    params: req.params,
    headers: {
      'content-type': req.get('content-type'),
      'content-length': req.get('content-length')
    }
  })

  // Override res.json to log responses
  const originalJson = res.json.bind(res)
  res.json = function(data: unknown) {
    const responseTime = Date.now() - startTime
    logger.logResponse(req, res.statusCode, responseTime, {
      responseSize: JSON.stringify(data).length
    })
    return originalJson(data)
  }

  next()
}