import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

interface AuthGuardProps {
  children: React.ReactNode
}

const redirectToCtidService = (returnPath: string) => {
  const returnTo = `${location.origin}/auth/ready?next=${encodeURIComponent(returnPath)}`
  const idServiceUrl =
    import.meta.env.VITE_ID_SERVICE_URL || 'https://devid.ctedu.ca'
  const url = `${idServiceUrl}/login?return_to=${encodeURIComponent(returnTo)}`

  location.assign(url) // Full page redirect to CTID Service
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuthStore((state) => state.auth)

  useEffect(() => {
    const checkAuth = async () => {
      // eslint-disable-next-line no-console
      console.log('AuthGuard: Checking auth for path:', location.pathname)

      // Skip auth check for the CTID callback route
      if (location.pathname === '/auth/ready') {
        // eslint-disable-next-line no-console
        console.log('AuthGuard: Skipping auth check for /auth/ready')
        setIsLoading(false)
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      // eslint-disable-next-line no-console
      console.log('AuthGuard: Session exists:', !!session)

      if (!session) {
        // eslint-disable-next-line no-console
        console.log('AuthGuard: No session, redirecting to CTID')
        // No local auth UI - redirect to CTID Service immediately
        redirectToCtidService(location.pathname + location.search)
      } else {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-lg font-semibold'>Loading...</h2>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-lg font-semibold'>
            Redirecting to authentication...
          </h2>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
