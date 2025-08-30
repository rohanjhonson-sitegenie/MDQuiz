import type { ImageContext } from '@/types/storage.types'
import { cn } from '@/lib/utils'
import { useStorage } from '@/hooks/use-storage'

export interface OptimizedImageProps {
  path: string
  alt: string
  context: ImageContext
  className?: string
  fallback?: string
  width?: number
  height?: number
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

export function OptimizedImage({
  path,
  alt,
  context,
  className,
  fallback = '/images/placeholder.jpg',
  width,
  height,
  onError,
}: OptimizedImageProps) {
  const storage = useStorage()

  if (!path) {
    return (
      <img
        src={fallback}
        alt={alt}
        className={cn('object-cover', className)}
        loading='lazy'
        width={width}
        height={height}
      />
    )
  }

  const imageSet = storage.getResponsiveImageSet(path, context)

  return (
    <img
      src={imageSet.src}
      srcSet={imageSet.srcSet}
      sizes={imageSet.sizes}
      alt={alt}
      loading={imageSet.loading}
      className={cn('object-cover', className)}
      width={width}
      height={height}
      onError={(e) => {
        if (onError) {
          onError(e)
        } else {
          // Default error handling - show fallback
          e.currentTarget.src = fallback
        }
      }}
    />
  )
}
