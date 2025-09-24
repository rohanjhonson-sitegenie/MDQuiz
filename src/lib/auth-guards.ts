import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { AuthSessionManager } from './auth-session-manager'

interface DecodedToken {
  user_role?: string
  [key: string]: unknown
}

function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))

    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export const requireRole =
  (allowedRoles: string[]) =>
  async ({ location }: { location: { href: string } }) => {
    // Check auth store for tokens
    const authStore = useAuthStore.getState().auth

    // If no CTID token in auth store, redirect to CTID login
    if (!authStore.accessToken || !authStore.user) {
      const returnTo = `${window.location.origin}/auth/ready?next=${encodeURIComponent(location.href)}`
      const idServiceUrl =
        import.meta.env.VITE_ID_SERVICE_URL || 'https://devid.ctedu.ca'
      const url = `${idServiceUrl}/login?return_to=${encodeURIComponent(returnTo)}`
      window.location.assign(url)
      return
    }

    // Check if we need to refresh the satellite token (skip if using fallback CTID token)
    const isUsingCtidFallback = authStore.satelliteToken === authStore.accessToken

    if (!authStore.satelliteToken && !isUsingCtidFallback) {
      try {
        const sessionManager = new AuthSessionManager(authStore.accessToken)
        const refreshResult = await sessionManager.refreshSatelliteToken()

        if (refreshResult.success && refreshResult.satelliteToken) {
          authStore.setSatelliteToken(refreshResult.satelliteToken)
        } else {
          // If refresh fails, use CTID token as fallback
          console.warn('⚠️ Satellite token refresh failed, using CTID token as fallback')
          authStore.setSatelliteToken(authStore.accessToken)
        }
      } catch (error) {
        console.error('Error refreshing satellite token:', error)
        // Use CTID token as fallback instead of redirecting
        console.warn('⚠️ Using CTID token as fallback (RLS must be disabled)')
        authStore.setSatelliteToken(authStore.accessToken)
      }
    }

    // Decode and validate CTID token for role checking
    const decodedToken = decodeJWT(authStore.accessToken)

    if (!decodedToken) {
      // Invalid or expired token - clear auth store and redirect to login
      authStore.reset()
      const returnTo = `${window.location.origin}/auth/ready?next=${encodeURIComponent(location.href)}`
      const idServiceUrl =
        import.meta.env.VITE_ID_SERVICE_URL || 'https://devid.ctedu.ca'
      const url = `${idServiceUrl}/login?return_to=${encodeURIComponent(returnTo)}`
      window.location.assign(url)
      return
    }

    const userProfile =
      decodedToken.user_role || authStore.user.userRole || 'user'

    // Check if user profile has access to this route
    if (!allowedRoles.includes(userProfile)) {
      throw redirect({
        to: '/401',
        search: {
          from: location.href,
        },
      })
    }

    return { user: authStore.user, userProfile, decodedToken }
  }
