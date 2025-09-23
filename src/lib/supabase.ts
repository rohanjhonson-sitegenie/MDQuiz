import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores/authStore'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Validate environment variables
if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create base Supabase client
const baseClient = createSupabaseClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Important: disable for consumer apps
  },
})

// For now, just use the base client with anon key since RLS is disabled
// This avoids the complex async token exchange issues while we test
export const supabase = baseClient

// Export createClient function for dependency injection
export function createClient() {
  return supabase
}
