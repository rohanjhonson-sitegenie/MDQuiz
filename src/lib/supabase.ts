import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores/authStore'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY

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

// Create authenticated client that injects CTID JWT tokens
export const supabase = new Proxy(baseClient, {
  get(target, prop, receiver) {
    const originalMethod = Reflect.get(target, prop, receiver)
    
    // Debug: Log all method calls
    console.log('[Supabase Proxy Debug] Method called:', prop)
    
    // Inject auth headers for database operations
    if (prop === 'from' || prop === 'rpc') {
      return function(...args: unknown[]) {
        // Get current CTID JWT token
        const { auth } = useAuthStore.getState()
        
        // Debug logging
        console.log('[Supabase Auth Debug]', {
          hasToken: !!auth.accessToken,
          tokenPreview: auth.accessToken ? `${auth.accessToken.substring(0, 20)}...` : 'No token',
          user: auth.user?.email || 'No user'
        })
        
        if (auth.accessToken) {
          // Inject Authorization header for authenticated requests
          const originalHeaders = target.rest.headers
          target.rest.headers = {
            ...originalHeaders,
            'Authorization': `Bearer ${auth.accessToken}`
          }
          console.log('[Supabase Auth Debug] Injected Authorization header')
        } else {
          console.log('[Supabase Auth Debug] No token found, request will be anonymous')
        }
        
        // Call original method with injected headers
        return originalMethod.apply(target, args)
      }
    }
    
    // For storage operations, also inject auth if needed
    if (prop === 'storage') {
      return new Proxy(originalMethod, {
        get(storageTarget, storageProp, storageReceiver) {
          const originalStorageMethod = Reflect.get(storageTarget, storageProp, storageReceiver)
          
          if (typeof originalStorageMethod === 'function') {
            return function(...args: unknown[]) {
              const { auth } = useAuthStore.getState()
              
              if (auth.accessToken && target.storage) {
                // Inject auth for storage operations
                const originalHeaders = target.storage.headers || {}
                target.storage.headers = {
                  ...originalHeaders,
                  'Authorization': `Bearer ${auth.accessToken}`
                }
              }
              
              return originalStorageMethod.apply(storageTarget, args)
            }
          }
          
          return originalStorageMethod
        }
      })
    }
    
    return originalMethod
  }
})

// Export createClient function for dependency injection
export function createClient() {
  return supabase
}
