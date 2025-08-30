import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
      <div
        data-slot='skeleton'
        className={cn(
          'relative overflow-hidden rounded-md bg-gray-200 dark:bg-gray-800',
          className
        )}
        {...props}
      >
        <div
          className='absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent'
          style={{
            transform: 'translateX(-100%)',
            animation: 'skeleton-shimmer 2s ease-in-out infinite',
          }}
        />
      </div>
    </>
  )
}

export { Skeleton }
