import React from 'react'
import { CopyIcon, CheckIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export const CopyButton: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (_error) {
      toast.error('Failed to copy code')
    }
  }

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={handleCopy}
      className='h-8 w-8 p-0 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-800/80 hover:text-zinc-100'
    >
      {copied ? (
        <CheckIcon className='h-4 w-4' />
      ) : (
        <CopyIcon className='h-4 w-4' />
      )}
    </Button>
  )
}
