// SSO Authentication Bridge
// Validates CTID JWT tokens from SSO Supabase project and creates local session

import { createClient } from '@supabase/supabase-js'

// SSO Supabase project (where CTID issues tokens)
const SSO_SUPABASE_URL = 'https://xjeydtdtqfxwzceuadpr.supabase.co'
const SSO_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqZXlkdGR0cWZ4d3pjZXVhZHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTUwMDIsImV4cCI6MjA3MTg3MTAwMn0.TODO_GET_CORRECT_ANON_KEY'

// Create SSO client for token validation
const ssoClient = createClient(SSO_SUPABASE_URL, SSO_SUPABASE_ANON_KEY)

export interface SSOUser {
  id: string
  email: string
  role: string[]
  displayName?: string
  exp: number
}

/**
 * Validates a CTID JWT token against the SSO Supabase project
 */
export async function validateSSOToken(accessToken: string): Promise<SSOUser | null> {
  try {
    // Set the token for the SSO client
    await ssoClient.auth.setSession({
      access_token: accessToken,
      refresh_token: '' // Not needed for validation
    })

    // Get user info from SSO project
    const { data: { user }, error } = await ssoClient.auth.getUser(accessToken)

    if (error || !user) {
      console.warn('SSO token validation failed:', error?.message)
      return null
    }

    // Extract user info from SSO user object
    const ssoUser: SSOUser = {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || ['user'],
      displayName: user.user_metadata?.display_name,
      exp: user.user_metadata?.exp || 0
    }

    return ssoUser
  } catch (error) {
    console.warn('Error validating SSO token:', error)
    return null
  }
}

/**
 * Creates or updates a user profile in the local database based on SSO user data
 */
export async function syncUserProfile(ssoUser: SSOUser, localSupabase: any): Promise<boolean> {
  try {
    const { error } = await localSupabase
      .from('profiles')
      .upsert({
        id: ssoUser.id,
        email: ssoUser.email,
        display_name: ssoUser.displayName || ssoUser.email.split('@')[0],
        role: Array.isArray(ssoUser.role) ? ssoUser.role[0] : ssoUser.role || 'user',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.warn('Error syncing user profile:', error.message)
      return false
    }

    return true
  } catch (error) {
    console.warn('Error syncing user profile:', error)
    return false
  }
}

/**
 * Validates CTID token and creates local user session
 */
export async function authenticateWithSSO(accessToken: string, localSupabase: any): Promise<SSOUser | null> {
  // Step 1: Validate token with SSO system
  const ssoUser = await validateSSOToken(accessToken)
  if (!ssoUser) {
    return null
  }

  // Step 2: Sync user profile to local database
  const syncSuccess = await syncUserProfile(ssoUser, localSupabase)
  if (!syncSuccess) {
    console.warn('Failed to sync user profile, but allowing login')
  }

  return ssoUser
}