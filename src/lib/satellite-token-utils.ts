import { useAuthStore } from '@/stores/authStore'

interface SatelliteTokenPayload {
  sub: string
  email: string
  display_name?: string
  given_name?: string
  family_name?: string
  avatar_url?: string
  user_role?: string
  exp?: number
  [key: string]: unknown
}

function decodeSatelliteJWT(token: string): SatelliteTokenPayload | null {
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

/**
 * Gets the current user's display name from the satellite JWT token
 * Falls back to auth store user data if satellite token is unavailable
 */
export function getCurrentUserDisplayName(): string {
  const authStore = useAuthStore.getState()
  const { satelliteToken, user } = authStore.auth

  // Try to get display name from satellite JWT first
  if (satelliteToken) {
    const decodedToken = decodeSatelliteJWT(satelliteToken)
    if (decodedToken?.display_name) {
      return decodedToken.display_name
    }
  }

  // Fallback to auth store user data
  return user?.displayName || ''
}

/**
 * Gets the current user's profile information from the satellite JWT token
 */
export function getCurrentUserProfile(): {
  displayName: string
  givenName?: string
  familyName?: string
  avatarUrl?: string
} {
  const authStore = useAuthStore.getState()
  const { satelliteToken, user } = authStore.auth

  // Try to get profile from satellite JWT first
  if (satelliteToken) {
    const decodedToken = decodeSatelliteJWT(satelliteToken)
    if (decodedToken) {
      return {
        displayName: decodedToken.display_name || user?.displayName || '',
        givenName: decodedToken.given_name,
        familyName: decodedToken.family_name,
        avatarUrl: decodedToken.avatar_url || user?.avatarUrl,
      }
    }
  }

  // Fallback to auth store user data
  return {
    displayName: user?.displayName || '',
    givenName: undefined,
    familyName: undefined,
    avatarUrl: user?.avatarUrl,
  }
}