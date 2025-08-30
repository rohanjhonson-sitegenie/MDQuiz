import { Badge, type BadgeProps } from './badge'

export interface RemovableBadgeProps extends Omit<BadgeProps, 'removable'> {
  onRemove: () => void
}

export function RemovableBadge({ onRemove, ...props }: RemovableBadgeProps) {
  return <Badge removable onRemove={onRemove} {...props} />
}
