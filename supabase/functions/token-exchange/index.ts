// Token Exchange Edge Function - Fixed Version
// Converts CTID SSO tokens from central auth to satellite database JWT tokens

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TokenExchangeRequest {
  sso_token: string
}

interface TokenExchangeResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: {
    id: string
    email: string
    role: string
  }
}

// Helper function to decode JWT without verification (for development only)
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { sso_token }: TokenExchangeRequest = await req.json()

    if (!sso_token) {
      return new Response(
        JSON.stringify({ error: 'Missing sso_token parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Step 1: Decode the SSO token (simplified validation for development)
    const ssoPayload = decodeJWT(sso_token)

    if (!ssoPayload || !ssoPayload.sub) {
      console.error('Invalid SSO token structure')
      return new Response(
        JSON.stringify({ error: 'Invalid SSO token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if token is from expected issuer
    if (!ssoPayload.iss || !ssoPayload.iss.includes('xjeydtdtqfxwzceuadpr')) {
      console.error('SSO token from unexpected issuer:', ssoPayload.iss)
      return new Response(
        JSON.stringify({ error: 'Invalid SSO token issuer' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if token is expired
    if (ssoPayload.exp && ssoPayload.exp < Date.now() / 1000) {
      console.error('SSO token is expired')
      return new Response(
        JSON.stringify({ error: 'SSO token expired' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Step 2: Create local database client
    const localSupabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        auth: {
          persistSession: false
        }
      }
    )

    // Step 3: Create or update user profile in satellite database
    // Ensure required fields are properly filled
    const email = ssoPayload.email || ssoPayload.sub + '@unknown.com'
    const displayName = ssoPayload.name ||
                       ssoPayload.display_name ||
                       ssoPayload.given_name ||
                       (ssoPayload.email ? ssoPayload.email.split('@')[0] : '') ||
                       'User'

    const userProfile = {
      id: ssoPayload.sub,
      email: email,
      display_name: displayName,
      given_name: ssoPayload.given_name || null,
      family_name: ssoPayload.family_name || null,
      avatar_url: ssoPayload.avatar_url || ssoPayload.picture || null,
      role: ssoPayload.role || ssoPayload.user_role || 'user',
      updated_at: new Date().toISOString()
    }

    console.log('Syncing user profile:', JSON.stringify(userProfile, null, 2))

    const { error: profileError } = await localSupabase
      .from('profiles')
      .upsert(userProfile, { onConflict: 'id' })

    if (profileError) {
      console.error('Failed to sync user profile:', profileError)
      // Continue anyway - profile sync is not critical for token exchange
    } else {
      console.log('User profile synced successfully')
    }

    // Step 4: For now, return the anon key since RLS is disabled
    // In production, you would generate a proper satellite JWT here
    const response: TokenExchangeResponse = {
      access_token: Deno.env.get('SUPABASE_ANON_KEY') || '',
      token_type: 'Bearer',
      expires_in: 3600, // 1 hour
      user: {
        id: ssoPayload.sub,
        email: email,
        role: userProfile.role
      }
    }

    console.log('Token exchange successful for user:', email)

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Token exchange error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})