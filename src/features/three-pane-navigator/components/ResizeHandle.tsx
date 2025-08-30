import { cn } from '@/lib/utils'

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void
  className?: string
}

export function ResizeHandle({ onMouseDown, className }: ResizeHandleProps) {
  return (
    <div
      className={cn(
        'bg-border/50 hover:bg-primary/30 relative w-0.5 cursor-col-resize transition-colors',
        className
      )}
      onMouseDown={onMouseDown}
    >
      <div className='absolute inset-y-0 left-1/2 w-6 -translate-x-1/2' />
    </div>
  )
}
