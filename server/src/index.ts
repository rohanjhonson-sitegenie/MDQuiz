import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import { errorHandler } from './middleware/error.middleware'
import { rateLimiter } from './middleware/rate-limit.middleware'
import { loggingMiddleware } from './middleware/logging.middleware'
import { swaggerSpec } from './config/swagger'
import aiRoutes from './routes/ai.routes'
import storageRoutes from './routes/storage.routes'
import healthRoutes from './routes/health.routes'
import { logger } from './utils/logger'

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development'
dotenv.config({ path: path.resolve(process.cwd(), envFile) })

// Log environment configuration (excluding sensitive keys)
logger.info('Environment configuration', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001,
  SUPABASE_URL: process.env.SUPABASE_URL ? 'Configured' : 'Missing',
  SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY ? 'Configured' : 'Missing',
  ENV_FILE: envFile,
  CWD: process.cwd()
})

const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))
// Configure CORS based on environment
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // In production on Vercel, allow all origins since we handle CORS in vercel.json
    if (process.env.VERCEL) {
      return callback(null, true)
    }
    
    // In development, use allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173']
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(loggingMiddleware)
app.use(rateLimiter)

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AI & Storage Proxy API Docs'
}))

// Serve OpenAPI JSON spec
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

// Routes
app.use('/api/health', healthRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/storage', storageRoutes)

// Error handling
app.use(errorHandler)

// For local development, start the server
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    // Use process.stdout.write for startup messages to avoid ESLint console warning
    process.stdout.write(`🚀 Server running on port ${port}\n`)
    process.stdout.write(`📍 Environment: ${process.env.NODE_ENV || 'development'}\n`)
    process.stdout.write(`📚 API Docs: http://localhost:${port}/api-docs\n`)
    process.stdout.write(`📊 Log Level: ${process.env.LOG_LEVEL || 'INFO'}\n`)
    
    logger.info('Server started', {
      port,
      environment: process.env.NODE_ENV || 'development',
      logLevel: process.env.LOG_LEVEL || 'INFO',
      timestamp: new Date().toISOString()
    })
  })
}

// Export the Express app for Vercel
export default app