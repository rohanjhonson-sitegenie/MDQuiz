import rateLimit from 'express-rate-limit'

export const rateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

export const aiRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 20, // Stricter limit for AI endpoints
  message: 'Too many AI requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})