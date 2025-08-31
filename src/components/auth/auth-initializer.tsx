import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

interface AuthInitializerProps {
  children: React.ReactNode
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const { user } = useAuthStore((state) => state.auth)

  useEffect(() => {
    // Check for token expiration
    const checkTokenExpiration = () => {
      if (user && user.exp) {
        const now = Math.floor(Date.now() / 1000)
        if (now >= user.exp) {
          // Token expired, clear auth state
          useAuthStore.getState().auth.reset()
        }
      }
      setIsInitialized(true)
    }

    checkTokenExpiration()
  }, [user])

  if (!isInitialized) {
    return null
  }

  return <>{children}</>
}
