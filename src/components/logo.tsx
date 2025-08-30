import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-context'

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'full-color' | 'white' | 'mark-only' | 'auto'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  type?: 'full' | 'mark'
  navbarMode?: 'light' | 'dark' | null
}

export function Logo({
  variant = 'auto',
  size = 'md',
  type = 'full',
  navbarMode = null,
  className,
  ...props
}: LogoProps) {
  const { theme } = useTheme()
  // Size configurations based on design tokens
  const sizeConfig = {
    sm: { height: '30px' },
    md: { height: '50px' },
    lg: { height: '70px' },
    xl: { height: '100px' },
  }

  // Determine which logo to use
  const getLogoSrc = () => {
    if (type === 'mark') {
      return '/images/logo-mark.svg'
    }

    // Auto variant switches based on theme
    let effectiveVariant = variant
    if (variant === 'auto') {
      // If navbarMode is provided (for navbar theming), use that
      if (navbarMode) {
        effectiveVariant = navbarMode === 'dark' ? 'white' : 'full-color'
      } else {
        // Otherwise use the global theme
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light'
        const currentTheme = theme === 'system' ? systemTheme : theme
        effectiveVariant = currentTheme === 'dark' ? 'white' : 'full-color'
      }
    }

    switch (effectiveVariant) {
      case 'white':
        return '/images/logo-white.svg'
      case 'full-color':
      default:
        return '/images/logo-full-color.svg'
    }
  }

  // Get alt text based on type
  const getAltText = () => {
    if (type === 'mark') {
      return 'CTRC Logo Mark'
    }
    return 'Caution Tape Robotics'
  }

  return (
    <div
      className={cn(
        'inline-flex items-center',
        // Clear space around logo (design token: spacing.4 = 1rem)
        'p-4',
        className
      )}
      style={{
        // Icon gap spacing (design token: spacing.3 = 0.75rem)
        gap: '0.75rem',
      }}
      {...props}
    >
      <img
        src={getLogoSrc()}
        alt={getAltText()}
        style={{
          height: sizeConfig[size].height,
          width: 'auto',
        }}
        className='object-contain'
      />
    </div>
  )
}

// Logo component with design system token integration
Logo.displayName = 'Logo'

// Export individual logo variants for convenience
export const LogoFull = (props: Omit<LogoProps, 'type'>) => (
  <Logo type='full' {...props} />
)

export const LogoMark = (props: Omit<LogoProps, 'type'>) => (
  <Logo type='mark' {...props} />
)
