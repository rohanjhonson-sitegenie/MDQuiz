import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface VideoSkeletonProps {
  className?: string
}

export function VideoSkeleton({ className }: VideoSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <Skeleton className='aspect-video rounded-lg' />
      <div className='space-y-2 px-1'>
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-4 w-1/2' />
      </div>
    </div>
  )
}
