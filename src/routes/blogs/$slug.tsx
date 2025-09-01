import { createFileRoute, notFound } from '@tanstack/react-router'
import type { NavigationItem } from '@/types/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { PublicNavbar } from '@/components/layout/public-navbar'
import { BlogErrorBoundary } from '@/features/blog/components/blog-error-boundary'
import { BlogPost } from '@/features/blog/components/blog-post'
import {
  useBlogPost,
  useRelatedPosts,
} from '@/features/blog/hooks/use-blog-posts'

export const Route = createFileRoute('/blogs/$slug')({
  component: BlogPostPage,
})

function BlogPostPage() {
  const { slug } = Route.useParams()

  const navigation: NavigationItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blogs' },
    { name: 'Badges', href: '/design-system/badges' },
  ]

  // Get complete blog post from database
  const { data: blogPost, isLoading: isLoadingContent } = useBlogPost(slug)

  // Get related posts
  const { data: relatedPosts } = useRelatedPosts(blogPost?.id || '', 3)

  // Set document title and meta tags
  const pageTitle = blogPost?.title || 'Loading...'
  const pageDescription = blogPost?.excerpt || ''

  if (typeof document !== 'undefined' && blogPost) {
    document.title = `${pageTitle} - Blog`

    // Update meta tags
    const updateMetaTag = (property: string, content: string) => {
      let tag = document.querySelector(
        `meta[property="${property}"]`
      ) as HTMLMetaElement
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }
      tag.content = content
    }

    updateMetaTag('og:title', pageTitle)
    updateMetaTag('og:description', pageDescription)
    updateMetaTag('og:type', 'article')
    updateMetaTag('og:url', window.location.href)
    if (blogPost.featured_image) {
      updateMetaTag('og:image', blogPost.featured_image || '')
    }

    // Update description meta tag
    let descTag = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement
    if (!descTag) {
      descTag = document.createElement('meta')
      descTag.setAttribute('name', 'description')
      document.head.appendChild(descTag)
    }
    descTag.content = pageDescription
  }

  if (isLoadingContent) {
    return (
      <>
        <PublicNavbar items={navigation} />
        <BlogErrorBoundary>
          <BlogPostSkeleton />
        </BlogErrorBoundary>
      </>
    )
  }

  if (!blogPost) {
    throw notFound()
  }

  return (
    <>
      <PublicNavbar items={navigation} />
      <BlogErrorBoundary>
        <BlogPost post={blogPost} relatedPosts={relatedPosts} />
      </BlogErrorBoundary>
    </>
  )
}

function BlogPostSkeleton() {
  return (
    <div className='mx-auto max-w-7xl px-4 py-8'>
      <Skeleton className='mb-8 h-6 w-32' />

      <div className='mb-8 space-y-4'>
        <Skeleton className='h-12 w-3/4' />
        <Skeleton className='h-6 w-full' />
        <div className='flex gap-4'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-4 w-20' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-6 w-16' />
          <Skeleton className='h-6 w-16' />
        </div>
      </div>

      <Skeleton className='mb-8 aspect-video w-full' />

      <div className='space-y-4'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-5/6' />
      </div>
    </div>
  )
}
