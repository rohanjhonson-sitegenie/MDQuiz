import { Link } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { useLocale } from '@/hooks/use-locale'
import { Button } from '@/components/ui/button'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useAuthModal } from '@/hooks/use-auth-modal'
import { SignInModal } from '@/features/auth/sign-in/components/sign-in-modal'

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
  const { isOpen, openModal, closeModal } = useAuthModal()

  if (!user) {
    if (isMobile) {
      return (
        <>
          <div className='space-y-3 px-4'>
            <Button
              variant='outline'
              size='default'
              onClick={openModal}
              className='w-full justify-center'
            >
              {t('auth.signIn')}
            </Button>
            <Button size='default' asChild className='w-full justify-center'>
              <Link to='/auth/sign-up'>{t('auth.getStarted')}</Link>
            </Button>
          </div>
          <SignInModal isOpen={isOpen} onClose={closeModal} />
        </>
      )
    }

    return (
      <>
        <Button
          variant='ghost'
          size='sm'
          onClick={openModal}
          className='hover:bg-accent/50 hidden md:inline-flex'
        >
          {t('auth.signIn')}
        </Button>
        <Button
          size='sm'
          asChild
          className='bg-primary hover:bg-primary/90 hidden md:inline-flex'
        >
          <Link to='/auth/sign-up'>{t('auth.getStarted')}</Link>
        </Button>
        <SignInModal isOpen={isOpen} onClose={closeModal} />
      </>
    )
  }

  const portalLink = user.userRole === 'admin' ? '/admin' : '/user'
  const portalText =
    user.userRole === 'admin' ? t('auth.adminPortal') : t('auth.userPortal')

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
