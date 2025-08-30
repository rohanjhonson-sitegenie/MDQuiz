import { cn } from '@/lib/utils'
import { Badge, type BadgeProps } from './badge'

export interface BadgeDotProps extends Omit<BadgeProps, 'size' | 'children'> {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  size?: 'dot' | 'microdot'
}

const positionClasses = {
  'top-right': '-right-1 -top-1',
  'top-left': '-left-1 -top-1',
  'bottom-right': '-bottom-1 -right-1',
  'bottom-left': '-bottom-1 -left-1',
}

export function BadgeDot({
  position = 'top-right',
  size = 'dot',
  className,
  ...props
}: BadgeDotProps) {
  return (
    <Badge
      size={size}
      className={cn('absolute', positionClasses[position], className)}
      aria-label='Status indicator'
      {...props}
    />
  )
}
