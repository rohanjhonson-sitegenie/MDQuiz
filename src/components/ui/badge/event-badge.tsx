import {
  Calendar,
  Users,
  User,
  Clock,
  Trophy,
  Palmtree,
  Heart,
  Swords,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge, type BadgeProps } from './badge'

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

const eventTypeConfig = {
  class: {
    variant: 'informative' as const,
    icon: Calendar,
    label: 'Class',
  },
  meeting: {
    variant: 'neutral' as const,
    icon: Users,
    label: 'Meeting',
  },
  appointment: {
    variant: 'brand' as const,
    icon: User,
    label: 'Appointment',
  },
  deadline: {
    variant: 'error' as const,
    icon: Clock,
    label: 'Deadline',
  },
  tournament: {
    variant: 'warning' as const,
    icon: Trophy,
    label: 'Tournament',
  },
  holiday: {
    variant: 'success' as const,
    icon: Palmtree,
    label: 'Holiday',
  },
  personal: {
    variant: 'secondary' as const,
    icon: Heart,
    label: 'Personal',
  },
  scrimmage: {
    variant: 'informative' as const,
    icon: Swords,
    label: 'Scrimmage',
  },
}

const statusStyles = {
  confirmed: '',
  tentative: 'border-dashed',
  cancelled: 'line-through opacity-60',
  completed: 'opacity-60',
  pending: 'animate-pulse',
}

export function EventBadge({
  type,
  status = 'confirmed',
  className,
  children,
  ...props
}: EventBadgeProps) {
  const config = eventTypeConfig[type]
  const statusStyle = statusStyles[status]

  return (
    <Badge
      variant={config.variant}
      icon={config.icon}
      className={cn(statusStyle, className)}
      {...props}
    >
      {children || config.label}
    </Badge>
  )
}
