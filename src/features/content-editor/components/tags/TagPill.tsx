import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface TagPillProps {
  tag: string
  onRemove?: (tag: string) => void
  className?: string
}

export function TagPill({ tag, onRemove, className }: TagPillProps) {
  return (
    <Badge
      variant='secondary'
      className={cn(
        'gap-1 pr-1.5',
        onRemove && 'hover:bg-secondary/80',
        className
      )}
    >
      <span>{tag}</span>
      {onRemove && (
        <button
          type='button'
          onClick={() => onRemove(tag)}
          className='hover:bg-secondary-foreground/20 ml-1 rounded-sm p-0.5'
          aria-label={`Remove ${tag} tag`}
        >
          <X className='h-3 w-3' />
        </button>
      )}
    </Badge>
  )
}
