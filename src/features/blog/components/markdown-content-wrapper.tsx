import React, { Suspense } from 'react'
import { IconLoader } from '@tabler/icons-react'
import { LazyMarkdownContent } from './lazy-markdown-content'

interface MarkdownContentWrapperProps {
  content: string
  className?: string
  components?: Record<string, React.ComponentType>
  fallback?: React.ReactElement
}

const DefaultLoadingFallback = () => (
  <div className='flex items-center justify-center p-8'>
    <IconLoader className='text-muted-foreground h-6 w-6 animate-spin' />
    <span className='text-muted-foreground ml-2 text-sm'>
      Loading content...
    </span>
  </div>
)

export const MarkdownContentWrapper: React.FC<MarkdownContentWrapperProps> = ({
  content,
  className,
  components,
  fallback = <DefaultLoadingFallback />,
}) => {
  return (
    <Suspense fallback={fallback}>
      <LazyMarkdownContent
        content={content}
        className={className}
        components={components}
      />
    </Suspense>
  )
}
