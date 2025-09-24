import { useEffect, useRef } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { AuthSessionManager } from '@/lib/auth-session-manager'

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
        // Decode CTID token to get user info
        const parts = access_token.split('.')
        if (parts.length !== 3) {
          throw new Error('Invalid JWT format')
        }

        const payload = JSON.parse(atob(parts[1]))
        const userRole = payload.user_role || 'user'

        // Create user object from JWT payload
        const authUser = {
          accountNo: payload.sub,
          email: payload.email,
          role: [userRole],
          userRole: userRole,
          userProfile: userRole,
          exp: payload.exp,
          displayName:
            payload.user_metadata?.display_name || payload.user_metadata?.name,
          avatarUrl:
            payload.user_metadata?.avatar_url || payload.user_metadata?.picture,
        }

        // Try to exchange tokens, but don't fail if edge function isn't deployed
        let satelliteToken = ''
        try {
          const sessionManager = new AuthSessionManager(access_token)
          const result = await sessionManager.exchangeTokens()
          satelliteToken = result.satelliteToken

          // Debug: Decode and log satellite token payload
          const satParts = satelliteToken.split('.')
          if (satParts.length === 3) {
            const satPayload = JSON.parse(atob(satParts[1]))
            console.log('✅ Token exchange successful')
            console.log('📋 Satellite token payload:', satPayload)
            console.log('👤 User role in satellite token:', satPayload.user_role)
          }
        } catch (exchangeError) {
          console.warn('⚠️ Token exchange failed (edge function may not be deployed):', exchangeError)
          console.log('Proceeding with CTID token only (RLS must be disabled)')
          // Use CTID token as fallback
          satelliteToken = access_token
        }

        // Set both CTID token and satellite token in auth store
        const { setUser, setAccessToken, setSatelliteToken } = useAuthStore.getState().auth
        setUser(authUser)
        setAccessToken(access_token) // Keep CTID token for refresh
        setSatelliteToken(satelliteToken) // Set satellite token for database access

        // Clean up URL hash and redirect to intended destination
        history.replaceState(null, '', location.pathname + location.search)
        const next = (search as { next?: string })?.next || '/'
        navigate({ to: next })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('❌ Error processing CTID tokens:', err)

        // Show error to user instead of infinite redirect
        alert(`Authentication error: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`)

        // Only redirect if we haven't tried before (check for a flag in sessionStorage)
        const retryKey = 'auth_retry_count'
        const retryCount = parseInt(sessionStorage.getItem(retryKey) || '0')

        if (retryCount < 2) {
          sessionStorage.setItem(retryKey, (retryCount + 1).toString())
          const returnTo = `${location.origin}/auth/ready?next=${encodeURIComponent('/')}`
          const idServiceUrl =
            import.meta.env.VITE_ID_SERVICE_URL || 'https://devid.ctedu.ca'
          const url = `${idServiceUrl}/login?return_to=${encodeURIComponent(returnTo)}`
          location.assign(url)
        } else {
          // Clear retry count and redirect to home
          sessionStorage.removeItem(retryKey)
          navigate({ to: '/' })
        }
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
