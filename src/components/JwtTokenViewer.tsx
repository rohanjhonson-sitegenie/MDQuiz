import { useState, useEffect } from 'react'
import { Copy, RefreshCw, Key, Clock, User, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface DecodedToken {
  sub?: string
  email?: string
  role?: string
  aud?: string
  exp?: number
  iat?: number
  iss?: string
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
}

export function JwtTokenViewer() {
  const { accessToken } = useAuthStore((state) => state.auth)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null)
  const [tokenExpiry, setTokenExpiry] = useState<string>('')
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<string>('')

  const updateExpiryTime = (exp: number) => {
    const expiryDate = new Date(exp * 1000)
    setTokenExpiry(expiryDate.toLocaleString())

    const now = Date.now()
    const expiryMs = exp * 1000
    const timeLeft = expiryMs - now

    if (timeLeft > 0) {
      const hours = Math.floor(timeLeft / (1000 * 60 * 60))
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)
      setTimeUntilExpiry(`${hours}h ${minutes}m ${seconds}s`)
    } else {
      setTimeUntilExpiry('Expired')
    }
  }

  useEffect(() => {
    const decodeToken = (token: string) => {
      try {
        const parts = token.split('.')
        if (parts.length !== 3) {
          throw new Error('Invalid token format')
        }

        const payload = JSON.parse(atob(parts[1]))
        setDecodedToken(payload)

        if (payload.exp) {
          updateExpiryTime(payload.exp)
        }
      } catch {
        setDecodedToken(null)
      }
    }

    if (accessToken) {
      decodeToken(accessToken)
    }
  }, [accessToken])

  useEffect(() => {
    const interval = setInterval(() => {
      if (decodedToken?.exp) {
        updateExpiryTime(decodedToken.exp)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [decodedToken])

  // Listen for auth state changes to update token display
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        // Force re-render by getting latest token from session
        const authStore = useAuthStore.getState()
        authStore.auth.setAccessToken(session.access_token)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const copyToken = async () => {
    if (accessToken) {
      await navigator.clipboard.writeText(accessToken)
      toast.success('Token copied to clipboard')
    }
  }

  const refreshToken = async () => {
    setIsRefreshing(true)
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error

      if (data.session) {
        toast.success('Token refreshed successfully')
      }
    } catch {
      toast.error('Failed to refresh token')
    } finally {
      setIsRefreshing(false)
    }
  }

  const isTokenExpired =
    decodedToken?.exp && decodedToken.exp * 1000 < Date.now()

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Key className='h-5 w-5' />
          JWT Token
        </CardTitle>
        <CardDescription>
          View and manage your authentication token
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {accessToken ? (
          <>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={copyToken}
                className='flex items-center gap-2'
              >
                <Copy className='h-4 w-4' />
                Copy Token
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={refreshToken}
                disabled={isRefreshing}
                className='flex items-center gap-2'
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>

            <Separator />

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Status</span>
                <Badge variant={isTokenExpired ? 'destructive' : 'success'}>
                  {isTokenExpired ? 'Expired' : 'Valid'}
                </Badge>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <Clock className='text-muted-foreground h-4 w-4' />
                  <span className='font-medium'>Expires:</span>
                  <span className='text-muted-foreground'>{tokenExpiry}</span>
                </div>
                {!isTokenExpired && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Clock className='text-muted-foreground h-4 w-4' />
                    <span className='font-medium'>Time remaining:</span>
                    <span className='text-muted-foreground'>
                      {timeUntilExpiry}
                    </span>
                  </div>
                )}
              </div>

              {decodedToken && (
                <>
                  <Separator />
                  <div className='space-y-2'>
                    <h4 className='text-sm font-medium'>Token Details</h4>

                    {decodedToken.sub && (
                      <div className='flex items-center gap-2 text-sm'>
                        <User className='text-muted-foreground h-4 w-4' />
                        <span className='font-medium'>User ID:</span>
                        <span className='text-muted-foreground font-mono text-xs'>
                          {decodedToken.sub}
                        </span>
                      </div>
                    )}

                    {decodedToken.email && (
                      <div className='flex items-center gap-2 text-sm'>
                        <User className='text-muted-foreground h-4 w-4' />
                        <span className='font-medium'>Email:</span>
                        <span className='text-muted-foreground'>
                          {decodedToken.email}
                        </span>
                      </div>
                    )}

                    {decodedToken.role && (
                      <div className='flex items-center gap-2 text-sm'>
                        <Shield className='text-muted-foreground h-4 w-4' />
                        <span className='font-medium'>Role:</span>
                        <span className='text-muted-foreground'>
                          {decodedToken.role}
                        </span>
                      </div>
                    )}

                    {decodedToken.aud && (
                      <div className='flex items-center gap-2 text-sm'>
                        <span className='font-medium'>Audience:</span>
                        <span className='text-muted-foreground'>
                          {decodedToken.aud}
                        </span>
                      </div>
                    )}

                    {decodedToken.iss && (
                      <div className='flex items-center gap-2 text-sm'>
                        <span className='font-medium'>Issuer:</span>
                        <span className='text-muted-foreground'>
                          {decodedToken.iss}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <Separator />

            <details className='cursor-pointer'>
              <summary className='text-sm font-medium'>View Raw Token</summary>
              <div className='bg-muted mt-2 rounded-md p-2'>
                <code className='text-xs break-all'>{accessToken}</code>
              </div>
            </details>
          </>
        ) : (
          <Alert>
            <AlertDescription>
              No authentication token found. Please sign in to view token
              details.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
