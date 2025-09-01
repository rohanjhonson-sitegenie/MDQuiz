import React, { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { BlogPost as BlogPostType, BlogListItem } from '@/types/app.types'
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  TwitterIcon,
  LinkedinIcon,
  LinkIcon,
  ArrowLeftIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { Separator } from '@/components/ui/separator'
import { formatBlogDate } from '../lib/blog-utils'
import { TableOfContents } from './markdown-components'
import { MarkdownContentWrapper } from './markdown-content-wrapper'

interface BlogPostProps {
  post: BlogPostType
  relatedPosts?: BlogListItem[]
}

export const BlogPost: React.FC<BlogPostProps> = ({ post, relatedPosts }) => {
  const [headings, setHeadings] = useState<
    Array<{ id: string; text: string; level: number }>
  >([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Helper function to generate URL-friendly IDs from heading text (same as in markdown-components-config)
    const generateId = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim()
    }

    // Extract headings for table of contents
    const headingElements = document.querySelectorAll('h2, h3')
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

    // Setup scroll progress
    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const scrollPosition = window.scrollY
      const progress = (scrollPosition / scrollHeight) * 100
      setProgress(Math.min(progress, 100))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [post])

  const handleShare = async (platform: 'twitter' | 'linkedin' | 'copy') => {
    const url = window.location.href
    const title = post.title

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          '_blank'
        )
        break
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank'
        )
        break
      case 'copy':
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!')
        break
    }
  }

  return (
    <article className='relative'>
      {/* Reading progress bar */}
      <div className='bg-muted fixed top-0 left-0 z-50 h-1 w-full'>
        <div
          className='bg-primary h-full transition-all duration-150'
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className='mx-auto max-w-7xl px-4 py-8'>
        {/* Back button */}
        <Link
          to='/blogs'
          className='text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm'
        >
          <ArrowLeftIcon className='h-4 w-4' />
          Back to blog
        </Link>

        {/* Header */}
        <header className='mb-8 space-y-4'>
          <h1 className='text-4xl font-bold tracking-tight lg:text-5xl'>
            {post.title}
          </h1>

          {post.excerpt && (
            <p className='text-muted-foreground text-xl'>{post.excerpt}</p>
          )}

          <div className='text-muted-foreground flex flex-wrap items-center gap-4 text-sm'>
            <div className='flex items-center gap-1'>
              <UserIcon className='h-4 w-4' />
              <span>{post.author}</span>
            </div>
            <div className='flex items-center gap-1'>
              <CalendarIcon className='h-4 w-4' />
              <span>{formatBlogDate(post.published_at || new Date())}</span>
            </div>
            {post.reading_time && (
              <div className='flex items-center gap-1'>
                <ClockIcon className='h-4 w-4' />
                <span>{post.reading_time} min read</span>
              </div>
            )}
          </div>

          {/* Tags section removed - tags should be loaded separately as they're not part of the core BlogPost entity */}
        </header>

        {post.featured_image && (
          <div className='mb-8 aspect-[16/9] overflow-hidden rounded-lg shadow-lg'>
            <OptimizedImage
              path={post.featured_image as string}
              alt={post.title}
              context={{ type: 'hero', priority: 'high' }}
              className='h-full w-full object-cover'
            />
          </div>
        )}

        {/* Main content with sidebar */}
        <div className='flex gap-8'>
          <div className='flex-1'>
            <div className='prose prose-neutral dark:prose-invert max-w-none'>
              <MarkdownContentWrapper content={post.content || ''} />
            </div>

            <Separator className='my-8' />

            {/* Share buttons */}
            <div className='flex items-center gap-4'>
              <span className='text-sm font-medium'>Share this post:</span>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleShare('twitter')}
                >
                  <TwitterIcon className='h-4 w-4' />
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleShare('linkedin')}
                >
                  <LinkedinIcon className='h-4 w-4' />
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleShare('copy')}
                >
                  <LinkIcon className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {/* Related posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <>
                <Separator className='my-8' />
                <section>
                  <h2 className='mb-4 text-2xl font-semibold'>Related Posts</h2>
                  <div className='grid gap-4 sm:grid-cols-2'>
                    {relatedPosts.map((related) => (
                      <Link
                        key={related.id}
                        to='/blogs/$slug'
                        params={{ slug: related.slug }}
                        className='group hover:bg-accent rounded-lg border p-4 transition-colors'
                      >
                        <h3 className='group-hover:text-primary mb-2 font-medium'>
                          {related.title}
                        </h3>
                        {related.excerpt && (
                          <p className='text-muted-foreground line-clamp-2 text-sm'>
                            {related.excerpt}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>

          {/* Sidebar with table of contents */}
          {headings.length > 0 && (
            <aside className='sticky top-20 hidden h-fit w-64 lg:block'>
              <TableOfContents headings={headings} />
            </aside>
          )}
        </div>
      </div>
    </article>
  )
}
