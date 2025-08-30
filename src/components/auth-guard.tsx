import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({
  children,
  redirectTo = '/auth/sign-in',
}: AuthGuardProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const { user: _user } = useAuthStore((state) => state.auth)

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        navigate({
          to: redirectTo,
          search: { redirect: window.location.pathname },
        })
      } else {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [navigate, redirectTo])

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-lg font-semibold'>Loading...</h2>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
