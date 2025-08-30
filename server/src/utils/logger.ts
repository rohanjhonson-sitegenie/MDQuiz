import { Request } from 'express'

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

interface LogContext {
  method?: string
  url?: string
  userId?: string
  [key: string]: unknown
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO

  constructor() {
    const level = process.env.LOG_LEVEL?.toUpperCase()
    if (level && Object.values(LogLevel).includes(level as LogLevel)) {
      this.logLevel = level as LogLevel
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel)
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const requestedLevelIndex = levels.indexOf(level)
    return requestedLevelIndex <= currentLevelIndex
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? JSON.stringify(context) : ''
    return `[${timestamp}] [${level}] ${message} ${contextStr}`.trim()
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = {
        ...context,
        ...(error && {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack
        })
      }
      // eslint-disable-next-line no-console
      console.error(this.formatLog(LogLevel.ERROR, message, errorContext))
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      // eslint-disable-next-line no-console
      console.warn(this.formatLog(LogLevel.WARN, message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      // eslint-disable-next-line no-console
      console.log(this.formatLog(LogLevel.INFO, message, context))
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      // eslint-disable-next-line no-console
      console.log(this.formatLog(LogLevel.DEBUG, message, context))
    }
  }

  // Helper method to extract request context
  getRequestContext(req: Request & { userId?: string }): LogContext {
    return {
      method: req.method,
      url: req.originalUrl,
      userId: req.userId,
      ip: req.ip,
      userAgent: req.get('user-agent')
    }
  }

  // Log HTTP requests
  logRequest(req: Request & { userId?: string }, additionalContext?: LogContext): void {
    const context = {
      ...this.getRequestContext(req),
      ...additionalContext
    }
    this.info('Incoming request', context)
  }

  // Log HTTP responses
  logResponse(req: Request & { userId?: string }, statusCode: number, responseTime: number, additionalContext?: LogContext): void {
    const context = {
      ...this.getRequestContext(req),
      statusCode,
      responseTime: `${responseTime}ms`,
      ...additionalContext
    }
    this.info('Outgoing response', context)
  }
}

export const logger = new Logger()