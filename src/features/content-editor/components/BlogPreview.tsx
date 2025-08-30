import { useEffect, useState } from 'react'
import { CalendarIcon, ClockIcon, UserIcon, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { TableOfContents } from '@/features/blog/api'
import { MarkdownContentWrapper } from '@/features/blog/api'

interface BlogPreviewProps {
  title: string
  author: string
  content: string
  draft: boolean
  tags?: string[]
  slug?: string
  excerpt?: string
  featuredImage?: string
  publishedAt?: Date
}

export function BlogPreview({
  title,
  author,
  content,
  draft,
  tags,
  slug,
  excerpt,
  featuredImage,
  publishedAt,
}: BlogPreviewProps) {
  const publicUrl = slug ? `/blogs/${slug}` : null
  const currentDate = publishedAt || new Date()

  // Calculate reading time (rough estimate: 200 words per minute)
  const wordCount = content.split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200)

  // State for table of contents
  const [headings, setHeadings] = useState<
    Array<{ id: string; text: string; level: number }>
  >([])

  useEffect(() => {
    // Helper function to generate URL-friendly IDs from heading text
    const generateId = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim()
    }

    // Extract headings for table of contents
    // We need a small delay to ensure the markdown is rendered
    const timer = setTimeout(() => {
      const headingElements = document.querySelectorAll('.prose h2, .prose h3')
      const headingData = Array.from(headingElements).map((heading, index) => {
        const text = heading.textContent || ''
        const baseId = heading.id || generateId(text)
        // Add index to ensure uniqueness
        const uniqueId = `${baseId}-${index}`
        // Update the actual heading element with the unique ID
        heading.id = uniqueId
        return {
          id: uniqueId,
          text,
          level: parseInt(heading.tagName[1]),
        }
      })
      setHeadings(headingData)
    }, 100)

    return () => clearTimeout(timer)
  }, [content])

  return (
    <div>
      {/* Public link banner */}
      {publicUrl && !draft ? (
        <div className='bg-muted/50 mb-6 flex items-center justify-between rounded-lg border p-4'>
          <span className='text-muted-foreground text-sm'>
            This post is publicly available at:
          </span>
          <Button
            variant='outline'
            size='sm'
            className='gap-2'
            type='button'
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.open(publicUrl, '_blank')
            }}
          >
            <ExternalLink className='h-4 w-4' />
            View Public Page
          </Button>
        </div>
      ) : null}

      {/* Main content with sidebar layout */}
      <div className='mx-auto max-w-7xl'>
        <div className='flex gap-8'>
          {/* Main content */}
          <div className='flex-1'>
            <article className='mx-auto max-w-4xl'>
              {/* Header */}
              <header className='mb-8 space-y-4'>
                <h1 className='text-4xl font-bold tracking-tight lg:text-5xl'>
                  {title || 'Untitled Post'}
                </h1>

                {excerpt && (
                  <p className='text-muted-foreground text-xl'>{excerpt}</p>
                )}

                <div className='text-muted-foreground flex flex-wrap items-center gap-4 text-sm'>
                  <div className='flex items-center gap-1'>
                    <UserIcon className='h-4 w-4' />
                    <span>{author || 'Unknown'}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <CalendarIcon className='h-4 w-4' />
                    <span>{currentDate.toLocaleDateString()}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <ClockIcon className='h-4 w-4' />
                    <span>{readingTime} min read</span>
                  </div>
                  {draft && (
                    <Badge variant='outline' className='text-orange-600'>
                      Draft
                    </Badge>
                  )}
                </div>

                {tags && tags.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {tags.map((tag) => (
                      <Badge key={tag} variant='secondary'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </header>

              {featuredImage && featuredImage.trim() !== '' && (
                <div className='mb-8 aspect-[16/9] overflow-hidden rounded-lg shadow-lg'>
                  <OptimizedImage
                    path={featuredImage}
                    alt={title}
                    context={{ type: 'hero', priority: 'high' }}
                    className='h-full w-full object-cover'
                  />
                </div>
              )}

              {/* Content */}
              <div className='prose prose-neutral dark:prose-invert max-w-none'>
                <MarkdownContentWrapper content={content || ''} />
              </div>
            </article>
          </div>

          {/* Sidebar with table of contents */}
          {headings.length > 0 && (
            <aside className='sticky top-20 hidden h-fit w-64 lg:block'>
              <TableOfContents headings={headings} />
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
