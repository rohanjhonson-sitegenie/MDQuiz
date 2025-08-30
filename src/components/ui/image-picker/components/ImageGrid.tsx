import React, { useCallback, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ImageData } from '../types'
import { getGridColumns } from '../utils/image-utils'
import { ImageThumbnail } from './ImageThumbnail'

interface ImageGridProps {
  images: ImageData[]
  selectedImages: ImageData[]
  onSelect: (image: ImageData) => void
  loading?: boolean
  loadMore?: () => void
  hasMore?: boolean
  className?: string
  emptyMessage?: string
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  selectedImages,
  onSelect,
  loading = false,
  loadMore,
  hasMore = false,
  className,
  emptyMessage = 'No images found',
}) => {
  const parentRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = React.useState(getGridColumns())

  // Update columns on resize
  useEffect(() => {
    const handleResize = () => {
      setColumns(getGridColumns())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!parentRef.current || !loadMore || !hasMore || loading) return

    const { scrollTop, scrollHeight, clientHeight } = parentRef.current
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMore()
    }
  }, [loadMore, hasMore, loading])

  useEffect(() => {
    const element = parentRef.current
    if (!element) return

    element.addEventListener('scroll', handleScroll)
    return () => element.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const isSelected = (image: ImageData) => {
    return selectedImages.some((img) => img.id === image.id)
  }

  if (images.length === 0 && !loading) {
    return (
      <div className='text-muted-foreground flex h-64 items-center justify-center'>
        {emptyMessage}
      </div>
    )
  }

  return (
    <div ref={parentRef} className={cn('h-full overflow-auto p-4', className)}>
      <div
        className={cn(
          'grid gap-4',
          columns === 2 && 'grid-cols-2',
          columns === 3 && 'grid-cols-3',
          columns === 4 && 'grid-cols-4'
        )}
      >
        {images.map((image) => (
          <ImageThumbnail
            key={image.id}
            image={image}
            selected={isSelected(image)}
            onSelect={onSelect}
          />
        ))}
      </div>

      {loading && (
        <div className='flex justify-center p-4'>
          <Loader2 className='h-6 w-6 animate-spin' />
        </div>
      )}
    </div>
  )
}
