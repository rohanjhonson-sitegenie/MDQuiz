import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
})

interface DecodedToken {
  user_role?: string
  [key: string]: unknown
}

function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch {
    return null
  }
}

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Decode JWT to get user role
          const decodedToken = decodeJWT(session.access_token)
          const userRole = decodedToken?.user_role || 'user'

          // Redirect based on role
          if (userRole === 'superadmin' || userRole === 'admin') {
            navigate({ to: '/admin' })
          } else if (['student', 'parent', 'teacher'].includes(userRole)) {
            navigate({ to: '/user' })
          } else {
            navigate({ to: '/user' })
          }
        }
      }
    )

    // Check if already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Decode JWT to get user role
        const decodedToken = decodeJWT(session.access_token)
        const userRole = decodedToken?.user_role || 'user'

        // Redirect based on role
        if (userRole === 'superadmin' || userRole === 'admin') {
          navigate({ to: '/admin' })
        } else if (['student', 'parent', 'teacher'].includes(userRole)) {
          navigate({ to: '/user' })
        } else {
          navigate({ to: '/user' })
        }
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [navigate])

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
