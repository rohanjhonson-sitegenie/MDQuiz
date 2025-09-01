import React from 'react'
import type { BlogListItem } from '@/types/app.types'
import { Skeleton } from '@/components/ui/skeleton'
import { BlogCard } from './blog-card'

interface BlogListProps {
  posts: BlogListItem[]
  loading?: boolean
}

export const BlogList: React.FC<BlogListProps> = ({ posts, loading }) => {
  if (loading) {
    return (
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {[...Array(6)].map((_, i) => (
          <BlogListSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <h3 className='mb-2 text-lg font-semibold'>No blog posts found</h3>
        <p className='text-muted-foreground'>
          Check back later for new content!
        </p>
      </div>
    )
  }

  return (
    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  )
}

const BlogListSkeleton: React.FC = () => {
  return (
    <div className='space-y-3'>
      <Skeleton className='aspect-video rounded-lg' />
      <div className='space-y-2'>
        <Skeleton className='h-6 w-3/4' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-2/3' />
      </div>
      <div className='flex gap-2'>
        <Skeleton className='h-5 w-16' />
        <Skeleton className='h-5 w-16' />
      </div>
      <div className='flex gap-4'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-4 w-16' />
      </div>
    </div>
  )
}
