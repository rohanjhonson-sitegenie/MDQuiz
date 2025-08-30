import Cookies from 'js-cookie'
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

const ACCESS_TOKEN = 'thisisjustarandomstring'

interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  exp: number
  displayName?: string
  avatarUrl?: string
  userRole?: string
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
    signInWithGoogle: () => Promise<void>
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const cookieState = Cookies.get(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''

  // Initialize auth state listener
  supabase.auth.onAuthStateChange((event, session) => {
    if (
      (event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'INITIAL_SESSION') &&
      session?.user
    ) {
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

      const authUser: AuthUser = {
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
      get().auth.setUser(authUser)
      if (session.access_token) {
        get().auth.setAccessToken(session.access_token)
      }
    } else if (event === 'SIGNED_OUT' || !session) {
      get().auth.reset()
    }
  })

  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          Cookies.set(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
      signInWithGoogle: async () => {
        const redirectUrl = `${window.location.origin}/auth/callback`

        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            // Add skipBrowserRedirect for debugging if needed
            // skipBrowserRedirect: true,
          },
        })
      },
    },
  }
})

// export const useAuth = () => useAuthStore((state) => state.auth)
