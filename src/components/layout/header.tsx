import React from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useNavbarTheme } from '@/hooks/use-navbar-theme'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Logo } from '@/components/logo'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export const Header = ({
  className,
  fixed,
  children,
  ...props
}: HeaderProps) => {
  const [offset, setOffset] = React.useState(0)
  const { navbarStyles, navbarClasses, isReversed, navbarMode } =
    useNavbarTheme()

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        isReversed
          ? 'border-border flex h-16 items-center gap-3 border-b-2 bg-[var(--navbar-background)] p-4 sm:gap-4'
          : 'bg-background border-border flex h-16 items-center gap-3 border-b-2 p-4 sm:gap-4',
        fixed && 'header-fixed peer/header fixed z-50 w-[inherit] rounded-md',
        offset > 10 && fixed ? 'shadow-sm' : 'shadow-none',
        navbarClasses,
        className
      )}
      style={navbarStyles}
      {...props}
    >
      <SidebarTrigger variant='outline' className='scale-125 sm:scale-100' />
      <Separator orientation='vertical' className='h-6' />
      <Link
        to='/'
        className='inline-flex transition-opacity hover:opacity-80'
        aria-label='Go to homepage'
      >
        <Logo
          size='sm'
          variant='auto'
          navbarMode={isReversed ? navbarMode : null}
          className='p-0'
        />
      </Link>
      {children}
    </header>
  )
}

Header.displayName = 'Header'
