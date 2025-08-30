import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CodePreviewProps {
  code: string
  language?: string
}

export function CodePreview({ code, language = 'tsx' }: CodePreviewProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className='relative overflow-hidden'>
      <div className='absolute top-2 right-2 z-10'>
        <Button
          size='sm'
          variant='ghost'
          onClick={copyToClipboard}
          className='h-8 w-8 p-0'
        >
          {copied ? (
            <Check className='h-4 w-4 text-green-500' />
          ) : (
            <Copy className='h-4 w-4' />
          )}
        </Button>
      </div>
      <pre className='overflow-x-auto p-4'>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </Card>
  )
}
