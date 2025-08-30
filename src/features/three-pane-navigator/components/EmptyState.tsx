import { cn } from '@/lib/utils'

interface EmptyStateProps {
  message: string
  className?: string
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex h-full items-center justify-center p-8 text-center',
        className
      )}
    >
      <div>
        <p className='text-muted-foreground'>{message}</p>
      </div>
    </div>
  )
}
