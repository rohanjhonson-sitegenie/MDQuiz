import React from 'react'
import { Link } from '@tanstack/react-router'
import type { BlogListItem } from '@/types/app.types'
import { CalendarIcon, ClockIcon, UserIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { formatBlogDate } from '../lib/blog-utils'

interface BlogCardProps {
  post: BlogListItem
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <Card className='group h-full overflow-hidden transition-shadow hover:shadow-lg'>
      <Link
        to='/blogs/$slug'
        params={{ slug: post.slug }}
        className='block h-full'
      >
        {post.featuredImage && (
          <div className='-mx-6 -mt-6 mb-6 aspect-[16/9] overflow-hidden rounded-t-xl'>
            <OptimizedImage
              path={post.featuredImage}
              alt={post.title}
              context={{ type: 'card', priority: 'normal' }}
              className='h-full w-full object-cover transition-transform group-hover:scale-105'
            />
          </div>
        )}

        <CardHeader className={!post.featuredImage ? 'pb-3' : ''}>
          <CardTitle className='group-hover:text-primary line-clamp-2 text-xl'>
            {post.title}
          </CardTitle>
          {post.excerpt && (
            <CardDescription className='line-clamp-3'>
              {post.excerpt}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='flex flex-wrap gap-2'>
            {post.tags.map((tag) => (
              <Badge key={tag.id} variant='secondary' className='text-xs'>
                {tag.name}
              </Badge>
            ))}
          </div>

          <div className='text-muted-foreground flex items-center gap-4 text-sm'>
            <div className='flex items-center gap-1'>
              <UserIcon className='h-3 w-3' />
              <span>{post.author}</span>
            </div>
            <div className='flex items-center gap-1'>
              <CalendarIcon className='h-3 w-3' />
              <span>{formatBlogDate(post.publishedAt)}</span>
            </div>
            {post.readingTime && (
              <div className='flex items-center gap-1'>
                <ClockIcon className='h-3 w-3' />
                <span>{post.readingTime} min read</span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
