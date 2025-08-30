import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

interface AuthInitializerProps {
  children: React.ReactNode
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Check for existing session and initialize auth state
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        // Decode JWT to get user_role
        let userRole = 'user'
        if (session.access_token) {
          try {
            const parts = session.access_token.split('.')
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]))
              userRole = payload.user_role || 'user'
            }
          } catch {
            // Default to 'user' if decoding fails
          }
        }

        const authUser = {
          accountNo: session.user.id,
          email: session.user.email || '',
          role: [userRole],
          userRole: userRole,
          exp: session.expires_at || 0,
          displayName:
            session.user.user_metadata?.display_name ||
            session.user.user_metadata?.name,
          avatarUrl:
            session.user.user_metadata?.avatar_url ||
            session.user.user_metadata?.picture,
        }

        useAuthStore.getState().auth.setUser(authUser)
        if (session.access_token) {
          useAuthStore.getState().auth.setAccessToken(session.access_token)
        }
      }

      setIsInitialized(true)
    }

    initializeAuth()
  }, [])

  if (!isInitialized) {
    return null
  }

  return <>{children}</>
}
