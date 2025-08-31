import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'

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
    // Check auth store for CTID token
    const authStore = useAuthStore.getState().auth

    // If no token in auth store, redirect to CTID login
    if (!authStore.accessToken || !authStore.user) {
      const returnTo = `${window.location.origin}/auth/ready?next=${encodeURIComponent(location.href)}`
      const idServiceUrl =
        import.meta.env.VITE_ID_SERVICE_URL || 'https://devid.ctedu.ca'
      const url = `${idServiceUrl}/login?return_to=${encodeURIComponent(returnTo)}`
      window.location.assign(url)
      return
    }

    // Decode and validate JWT token
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
