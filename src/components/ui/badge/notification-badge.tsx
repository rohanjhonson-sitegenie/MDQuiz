import { cn } from '@/lib/utils'
import { Badge, type BadgeProps } from './badge'

export interface NotificationBadgeProps extends Omit<BadgeProps, 'children'> {
  count: number
  max?: number
  dot?: boolean
  showZero?: boolean
}

export function NotificationBadge({
  count,
  max = 99,
  dot = false,
  showZero = false,
  className,
  ...props
}: NotificationBadgeProps) {
  if (!showZero && count === 0 && !dot) {
    return null
  }

  if (dot) {
    return (
      <Badge
        size='dot'
        variant='error'
        emphasis='heavy'
        className={cn('absolute -top-1 -right-1', className)}
        aria-label={`${count} notifications`}
        {...props}
      />
    )
  }

  const displayCount = count > max ? `${max}+` : count.toString()

  return (
    <Badge
      size='sm'
      variant='error'
      emphasis='heavy'
      className={cn('absolute -top-2 -right-2 min-w-[18px] px-1', className)}
      {...props}
    >
      {displayCount}
    </Badge>
  )
}
