import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeGroupProps extends React.ComponentProps<'div'> {
  gap?: 'sm' | 'md' | 'lg'
  wrap?: boolean
  max?: number
}

const gapClasses = {
  sm: 'gap-1',
  md: 'gap-2',
  lg: 'gap-3',
}

export function BadgeGroup({
  gap = 'md',
  wrap = true,
  max,
  className,
  children,
  ...props
}: BadgeGroupProps) {
  const childrenArray = React.Children.toArray(children)
  const visibleChildren = max ? childrenArray.slice(0, max) : childrenArray
  const remainingCount =
    max && childrenArray.length > max ? childrenArray.length - max : 0

  return (
    <div
      className={cn(
        'inline-flex items-center',
        gapClasses[gap],
        wrap && 'flex-wrap',
        className
      )}
      {...props}
    >
      {visibleChildren}
      {remainingCount > 0 && (
        <span className='text-muted-foreground text-xs'>
          +{remainingCount} more
        </span>
      )}
    </div>
  )
}
