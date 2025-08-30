import React from 'react'
import { Link } from '@tanstack/react-router'
import type { Components } from 'react-markdown'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { CopyButton } from './copy-button'
import { VideoEmbed } from './video-embed'
import { parseVideoUrl } from './video-embed-utils'

// Helper function to generate URL-friendly IDs from heading text
const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

export const markdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1
      className='mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => {
    const id = generateId(
      typeof children === 'string' ? children : children?.toString() || ''
    )
    return (
      <h2
        id={id}
        className='mt-8 mb-4 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0'
        {...props}
      >
        {children}
      </h2>
    )
  },
  h3: ({ children, ...props }) => {
    const id = generateId(
      typeof children === 'string' ? children : children?.toString() || ''
    )
    return (
      <h3
        id={id}
        className='mt-6 mb-3 scroll-m-20 text-2xl font-semibold tracking-tight'
        {...props}
      >
        {children}
      </h3>
    )
  },
  h4: ({ children, ...props }) => (
    <h4
      className='mt-4 mb-2 scroll-m-20 text-xl font-semibold tracking-tight'
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5
      className='mt-3 mb-2 scroll-m-20 text-lg font-semibold tracking-tight'
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6
      className='mt-3 mb-2 scroll-m-20 text-base font-semibold tracking-tight'
      {...props}
    >
      {children}
    </h6>
  ),
  p: ({ children, ...props }) => {
    // Check if this paragraph contains only a video embed
    // This happens when markdown like ![title](youtube:id) is on its own line
    const childArray = React.Children.toArray(children)

    // Check for single child that might be an image/video
    if (childArray.length === 1) {
      const child = childArray[0]

      // Check if the child is already a VideoEmbed component
      if (React.isValidElement(child) && child.type === VideoEmbed) {
        return <>{child}</>
      }

      // The child might be the img component with video URL
      if (React.isValidElement(child)) {
        const props = child.props as Record<string, unknown>
        if (
          props &&
          typeof props === 'object' &&
          'src' in props &&
          typeof props.src === 'string'
        ) {
          const videoInfo = parseVideoUrl(props.src)
          if (videoInfo.provider && videoInfo.videoId) {
            // Render video directly without paragraph wrapper
            return (
              <VideoEmbed
                provider={videoInfo.provider}
                videoId={videoInfo.videoId}
                title={props.alt as string | undefined}
              />
            )
          }
        }
      }
    }

    // Check if any child in the paragraph is a video (for inline videos)
    let hasVideo = false
    React.Children.forEach(children, (child) => {
      // Check if child is already a VideoEmbed component
      if (React.isValidElement(child)) {
        if (child.type === VideoEmbed) {
          hasVideo = true
          return
        }

        // Check if it's an img element that will render a video
        // Need to check both direct img elements and our custom img component
        if (child.type === 'img' || child.type === markdownComponents.img) {
          const props = child.props as Record<string, unknown>
          // Check the actual src prop
          if (props.src && typeof props.src === 'string') {
            // Check if it's our data URL format from the remark plugin
            if (props.src.startsWith('data:video/x-custom,')) {
              hasVideo = true
              return
            }

            // Also try parsing the src directly
            const videoInfo = parseVideoUrl(props.src)
            if (videoInfo.provider && videoInfo.videoId) {
              hasVideo = true
              return
            }
          }

          // Also check data attributes from our remark plugin
          const dataVideoUrl = props['data-video-url']
          if (dataVideoUrl) {
            hasVideo = true
            return
          }
        }
      }
    })

    // If paragraph contains inline video, render without wrapper to avoid nesting issues
    if (hasVideo) {
      return <div className='my-6'>{children}</div>
    }

    return (
      <p className='leading-7 [&:not(:first-child)]:mt-6' {...props}>
        {children}
      </p>
    )
  },
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith('http')

    if (isExternal) {
      return (
        <a
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary hover:text-primary/80 font-medium underline underline-offset-4'
          {...props}
        >
          {children}
        </a>
      )
    }

    return (
      <Link
        to={href || '#'}
        className='text-primary hover:text-primary/80 font-medium underline underline-offset-4'
        {...props}
      >
        {children}
      </Link>
    )
  },
  ul: ({ children, ...props }) => (
    <ul className='my-6 ml-6 list-disc [&>li]:mt-2' {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className='my-6 ml-6 list-decimal [&>li]:mt-2' {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className='leading-7' {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className='mt-6 border-l-2 pl-6 italic' {...props}>
      {children}
    </blockquote>
  ),
  hr: (props) => <hr className='my-8' {...props} />,
  strong: ({ children, ...props }) => (
    <strong className='font-semibold' {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className='italic' {...props}>
      {children}
    </em>
  ),
  code: ({ children, className, ...props }) => {
    const isInline = !className?.includes('language-')
    if (isInline) {
      return (
        <code
          className='bg-muted rounded px-1.5 py-0.5 font-mono text-sm'
          {...props}
        >
          {children}
        </code>
      )
    }
    // For code blocks, let rehype-highlight handle it
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
  pre: ({ children, ...props }) => {
    // Extract language and code content
    const getLanguageAndCode = () => {
      const childProps = children as React.ReactElement
      if (React.isValidElement(children)) {
        const props = childProps.props as {
          className?: string
          children?: React.ReactNode
        }
        if (props.className) {
          const match = props.className.match(/language-(\w+)/)
          const language = match ? match[1] : null
          const code =
            typeof props.children === 'string'
              ? props.children
              : props.children?.toString() || ''
          return { language, code }
        }
      }
      return {
        language: null,
        code: typeof children === 'string' ? children : '',
      }
    }

    const { language, code } = getLanguageAndCode()

    return (
      <div className='group relative my-6'>
        <div className='rounded-lg border border-zinc-700/50 bg-zinc-950 shadow-sm'>
          {/* Top-right corner container for copy button and language badge */}
          <div className='absolute top-3 right-3 z-10 flex items-center gap-2'>
            <CopyButton code={code} />
            {language && (
              <span className='inline-flex h-8 items-center rounded-md bg-zinc-800/80 px-2 py-1 text-xs font-medium text-zinc-300 backdrop-blur-sm'>
                {language}
              </span>
            )}
          </div>
          <pre className='overflow-x-auto p-4 font-mono text-sm' {...props}>
            {children}
          </pre>
        </div>
      </div>
    )
  },
  img: ({ src, alt, width: propsWidth, height: propsHeight, ...props }) => {
    // Extract width/height from data attributes
    const dataWidth = (props as Record<string, unknown>)['data-width'] as
      | string
      | undefined
    const dataHeight = (props as Record<string, unknown>)['data-height'] as
      | string
      | undefined
    const width = dataWidth
      ? parseInt(dataWidth, 10)
      : typeof propsWidth === 'number'
        ? propsWidth
        : undefined
    const height = dataHeight
      ? parseInt(dataHeight, 10)
      : typeof propsHeight === 'number'
        ? propsHeight
        : undefined

    // Check if this is a video embed marked by our remark plugin
    const dataVideoUrl = (props as Record<string, unknown>)[
      'data-video-url'
    ] as string | undefined
    const isVideoEmbed =
      (props as Record<string, unknown>)['data-video-embed'] === 'true'

    // If it's marked as a video embed, use the data-video-url
    if (isVideoEmbed && dataVideoUrl) {
      const videoInfo = parseVideoUrl(dataVideoUrl)
      if (videoInfo.provider && videoInfo.videoId) {
        return (
          <VideoEmbed
            provider={videoInfo.provider}
            videoId={videoInfo.videoId}
            title={alt}
            width={width}
            height={height}
          />
        )
      }
    }

    // Check if this is a video embed using protocol syntax (fallback)
    const videoInfo = parseVideoUrl(src || '')

    if (videoInfo.provider && videoInfo.videoId) {
      return (
        <VideoEmbed
          provider={videoInfo.provider}
          videoId={videoInfo.videoId}
          title={alt}
          width={width}
          height={height}
        />
      )
    }

    // Regular image handling
    return (
      <OptimizedImage
        path={src || ''}
        alt={alt || ''}
        context={{ type: 'blog', priority: 'low' }}
        className='my-6 h-auto max-w-full rounded-lg shadow-md'
        width={width}
        height={height}
        {...props}
      />
    )
  },
  table: ({ children, ...props }) => (
    <div className='my-6 w-full overflow-y-auto'>
      <table className='w-full' {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className='border-b' {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody className='[&_tr:last-child]:border-0' {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className='hover:bg-muted/50 border-b transition-colors' {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th
      className='text-muted-foreground h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0'
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0' {...props}>
      {children}
    </td>
  ),
}
