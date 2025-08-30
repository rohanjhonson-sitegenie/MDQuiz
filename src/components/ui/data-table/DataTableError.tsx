import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DataTableErrorProps {
  error: Error
  onRetry?: () => void
}

export function DataTableError({ error, onRetry }: DataTableErrorProps) {
  return (
    <div className='border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center space-y-4 rounded-md border p-8'>
      <AlertCircle className='text-destructive h-10 w-10' />
      <div className='text-center'>
        <h3 className='text-lg font-semibold'>Error loading data</h3>
        <p className='text-muted-foreground text-sm'>
          {error.message || 'An unexpected error occurred'}
        </p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant='outline' size='sm'>
          Try again
        </Button>
      )}
    </div>
  )
}
