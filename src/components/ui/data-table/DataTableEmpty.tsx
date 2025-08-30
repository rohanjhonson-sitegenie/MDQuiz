import { FileX } from 'lucide-react'

export function DataTableEmpty() {
  return (
    <div className='flex flex-col items-center justify-center space-y-4 rounded-md border border-dashed p-8'>
      <FileX className='text-muted-foreground/50 h-10 w-10' />
      <div className='text-center'>
        <h3 className='text-lg font-semibold'>No data found</h3>
        <p className='text-muted-foreground text-sm'>
          There are no records to display.
        </p>
      </div>
    </div>
  )
}
