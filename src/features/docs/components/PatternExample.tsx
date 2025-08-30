import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PatternExampleProps {
  title: string
  description?: string
  children: React.ReactNode
  code: string
  language?: string
  className?: string
}

export function PatternExample({
  title,
  description,
  children,
  code,
  language = 'tsx',
  className,
}: PatternExampleProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className={`overflow-hidden ${className || ''}`}>
      <div className='border-b p-4'>
        <h3 className='text-lg font-semibold'>{title}</h3>
        {description && (
          <p className='text-muted-foreground mt-1 text-sm'>{description}</p>
        )}
      </div>
      <Tabs defaultValue='preview' className='w-full'>
        <div className='flex items-center justify-between border-b px-4'>
          <TabsList className='h-auto rounded-none border-0 bg-transparent p-0'>
            <TabsTrigger
              value='preview'
              className='data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 pt-2 pb-2'
            >
              Preview
            </TabsTrigger>
            <TabsTrigger
              value='code'
              className='data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 pt-2 pb-2'
            >
              Code
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value='preview' className='p-6'>
          <div className='flex items-center justify-center'>{children}</div>
        </TabsContent>
        <TabsContent value='code' className='relative p-0'>
          <Button
            size='sm'
            variant='ghost'
            onClick={handleCopy}
            className='absolute top-4 right-4 z-10'
          >
            {copied ? (
              <Check className='h-4 w-4' />
            ) : (
              <Copy className='h-4 w-4' />
            )}
          </Button>
          <pre className='overflow-x-auto p-6'>
            <code className={`language-${language}`}>{code}</code>
          </pre>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
