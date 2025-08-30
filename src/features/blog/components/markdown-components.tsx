import React from 'react'
import { Link } from '@tanstack/react-router'
import {
  InfoIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Code block component with syntax highlighting
export const CodeBlock: React.FC<{
  children?: React.ReactNode
  className?: string
  inline?: boolean
}> = ({ children, className, inline }) => {
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''

  if (inline) {
    return (
      <code className='bg-muted rounded px-1.5 py-0.5 font-mono text-sm'>
        {children}
      </code>
    )
  }

  const code = String(children).replace(/\n$/, '')

  return (
    <div className='group relative my-6'>
      {language && (
        <div className='bg-muted text-muted-foreground absolute top-2 right-2 z-10 rounded px-2 py-1 text-xs'>
          {language}
        </div>
      )}
      <div className='bg-muted/30 rounded-lg border dark:bg-zinc-950'>
        <pre className='overflow-x-auto p-4'>
          <code
            className={cn(
              'font-mono text-sm',
              language && `language-${language}`
            )}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}

// Image component with lazy loading
export const BlogImage: React.FC<{ src?: string; alt?: string }> = ({
  src,
  alt,
}) => {
  if (!src) return null

  return (
    <figure className='my-8'>
      <img
        src={src}
        alt={alt || ''}
        loading='lazy'
        className='rounded-lg shadow-lg'
      />
      {alt && (
        <figcaption className='text-muted-foreground mt-2 text-center text-sm'>
          {alt}
        </figcaption>
      )}
    </figure>
  )
}

// Link component for internal/external links
export const BlogLink: React.FC<{
  href?: string
  children?: React.ReactNode
}> = ({ href, children }) => {
  if (!href) return <>{children}</>

  const isInternal = href.startsWith('/') || href.startsWith('#')

  if (isInternal) {
    return (
      <Link
        to={href}
        className='text-primary underline-offset-4 hover:underline'
      >
        {children}
      </Link>
    )
  }

  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='text-primary underline-offset-4 hover:underline'
    >
      {children}
      <span className='sr-only'>(opens in new tab)</span>
    </a>
  )
}

// Callout/Alert component
export const Callout: React.FC<{
  type?: 'info' | 'warning' | 'success' | 'error'
  title?: string
  children?: React.ReactNode
}> = ({ type = 'info', title, children }) => {
  const icons = {
    info: <InfoIcon className='h-4 w-4' />,
    warning: <AlertCircleIcon className='h-4 w-4' />,
    success: <CheckCircleIcon className='h-4 w-4' />,
    error: <XCircleIcon className='h-4 w-4' />,
  }

  const variants = {
    info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
    warning:
      'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
    success:
      'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
    error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
  }

  return (
    <Alert className={cn('my-6', variants[type])}>
      {icons[type]}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}

// Table of contents component
export const TableOfContents: React.FC<{
  headings: Array<{ id: string; text: string; level: number }>
}> = ({ headings }) => {
  return (
    <nav className='space-y-2'>
      <h3 className='font-semibold'>On this page</h3>
      <ul className='space-y-1 text-sm'>
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
          >
            <a
              href={`#${heading.id}`}
              className='text-muted-foreground hover:text-foreground'
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
