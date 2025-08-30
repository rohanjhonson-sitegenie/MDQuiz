import React from 'react'
import { MarkdownContentWrapper } from '@/features/blog/api'

interface MarkdownRendererProps {
  markdown: string
  className?: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  markdown,
  className,
}) => {
  return (
    <div className={className}>
      <MarkdownContentWrapper
        content={markdown}
        components={{
          // Override pre to remove copy button in editor preview
          pre: ({
            children,
            ...props
          }: React.ComponentPropsWithoutRef<'pre'>) => (
            <pre
              className='bg-muted overflow-x-auto rounded-lg border p-4 font-mono text-sm'
              {...props}
            >
              {children}
            </pre>
          ),
        }}
      />
    </div>
  )
}
