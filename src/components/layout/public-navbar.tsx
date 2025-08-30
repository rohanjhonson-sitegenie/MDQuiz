import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import type { PublicNavbarProps } from '@/types/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavbarTheme } from '@/hooks/use-navbar-theme'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { AuthNavigation } from '@/components/auth-navigation'
import { LanguageSwitch } from '@/components/language-switch'
import { Logo } from '@/components/logo'
import { ThemeSwitch } from '@/components/theme-switch'

export function PublicNavbar({
  items,
  showAuthButtons = true,
  className,
}: Omit<PublicNavbarProps, 'logoText'>) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { navbarStyles, navbarClasses, isReversed, navbarMode } =
    useNavbarTheme()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? isReversed
            ? 'border-b border-[var(--navbar-border)] bg-[var(--navbar-background)]/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-[var(--navbar-background)]/85'
            : 'bg-background/95 supports-[backdrop-filter]:bg-background/85 border-b shadow-sm backdrop-blur-md'
          : 'bg-transparent',
        navbarClasses,
        className
      )}
      style={navbarStyles}
    >
      <div className='container flex h-16 items-center'>
        <div className='mr-4 flex'>
          <Link to='/' className='group mr-6 flex items-center'>
            <Logo
              size='sm'
              variant='auto'
              navbarMode={isReversed ? navbarMode : null}
              className='p-0'
            />
          </Link>
          <nav className='hidden items-center space-x-1 text-sm font-medium md:flex'>
            {items.map((item) =>
              item.isHashLink ? (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'hover:text-foreground hover:bg-accent/50 rounded-md px-3 py-2 transition-all',
                    item.highlight
                      ? 'text-primary font-semibold'
                      : 'text-foreground/60'
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    const element = document.querySelector(item.href)
                    element?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    })
                  }}
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'hover:text-foreground hover:bg-accent/50 rounded-md px-3 py-2 transition-all',
                    item.highlight
                      ? 'text-primary font-semibold'
                      : 'text-foreground/60'
                  )}
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>
        </div>

        <div className='flex flex-1 items-center justify-end space-x-4'>
          <nav className='flex items-center space-x-2'>
            <LanguageSwitch />
            <ThemeSwitch />
            {showAuthButtons && <AuthNavigation />}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='hover:bg-accent/50 focus-visible:bg-accent/50 relative mr-2 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden'
                >
                  <Menu
                    className={cn(
                      'h-5 w-5 transition-all duration-300',
                      open ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
                    )}
                  />
                  <X
                    className={cn(
                      'absolute inset-0 m-auto h-5 w-5 transition-all duration-300',
                      open ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
                    )}
                  />
                  <span className='sr-only'>Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side='right' className='w-[300px] p-0 sm:w-[400px]'>
                <SheetHeader className='bg-muted/30 border-b px-6 py-4'>
                  <SheetTitle className='flex items-center'>
                    <Logo
                      size='md'
                      variant='auto'
                      navbarMode={isReversed ? navbarMode : null}
                      className='p-0'
                    />
                  </SheetTitle>
                </SheetHeader>
                <nav className='flex flex-col px-6 py-4'>
                  <div className='space-y-1'>
                    {items.map((item, index) =>
                      item.isHashLink ? (
                        <a
                          key={item.name}
                          href={item.href}
                          className={cn(
                            'group relative block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200',
                            'hover:bg-accent/50 hover:text-foreground',
                            'before:bg-primary before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full before:opacity-0 before:transition-opacity before:duration-200',
                            'hover:before:opacity-100',
                            item.highlight
                              ? 'text-primary font-semibold before:opacity-100'
                              : 'text-foreground/70'
                          )}
                          onClick={(e) => {
                            e.preventDefault()
                            setOpen(false)
                            setTimeout(() => {
                              const element = document.querySelector(item.href)
                              element?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                              })
                            }, 300)
                          }}
                          style={{
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          <span className='relative z-10'>{item.name}</span>
                        </a>
                      ) : (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={cn(
                            'group relative block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200',
                            'hover:bg-accent/50 hover:text-foreground',
                            'before:bg-primary before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full before:opacity-0 before:transition-opacity before:duration-200',
                            'hover:before:opacity-100',
                            item.highlight
                              ? 'text-primary font-semibold before:opacity-100'
                              : 'text-foreground/70'
                          )}
                          onClick={() => {
                            setTimeout(() => setOpen(false), 150)
                          }}
                          style={{
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          <span className='relative z-10'>{item.name}</span>
                        </Link>
                      )
                    )}
                  </div>
                  {showAuthButtons && (
                    <>
                      <div className='my-4 border-t' />
                      <AuthNavigation isMobile />
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </div>
    </header>
  )
}
