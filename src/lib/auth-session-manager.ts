import type { AuthUser } from '@/types/quiz.types'
import { exchangeTokenForSatellite } from './satellite-client'

interface TokenRefreshResult {
  success: boolean
  satelliteToken?: string
  error?: string
}

export class AuthSessionManager {
  private ctidToken: string
  private satelliteToken: string | null

  constructor(ctidToken: string, satelliteToken: string | null = null) {
    this.ctidToken = ctidToken
    this.satelliteToken = satelliteToken
  }

  async exchangeTokens(): Promise<{ satelliteToken: string; user: AuthUser }> {
    if (!this.ctidToken) {
      throw new Error('CTID token is required for exchange')
    }

    // Decode user info from CTID token
    const parts = this.ctidToken.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid CTID token format')
    }

    const payload = JSON.parse(atob(parts[1]))
    const userRole =
      payload.user_role || payload.role || payload.user_metadata?.role || 'user'

    const user: AuthUser = {
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

    // Use existing satellite client function
    const satelliteToken = await exchangeTokenForSatellite(
      this.ctidToken,
      import.meta.env.VITE_SUPABASE_URL
    )

    this.satelliteToken = satelliteToken
    return { satelliteToken, user }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }

  async refreshSatelliteToken(): Promise<TokenRefreshResult> {
    if (!this.ctidToken) {
      return { success: false, error: 'CTID token missing' }
    }

    if (this.isTokenExpired(this.ctidToken)) {
      return { success: false, error: 'CTID token expired' }
    }

    try {
      const { satelliteToken } = await this.exchangeTokens()
      return { success: true, satelliteToken }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed',
      }
    }
  }

  getSatelliteToken(): string | null {
    return this.satelliteToken
  }

  getCTIDToken(): string {
    return this.ctidToken
  }
}