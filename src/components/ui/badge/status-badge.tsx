import { Circle, CircleCheck, CircleX, UserPlus, Clock } from 'lucide-react'
import { Badge, type BadgeProps } from './badge'

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'suspended' | 'invited' | 'pending'
  showIcon?: boolean
}

const statusConfig = {
  active: {
    variant: 'success' as const,
    icon: CircleCheck,
    label: 'Active',
  },
  inactive: {
    variant: 'neutral' as const,
    icon: Circle,
    label: 'Inactive',
  },
  suspended: {
    variant: 'error' as const,
    icon: CircleX,
    label: 'Suspended',
  },
  invited: {
    variant: 'informative' as const,
    icon: UserPlus,
    label: 'Invited',
  },
  pending: {
    variant: 'warning' as const,
    icon: Clock,
    label: 'Pending',
  },
}

export function StatusBadge({
  status,
  showIcon = true,
  children,
  ...props
}: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      icon={showIcon ? config.icon : undefined}
      {...props}
    >
      {children || config.label}
    </Badge>
  )
}
