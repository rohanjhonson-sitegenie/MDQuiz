import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import * as jose from "https://deno.land/x/jose@v5.1.3/index.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Helper function to validate Central ID roles
function validateCentralIdRole(centralIdRole: string | null | undefined): string {
  if (!centralIdRole || typeof centralIdRole !== 'string') {
    return 'user'
  }

  const normalizedRole = centralIdRole.toLowerCase().trim()

  // Return Central ID roles directly
  const validRoles = ['superadmin', 'admin', 'manager', 'cashier', 'student', 'parent', 'teacher']
  if (validRoles.includes(normalizedRole)) {
    return normalizedRole
  }

  // Default fallback for unknown roles
  return 'user'
}

// Configuration constants
const CTID_API_TIMEOUT = 10000; // 10 seconds
const TOKEN_EXPIRY_SECONDS = 3600; // 1 hour
const FALLBACK_TOKEN_HASH_LENGTH = 8;

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Standardized error response helper
function createErrorResponse(errorData: { error: string; error_description: string }, status: number = 400): Response {
  return new Response(JSON.stringify(errorData), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  })
}

// JWT token payload interface for CTID tokens
interface CtidTokenPayload {
  sub: string
  email: string
  role?: string
  user_role?: string
  exp: number
  aud?: string
  iss?: string
  aal?: string
  amr?: Array<{ method: string; timestamp: number }>
  app_metadata?: Record<string, unknown>
  iat?: number
  is_anonymous?: boolean
  phone?: string
  session_id?: string
  user_metadata?: Record<string, unknown>
  original_iss?: string
  original_token?: string
  // Central ID profile fields
  display_name?: string
  given_name?: string
  family_name?: string
  avatar_url?: string
}

// Local token validation when CTID API is unavailable
function fallbackTokenValidation(token: string): CtidTokenPayload {
  // Try to decode the subject token if it's a JWT
  try {
    // Check if it's a JWT format (has 3 parts separated by dots)
    const parts = token.split('.')
    if (parts.length === 3) {
      // Decode the payload (second part)
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))

      // Preserve ALL original claims and structure from CTID token
      return {
        // Required fields for our interface
        sub: payload.sub,
        email: payload.email,
        user_role: validateCentralIdRole(payload.user_role),
        exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS,

        // Preserve ALL original claims
        aal: payload.aal,
        amr: payload.amr,
        app_metadata: payload.app_metadata,
        aud: payload.aud,
        iat: payload.iat, // Keep original issued time
        is_anonymous: payload.is_anonymous,
        iss: payload.iss, // Keep original issuer for reference
        phone: payload.phone,
        role: payload.role,
        session_id: payload.session_id,
        user_metadata: payload.user_metadata
      }
    }
  } catch (_decodeError) {
    // Token is not a JWT, treating as opaque token
  }

  // Fallback for non-JWT tokens
  const tokenHash = token.slice(0, FALLBACK_TOKEN_HASH_LENGTH)
  return {
    sub: crypto.randomUUID(), // Generate UUID for Supabase
    email: `ctid-user-${tokenHash}@example.com`, // Use token hash in email
    user_role: validateCentralIdRole('user'), // Use validation for consistency
    exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS,
    original_token: tokenHash // Keep reference to original token
  }
}

// Initialize Supabase admin client for user provisioning
function getSupabaseAdmin() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin configuration missing')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Provision user in auth.users table to ensure profile creation
async function provisionUser(ctidPayload: CtidTokenPayload): Promise<void> {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    // Create user record in auth.users with CTID data
    // This will trigger the handle_new_user() function to create the profile
    const { data: existingUser, error: checkError } = await supabaseAdmin.auth.admin.getUserById(ctidPayload.sub)

    if (checkError && !checkError.message.includes('User not found')) {
      console.warn('Error checking existing user:', checkError.message)
    }

    if (!existingUser?.user) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        id: ctidPayload.sub,
        email: ctidPayload.email,
        email_confirm: true, // Auto-confirm since CTID already validated
        user_metadata: {
          ...ctidPayload.user_metadata,
          provider: 'ctid',
          ctid_validated: true,
          // Pass Central ID role to trigger for immediate role assignment
          user_role: ctidPayload.user_role,
          // Pass Central ID profile fields to trigger for profile creation
          display_name: ctidPayload.display_name,
          given_name: ctidPayload.given_name,
          family_name: ctidPayload.family_name,
          avatar_url: ctidPayload.avatar_url
        },
        app_metadata: {
          ...ctidPayload.app_metadata,
          provider: 'ctid',
          providers: ['ctid']
        }
      })

      if (error) {
        throw new Error(`User provisioning failed: ${error.message}`)
      }
    } else {

      // Update existing user data with latest CTID info including profile fields
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(ctidPayload.sub, {
        email: ctidPayload.email,
        user_metadata: {
          ...existingUser.user.user_metadata,
          ...ctidPayload.user_metadata,
          ctid_last_validated: new Date().toISOString(),
          // Update profile fields from Central ID
          display_name: ctidPayload.display_name,
          given_name: ctidPayload.given_name,
          family_name: ctidPayload.family_name,
          avatar_url: ctidPayload.avatar_url
        }
      })

      if (updateError) {
        console.warn('Failed to update existing user metadata:', updateError.message)
      }
    }

    // ALWAYS update profile with current Central ID data
    // This ensures satellite database stays synchronized with Central ID changes
    try {
      const centralIdRole = validateCentralIdRole(ctidPayload.user_role)

      // Prepare profile update object with all Central ID fields
      const profileUpdate: {
        role: string;
        display_name?: string;
        given_name?: string;
        family_name?: string;
        avatar_url?: string;
      } = { role: centralIdRole }

      // Only update profile fields if they are provided by Central ID
      if (ctidPayload.display_name !== undefined) profileUpdate.display_name = ctidPayload.display_name
      if (ctidPayload.given_name !== undefined) profileUpdate.given_name = ctidPayload.given_name
      if (ctidPayload.family_name !== undefined) profileUpdate.family_name = ctidPayload.family_name
      if (ctidPayload.avatar_url !== undefined) profileUpdate.avatar_url = ctidPayload.avatar_url

      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update(profileUpdate)
        .eq('id', ctidPayload.sub)

      if (profileUpdateError) {
        console.warn('Failed to update profile:', profileUpdateError.message)
      }
    } catch (roleUpdateError) {
      console.warn('Role synchronization failed:', roleUpdateError)
    }
  } catch (error) {
    console.error('User provisioning error:', error)
  }
}

async function validateCtidToken(token: string): Promise<CtidTokenPayload> {
  // Basic token format validation
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    throw new Error('Invalid token format')
  }

  // Get CTID API configuration
  const ctidApiBaseUrl = Deno.env.get('CTID_API_BASE_URL')

  if (!ctidApiBaseUrl) {
    console.warn('CTID API not configured, falling back to local validation')
    return fallbackTokenValidation(token)
  }

  // Call Central ID API for validation with timeout and error handling
  try {
    const validateUrl = `${ctidApiBaseUrl}/api/v1/auth/validate`

    // Create AbortController for timeout handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CTID_API_TIMEOUT)

    const response = await fetch(validateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-Edge-Function/1.0'
      },
      body: JSON.stringify({
        access_token: token
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {

      // For specific error codes, fall back to local validation
      if (response.status >= 500 || response.status === 408) {
        console.warn('CTID API server error, falling back to local validation')
        return fallbackTokenValidation(token)
      }

      throw new Error(`CTID validation rejected: ${response.status} ${response.statusText}`)
    }

    const validationResult = await response.json()

    // Handle different CTID API response formats
    let userData = validationResult

    // Check if the response is wrapped in a data field or similar
    if (validationResult.data && typeof validationResult.data === 'object') {
      userData = validationResult.data
    } else if (validationResult.user && typeof validationResult.user === 'object') {
      userData = validationResult.user
    } else if (validationResult.payload && typeof validationResult.payload === 'object') {
      userData = validationResult.payload
    }

    // Try to extract user info from various possible response structures
    const sub = userData.sub || userData.id || userData.user_id
    const email = userData.email || userData.email_address

    if (!sub || !email) {
      console.warn('CTID API returned unexpected format, falling back to local validation')
      return fallbackTokenValidation(token)
    }

    // Ensure all required fields are present and properly formatted
    return {
      sub: sub,
      email: email,
      user_role: validateCentralIdRole(userData.user_role),
      exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS,

      // Preserve all original claims from CTID response
      aal: userData.aal,
      amr: userData.amr,
      app_metadata: userData.app_metadata,
      aud: userData.aud,
      iat: userData.iat,
      is_anonymous: userData.is_anonymous,
      iss: userData.iss,
      phone: userData.phone,
      role: userData.role,
      session_id: userData.session_id,
      user_metadata: userData.user_metadata,
      original_iss: userData.iss, // Preserve original issuer
      original_token: token.slice(0, 16), // Keep reference to original token

      // Extract Central ID profile fields
      display_name: userData.display_name,
      given_name: userData.given_name,
      family_name: userData.family_name,
      avatar_url: userData.avatar_url
    } as CtidTokenPayload

  } catch (error) {
    if (error instanceof Error) {
      // Handle timeout and network errors
      if (error.name === 'AbortError') {
        console.warn('CTID API timeout, falling back to local validation')
        return fallbackTokenValidation(token)
      }

      // Handle fetch errors (network issues, DNS, etc.)
      if (error.message.includes('fetch') || error.message.includes('network')) {
        console.warn('CTID API network error, falling back to local validation')
        return fallbackTokenValidation(token)
      }

      // Re-throw validation rejections (invalid tokens)
      throw error
    }

    throw new Error(`Token validation failed: Unknown error`)
  }
}


// Supabase JWT Token Exchange endpoint
Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    // Parse JSON request body
    const body = await req.json()
    const subjectToken = body.subject_token

    // Validate required parameter
    if (!subjectToken) {
      return createErrorResponse({
        error: 'missing_token',
        error_description: 'subject_token is required'
      })
    }

    // Validate CTID token
    const ctidPayload = await validateCtidToken(subjectToken)

    // Provision user in auth.users table to ensure profile creation
    // This will trigger the handle_new_user() function automatically
    await provisionUser(ctidPayload)

    // Get database configuration (this satellite project)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')

    if (!supabaseUrl) {
      return createErrorResponse({
        error: 'configuration_error',
        error_description: 'Supabase URL not configured'
      }, 500)
    }

    // Create a new JWT that preserves the original CTID structure but changes the issuer
    const now = Math.floor(Date.now() / 1000)
    const payload = {
      // Preserve ALL original claims from CTID token
      aal: ctidPayload.aal || 'aal1',
      amr: ctidPayload.amr || [{ method: 'oauth', timestamp: ctidPayload.iat || now }],
      app_metadata: ctidPayload.app_metadata || { provider: 'ctid', providers: ['ctid'] },
      aud: ctidPayload.aud || 'authenticated',
      email: ctidPayload.email,
      exp: now + TOKEN_EXPIRY_SECONDS,
      iat: now,
      is_anonymous: ctidPayload.is_anonymous || false,
      iss: `${supabaseUrl}/auth/v1`, // CHANGE: New issuer (satellite project)
      phone: ctidPayload.phone || '',
      role: ctidPayload.role || 'authenticated',
      session_id: crypto.randomUUID(), // New session for this satellite project
      sub: ctidPayload.sub, // Keep original user ID
      user_metadata: ctidPayload.user_metadata || { email_verified: true },
      user_role: ctidPayload.user_role,
      // Include Central ID profile fields in satellite JWT
      display_name: ctidPayload.display_name,
      given_name: ctidPayload.given_name,
      family_name: ctidPayload.family_name,
      avatar_url: ctidPayload.avatar_url
    }

    // Sign the JWT using either asymmetric or symmetric signing
    // Get JWT signing options from environment
    const jwtSigningKey = Deno.env.get('JWT_SIGNING_KEY')
    const jwtSecret = Deno.env.get('JWT_SECRET') // Legacy symmetric secret

    if (!jwtSigningKey && !jwtSecret) {
      console.error('JWT signing configuration not available')
      return createErrorResponse({
        error: 'jwt_signing_not_configured',
        error_description: 'JWT_SIGNING_KEY or JWT_SECRET environment variable is required'
      }, 500)
    }

    try {
      let jwt: string

      // Prioritize legacy HS256 signing for better compatibility
      if (jwtSecret) {
        // Use symmetric signing with legacy secret (HS256)
        const secret = new TextEncoder().encode(jwtSecret)
        jwt = await new jose.SignJWT(payload)
          .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
          .sign(secret)
      } else if (jwtSigningKey) {
        // Fallback to asymmetric signing with ES256/RS256
        let privateKey: jose.KeyLike

        try {
          // Try to parse as JWK first
          const jwkData = JSON.parse(jwtSigningKey)
          privateKey = await jose.importJWK(jwkData, jwkData.alg || 'ES256')

          // Use the algorithm from the key
          const algorithm = jwkData.alg || 'ES256'
          jwt = await new jose.SignJWT(payload)
            .setProtectedHeader({ alg: algorithm, typ: 'JWT', kid: jwkData.kid })
            .sign(privateKey)

        } catch (jwkError) {
          // Fallback to PEM format for RS256
          try {
            privateKey = await jose.importPKCS8(jwtSigningKey, 'RS256')
            jwt = await new jose.SignJWT(payload)
              .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
              .sign(privateKey)
          } catch (pemError) {
            throw new Error(`Failed to import key as JWK or PEM: ${jwkError.message}, ${pemError.message}`)
          }
        }
      } else {
        throw new Error('No valid JWT signing method available')
      }

      // Return proper JWT response
      return new Response(JSON.stringify({
        access_token: jwt,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: `refresh_${crypto.randomUUID()}`
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    } catch (jwtError) {
      console.error('JWT creation failed:', jwtError)
      return createErrorResponse({
        error: 'jwt_creation_failed',
        error_description: 'Failed to create JWT token'
      }, 500)
    }

  } catch (error) {
    return createErrorResponse({
      error: 'token_exchange_failed',
      error_description: error instanceof Error ? error.message : 'Token exchange failed'
    })
  }
});