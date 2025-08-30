import React from 'react'

// Lazy load the heavy markdown processing component
const MarkdownContent = React.lazy(() =>
  import('./markdown-content').then((module) => ({
    default: module.MarkdownContent,
  }))
)

interface LazyMarkdownContentProps {
  content: string
  className?: string
  components?: Record<string, React.ComponentType>
}

export const LazyMarkdownContent: React.FC<LazyMarkdownContentProps> = (
  props
) => {
  return <MarkdownContent {...props} />
}
