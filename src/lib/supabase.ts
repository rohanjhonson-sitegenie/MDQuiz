import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores/authStore'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createSupabaseClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    fetch: (input, init = {}) => {
      const authStore = useAuthStore.getState()
      const { satelliteToken } = authStore.auth

      const customHeaders = {
        'Content-Type': 'application/json',
        apikey: supabasePublishableKey,
        ...(satelliteToken && { Authorization: `Bearer ${satelliteToken}` }),
        ...init.headers,
      }


      return fetch(input, { ...init, headers: customHeaders })
    },
  },
})

export async function initializeSupabaseSession() {
  const authStore = useAuthStore.getState()
  const { satelliteToken } = authStore.auth

  if (satelliteToken) {
    try {
      // Try to set the session using the satellite token
      const { data, error } = await supabase.auth.setSession({
        access_token: satelliteToken,
        refresh_token: satelliteToken // In this case we use the same token
      })

      if (error) {
        // Fall back to realtime auth
        supabase.realtime.setAuth(satelliteToken)
      }

      return { data, error }
    } catch (error) {
      // Fall back to realtime auth
      supabase.realtime.setAuth(satelliteToken)
      return { data: { session: null, user: null }, error: null }
    }
  } else {
    return null
  }
}

export function createClient() {
  return supabase
}

export function refreshSupabaseClient() {
  return supabase
}