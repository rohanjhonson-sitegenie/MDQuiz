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

      console.log('🌐 Supabase fetch with satellite token:', !!satelliteToken)

      if (satelliteToken) {
        // Debug: decode and log token payload
        try {
          const parts = satelliteToken.split('.')
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]))
            console.log('🔍 Satellite token payload being sent:', payload)
          }
        } catch (e) {
          console.error('Failed to decode token for debugging:', e)
        }
      }

      return fetch(input, { ...init, headers: customHeaders })
    },
  },
})

export async function initializeSupabaseSession() {
  const authStore = useAuthStore.getState()
  const { satelliteToken } = authStore.auth

  console.log('🔍 [Supabase] initializeSupabaseSession called')
  console.log('🔍 [Supabase] Satellite token available:', !!satelliteToken)

  if (satelliteToken) {
    supabase.realtime.setAuth(satelliteToken)

    console.log('✅ [Supabase] Authentication configured via global fetch override')

    return { data: { session: null, user: null }, error: null }
  } else {
    console.warn('⚠️ [Supabase] No satellite token available for session initialization')
    return null
  }
}

export function createClient() {
  return supabase
}

export function refreshSupabaseClient() {
  return supabase
}