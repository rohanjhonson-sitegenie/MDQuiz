import { type VariantProps } from 'class-variance-authority'
import { type badgeVariants } from './badge'

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'informative'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'brand'
export type BadgeSize = 'sm' | 'md' | 'lg' | 'dot' | 'microdot'
export type BadgeEmphasis = 'heavy' | 'medium' | 'light'

export interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {
  variant?: BadgeVariant
  size?: BadgeSize
  emphasis?: BadgeEmphasis
  asChild?: boolean
  icon?: React.ComponentType<{ className?: string }>
  iconPosition?: 'left' | 'right'
  removable?: boolean
  onRemove?: () => void
  pulse?: boolean
  shimmer?: boolean
}

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'suspended' | 'invited' | 'pending'
  showIcon?: boolean
}

export interface NotificationBadgeProps extends Omit<BadgeProps, 'children'> {
  count: number
  max?: number
  dot?: boolean
  showZero?: boolean
}

export interface EventBadgeProps extends Omit<BadgeProps, 'variant'> {
  type:
    | 'class'
    | 'meeting'
    | 'appointment'
    | 'deadline'
    | 'tournament'
    | 'holiday'
    | 'personal'
    | 'scrimmage'
  status?: 'confirmed' | 'tentative' | 'cancelled' | 'completed' | 'pending'
}

export interface BadgeGroupProps extends React.ComponentProps<'div'> {
  gap?: 'sm' | 'md' | 'lg'
  wrap?: boolean
  max?: number
}
