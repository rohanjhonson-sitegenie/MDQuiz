import { Link } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { useLocale } from '@/hooks/use-locale'
import { Button } from '@/components/ui/button'
import { ProfileDropdown } from '@/components/profile-dropdown'

interface AuthNavigationProps {
  className?: string
  isMobile?: boolean
}

export function AuthNavigation({
  className: _className,
  isMobile,
}: AuthNavigationProps) {
  const { user } = useAuthStore((state) => state.auth)
  const { t } = useLocale()

  const handleSignIn = () => {
    const returnTo = `${location.origin}/auth/ready?next=${encodeURIComponent(location.pathname + location.search)}`
    const idServiceUrl =
      import.meta.env.VITE_ID_SERVICE_URL || 'https://devid.ctedu.ca'
    const url = `${idServiceUrl}/login?return_to=${encodeURIComponent(returnTo)}`
    location.assign(url)
  }

  if (!user) {
    if (isMobile) {
      return (
        <div className='space-y-3 px-4'>
          <Button
            variant='outline'
            size='default'
            onClick={handleSignIn}
            className='w-full justify-center'
          >
            {t('auth.signIn')}
          </Button>
        </div>
      )
    }

    return (
      <Button
        variant='ghost'
        size='sm'
        onClick={handleSignIn}
        className='hover:bg-accent/50 hidden md:inline-flex'
      >
        {t('auth.signIn')}
      </Button>
    )
  }

  const isAdmin = user.userRole === 'superadmin' || user.userRole === 'admin'
  const portalLink = isAdmin ? '/admin' : '/user'
  const portalText = isAdmin ? t('auth.adminPortal') : t('auth.userPortal')

  if (isMobile) {
    return (
      <Link
        to={portalLink}
        className='group hover:bg-accent/50 hover:text-foreground before:bg-primary text-foreground/70 relative block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100'
      >
        <span className='relative z-10'>{portalText}</span>
      </Link>
    )
  }

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        asChild
        className='hover:bg-accent/50 hidden md:inline-flex'
      >
        <Link to={portalLink}>{portalText}</Link>
      </Button>
      <ProfileDropdown />
    </>
  )
}
