import { useEffect, useRef } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'

export const Route = createFileRoute('/auth/ready')({
  component: AuthReady,
})

function AuthReady() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/auth/ready' })
  const hasProcessed = useRef(false)

  useEffect(() => {
    const processCtidTokens = async () => {
      // Prevent double execution (React StrictMode or remounting)
      if (hasProcessed.current) {
        return
      }
      hasProcessed.current = true

      // Extract tokens from URL hash (sent by CTID Service)
      const hash = new URLSearchParams(location.hash.slice(1))
      const access_token = hash.get('access_token')
      const refresh_token = hash.get('refresh_token')

      if (!access_token || !refresh_token) {
        // eslint-disable-next-line no-console
        console.error('Missing tokens from CTID Service')
        // Redirect back to CTID service for authentication
        const returnTo = `${location.origin}/auth/ready?next=${encodeURIComponent('/')}`
        const idServiceUrl =
          import.meta.env.VITE_ID_SERVICE_URL || 'https://devid.ctedu.ca'
        const url = `${idServiceUrl}/login?return_to=${encodeURIComponent(returnTo)}`
        location.assign(url)
        return
      }

      try {
        // For satellite DB: decode JWT payload manually and set user in store
        // instead of using supabase.auth.setSession() which requires signature verification
        const parts = access_token.split('.')
        if (parts.length !== 3) {
          throw new Error('Invalid JWT format')
        }

        const payload = JSON.parse(atob(parts[1]))
        const userRole = payload.user_role || 'user'
        const userProfile = userRole // Use user_role for userProfile field

        // Create user object from JWT payload
        const authUser = {
          accountNo: payload.sub,
          email: payload.email,
          role: [userRole],
          userRole: userRole,
          userProfile: userProfile,
          exp: payload.exp,
          displayName:
            payload.user_metadata?.display_name || payload.user_metadata?.name,
          avatarUrl:
            payload.user_metadata?.avatar_url || payload.user_metadata?.picture,
        }

        // Set user in auth store directly (bypass Supabase session for satellite DB)
        const { setUser, setAccessToken } = useAuthStore.getState().auth
        setUser(authUser)
        setAccessToken(access_token)

        // Clean up URL hash and redirect to intended destination
        history.replaceState(null, '', location.pathname + location.search)
        const next = (search as { next?: string })?.next || '/'
        navigate({ to: next })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error processing CTID tokens:', err)
        // Redirect back to CTID service for authentication
        const returnTo = `${location.origin}/auth/ready?next=${encodeURIComponent('/')}`
        const idServiceUrl =
          import.meta.env.VITE_ID_SERVICE_URL || 'https://devid.ctedu.ca'
        const url = `${idServiceUrl}/login?return_to=${encodeURIComponent(returnTo)}`
        location.assign(url)
      }
    }

    processCtidTokens()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Remove navigate and search from dependencies to prevent re-runs

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='text-center'>
        <h2 className='text-lg font-semibold'>Completing sign in...</h2>
        <p className='text-muted-foreground'>
          Please wait while we redirect you.
        </p>
      </div>
    </div>
  )
}
