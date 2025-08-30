import React, { useState } from 'react'
import { Check, FileImage } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import type { ImageData } from '../types'
import { formatFileSize } from '../utils/image-utils'

interface ImageThumbnailProps {
  image: ImageData
  selected?: boolean
  onSelect?: (image: ImageData) => void
  showMetadata?: boolean
  className?: string
}

export const ImageThumbnail: React.FC<ImageThumbnailProps> = ({
  image,
  selected = false,
  onSelect,
  showMetadata = true,
  className,
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleClick = () => {
    onSelect?.(image)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all',
        selected
          ? 'border-primary ring-primary ring-2 ring-offset-2'
          : 'border-muted hover:border-muted-foreground/50',
        className
      )}
    >
      {/* Selection indicator */}
      {selected && (
        <div className='bg-primary text-primary-foreground absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full'>
          <Check className='h-4 w-4' />
        </div>
      )}

      {/* Loading skeleton */}
      {loading && <Skeleton className='absolute inset-0 h-full w-full' />}

      {/* Error state */}
      {error && (
        <div className='bg-muted flex aspect-[4/3] items-center justify-center'>
          <FileImage className='text-muted-foreground h-8 w-8' />
        </div>
      )}

      {/* Image container with fixed aspect ratio */}
      <div className='bg-muted relative aspect-[4/3] w-full overflow-hidden'>
        <img
          src={image.publicUrl}
          alt={image.alt_text || image.filename}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105',
            loading && 'invisible',
            error && 'hidden'
          )}
          loading='lazy'
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false)
            setError(true)
          }}
        />
      </div>

      {/* Metadata overlay */}
      {showMetadata && !error && (
        <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-white opacity-0 transition-opacity group-hover:opacity-100'>
          <p className='truncate text-xs font-medium'>{image.filename}</p>
          <p className='text-xs opacity-90'>
            {formatFileSize(image.size_bytes)}
            {image.width && image.height && (
              <span>
                {' '}
                • {image.width}×{image.height}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
