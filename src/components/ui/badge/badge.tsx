import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-all duration-200 focus-visible:ring-ring/50 focus-visible:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90',
        outline:
          'border-transparent border-border bg-transparent text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        informative:
          'border-transparent bg-informative text-informative-foreground [a&]:hover:bg-informative/90',
        success:
          'border-transparent bg-success text-success-foreground [a&]:hover:bg-success/90',
        warning:
          'border-transparent bg-warning text-warning-foreground [a&]:hover:bg-warning/90',
        error:
          'border-transparent bg-error text-error-foreground [a&]:hover:bg-error/90',
        neutral:
          'border-transparent bg-neutral text-neutral-foreground [a&]:hover:bg-neutral/90',
        brand:
          'border-transparent bg-brand text-brand-foreground [a&]:hover:bg-brand/90',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-[10px] [&>svg]:size-2.5',
        md: 'px-2 py-0.5 text-xs [&>svg]:size-3',
        lg: 'px-2.5 py-1 text-sm [&>svg]:size-3.5',
        dot: 'size-2 p-0 border-0',
        microdot: 'size-1.5 p-0 border-0',
      },
      emphasis: {
        heavy: '',
        medium: '',
        light: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      emphasis: 'heavy',
    },
    compoundVariants: [
      // Medium emphasis variants
      {
        emphasis: 'medium',
        variant: 'default',
        className: 'bg-primary/80 hover:bg-primary/70',
      },
      {
        emphasis: 'medium',
        variant: 'secondary',
        className: 'bg-secondary/80 hover:bg-secondary/70',
      },
      {
        emphasis: 'medium',
        variant: 'destructive',
        className: 'bg-destructive/80 hover:bg-destructive/70',
      },
      {
        emphasis: 'medium',
        variant: 'informative',
        className: 'bg-informative/80 hover:bg-informative/70',
      },
      {
        emphasis: 'medium',
        variant: 'success',
        className: 'bg-success/80 hover:bg-success/70',
      },
      {
        emphasis: 'medium',
        variant: 'warning',
        className: 'bg-warning/80 hover:bg-warning/70',
      },
      {
        emphasis: 'medium',
        variant: 'error',
        className: 'bg-error/80 hover:bg-error/70',
      },
      {
        emphasis: 'medium',
        variant: 'neutral',
        className: 'bg-neutral/80 hover:bg-neutral/70',
      },
      {
        emphasis: 'medium',
        variant: 'brand',
        className: 'bg-brand/80 hover:bg-brand/70',
      },
      // Light emphasis variants
      {
        emphasis: 'light',
        variant: 'default',
        className:
          'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/50',
      },
      {
        emphasis: 'light',
        variant: 'secondary',
        className:
          'bg-muted text-foreground hover:bg-muted/80 border border-border',
      },
      {
        emphasis: 'light',
        variant: 'destructive',
        className:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/50',
      },
      {
        emphasis: 'light',
        variant: 'informative',
        className:
          'bg-informative/10 text-informative hover:bg-informative/20 border border-informative/50',
      },
      {
        emphasis: 'light',
        variant: 'success',
        className:
          'bg-success/10 text-success hover:bg-success/20 border border-success/50',
      },
      {
        emphasis: 'light',
        variant: 'warning',
        className:
          'bg-warning/10 text-warning hover:bg-warning/20 border border-warning/50',
      },
      {
        emphasis: 'light',
        variant: 'error',
        className:
          'bg-error/10 text-error hover:bg-error/20 border border-error/50',
      },
      {
        emphasis: 'light',
        variant: 'neutral',
        className:
          'bg-neutral/10 text-neutral hover:bg-neutral/20 border border-neutral/50',
      },
      {
        emphasis: 'light',
        variant: 'brand',
        className:
          'bg-brand/10 text-brand hover:bg-brand/20 border border-brand/50',
      },
      // Dot sizes don't show text
      {
        size: ['dot', 'microdot'],
        className: '[&>*:not(svg)]:sr-only',
      },
    ],
  }
)

export interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
  icon?: React.ComponentType<{ className?: string }>
  iconPosition?: 'left' | 'right'
  removable?: boolean
  onRemove?: () => void
  pulse?: boolean
  shimmer?: boolean
}

function Badge({
  className,
  variant,
  size,
  emphasis,
  asChild = false,
  icon: Icon,
  iconPosition = 'left',
  removable,
  onRemove,
  pulse,
  shimmer,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span'

  const animationClasses = cn(
    pulse && 'animate-pulse',
    shimmer &&
      'animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%]'
  )

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className='shrink-0' />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className='shrink-0' />}
      {removable && (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          className='-mr-0.5 ml-0.5 inline-flex size-3.5 items-center justify-center rounded-sm hover:bg-black/10 dark:hover:bg-white/10'
          aria-label='Remove'
        >
          <X className='size-2.5' />
        </button>
      )}
    </>
  )

  return (
    <Comp
      data-slot='badge'
      className={cn(
        badgeVariants({ variant, size, emphasis }),
        animationClasses,
        className
      )}
      {...props}
    >
      {content}
    </Comp>
  )
}

// Animation keyframes
const style = document.createElement('style')
style.textContent = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`
document.head.appendChild(style)

export { Badge, badgeVariants }
