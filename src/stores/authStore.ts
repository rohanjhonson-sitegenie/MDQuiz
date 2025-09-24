import Cookies from 'js-cookie'
import { create } from 'zustand'

const ACCESS_TOKEN = 'ctid_access_token'
const SATELLITE_TOKEN = 'satellite_access_token'
const USER_DATA = 'ctid_user_data'

interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  exp: number
  displayName?: string
  avatarUrl?: string
  userRole?: string
  userProfile?: string
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    satelliteToken: string
    setSatelliteToken: (satelliteToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set, _get) => {
  // Initialize from cookies
  const cookieToken = Cookies.get(ACCESS_TOKEN)
  const cookieSatelliteToken = Cookies.get(SATELLITE_TOKEN)
  const cookieUser = Cookies.get(USER_DATA)

  const initToken = cookieToken ? JSON.parse(cookieToken) : ''
  const initSatelliteToken = cookieSatelliteToken ? JSON.parse(cookieSatelliteToken) : ''
  const initUser = cookieUser ? JSON.parse(cookieUser) : null

  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          if (user) {
            Cookies.set(USER_DATA, JSON.stringify(user), { expires: 7 }) // 7 days
          } else {
            Cookies.remove(USER_DATA)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          Cookies.set(ACCESS_TOKEN, JSON.stringify(accessToken), { expires: 7 }) // 7 days
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      satelliteToken: initSatelliteToken,
      setSatelliteToken: (satelliteToken) =>
        set((state) => {
          Cookies.set(SATELLITE_TOKEN, JSON.stringify(satelliteToken), { expires: 7 }) // 7 days
          return { ...state, auth: { ...state.auth, satelliteToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          Cookies.remove(SATELLITE_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '', satelliteToken: '' } }
        }),
      reset: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          Cookies.remove(SATELLITE_TOKEN)
          Cookies.remove(USER_DATA)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '', satelliteToken: '' },
          }
        }),
    },
  }
})

// export const useAuth = () => useAuthStore((state) => state.auth)
