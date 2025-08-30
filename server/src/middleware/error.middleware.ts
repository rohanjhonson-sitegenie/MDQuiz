import { Request, Response, NextFunction } from 'express'
import { ErrorResponse } from '../types'

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error to stderr without triggering ESLint warning
  process.stderr.write(`Error: ${err.message}\n${err.stack || ''}\n`)

  if (err instanceof AppError) {
    const response: ErrorResponse = {
      error: err.message,
      code: err.code
    }
    res.status(err.statusCode).json(response)
    return
  }

  const response: ErrorResponse = {
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    details: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  }
  
  res.status(500).json(response)
}