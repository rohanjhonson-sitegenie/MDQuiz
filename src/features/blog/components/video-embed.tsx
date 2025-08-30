import React, { useState } from 'react'
import { AlertCircle, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { VIDEO_PROVIDERS, type VideoProvider } from './video-embed-utils'

interface VideoEmbedProps {
  videoId: string
  title?: string
  provider: VideoProvider
  className?: string
  privacyEnhanced?: boolean
  width?: number
  height?: number
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({
  videoId,
  title,
  provider,
  className,
  privacyEnhanced = true,
  width,
  height,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const providerConfig = VIDEO_PROVIDERS[provider]

  if (!providerConfig) {
    return (
      <Alert variant='destructive' className='my-6'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>
          Unsupported video provider: {provider}
        </AlertDescription>
      </Alert>
    )
  }

  if (!videoId) {
    return (
      <Alert variant='destructive' className='my-6'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>No video ID provided</AlertDescription>
      </Alert>
    )
  }

  const embedUrl = providerConfig.getEmbedUrl(videoId, { privacyEnhanced })

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError) {
    return (
      <Alert variant='destructive' className='my-6'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>
          Failed to load video. Please check the video ID and try again.
        </AlertDescription>
      </Alert>
    )
  }

  // Calculate style based on width/height props
  const containerStyle: React.CSSProperties = {}
  const wrapperStyle: React.CSSProperties = {}

  if (width || height) {
    if (width) {
      containerStyle.maxWidth = `${width}px`
    }
    if (height) {
      wrapperStyle.height = `${height}px`
      wrapperStyle.aspectRatio = undefined
    } else if (width) {
      // If only width is specified, maintain aspect ratio
      wrapperStyle.aspectRatio = providerConfig.aspectRatio
    }
  } else {
    // Default behavior - use provider's aspect ratio
    wrapperStyle.aspectRatio = providerConfig.aspectRatio
  }

  return (
    <div
      className={cn(
        'bg-muted my-6 overflow-hidden rounded-lg shadow-md',
        className
      )}
      style={containerStyle}
    >
      <div className='relative w-full' style={wrapperStyle}>
        {isLoading && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='h-full w-full bg-neutral-100 dark:bg-neutral-800' />
            <div className='absolute flex flex-col items-center gap-2'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700'>
                <Play className='h-8 w-8 text-neutral-600 dark:text-neutral-400' />
              </div>
              {title && (
                <span className='text-muted-foreground text-sm'>{title}</span>
              )}
            </div>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={title || `${provider} video`}
          className={cn('h-full w-full', isLoading && 'invisible')}
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
          onLoad={handleLoad}
          onError={handleError}
          loading='lazy'
          width={width}
          height={height}
        />
      </div>
    </div>
  )
}
