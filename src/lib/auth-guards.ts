import { redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'

export const requireAuth = async ({
  location,
}: {
  location: { href: string }
}) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw redirect({
      to: '/auth/sign-in',
      search: {
        redirect: location.href,
      },
    })
  }
  return { session }
}

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

export const requireRole =
  (allowedRoles: string[]) =>
  async ({ location }: { location: { href: string } }) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw redirect({
        to: '/auth/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    const decodedToken = decodeJWT(session.access_token)
    const userRole = decodedToken?.user_role || 'user'

    if (!allowedRoles.includes(userRole)) {
      throw redirect({
        to: '/401',
        search: {
          from: location.href,
        },
      })
    }

    return { session, userRole }
  }
