import { Request, Response, NextFunction } from 'express'
import { AppError } from './error.middleware'

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
  userId?: string
  userEmail?: string
}

interface SupabaseUser {
  id: string
  aud: string
  role?: string
  email?: string
  email_confirmed_at?: string
  phone?: string
  confirmation_sent_at?: string
  confirmed_at?: string
  last_sign_in_at?: string
  app_metadata: Record<string, unknown>
  user_metadata: Record<string, unknown>
  identities?: unknown[]
  created_at?: string
  updated_at?: string
}

export async function authenticateRequest(
  req: Request & { userId?: string; userEmail?: string },
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Missing or invalid authorization header', 401, 'UNAUTHORIZED')
    }

    const token = authHeader.substring(7)
    
    // Verify the JWT token with Supabase
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new AppError('Supabase configuration missing - Authentication service unavailable', 500, 'AUTH_CONFIG_ERROR')
    }

    // Call Supabase to verify the token
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseAnonKey
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN')
      }
      throw new AppError('Authentication failed', response.status, 'AUTH_ERROR')
    }

    const user = await response.json() as SupabaseUser
    
    // Attach user info to request
    req.userId = user.id
    req.userEmail = user.email
    
    next()
  } catch (error) {
    next(error)
  }
}

// Optional: Create a middleware for optional authentication
export async function optionalAuthentication(
  req: Request & { userId?: string; userEmail?: string },
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without authentication
    next()
    return
  }

  // If token is provided, validate it
  try {
    await authenticateRequest(req, _res, () => {
      // Authentication succeeded, continue
      next()
    })
  } catch {
    // If authentication fails, continue without user context
    next()
  }
}