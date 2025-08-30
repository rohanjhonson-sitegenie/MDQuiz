import React, { useState } from 'react'
import { Link2, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ImageData } from '../types'

interface ImageUrlInputProps {
  onLoad: (image: Partial<ImageData>) => void
  onError?: (error: Error) => void
  disabled?: boolean
  className?: string
}

export const ImageUrlInput: React.FC<ImageUrlInputProps> = ({
  onLoad,
  onError,
  disabled = false,
  className,
}) => {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateUrl = (urlString: string): boolean => {
    try {
      const parsedUrl = new URL(urlString)
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
    } catch {
      return false
    }
  }

  const loadImageFromUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create a new image to validate and get dimensions
      const img = new Image()
      img.crossOrigin = 'anonymous'

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = url
      })

      // Extract filename from URL
      const urlParts = url.split('/')
      const filename = urlParts[urlParts.length - 1] || 'image'

      // Create image data
      const imageData: Partial<ImageData> = {
        id: `url-${Date.now()}`,
        url: url,
        publicUrl: url,
        filename: filename,
        width: img.width,
        height: img.height,
        storage_path: url,
        created_at: new Date().toISOString(),
        // Note: We can't determine file size and mime type from URL easily
        size_bytes: 0,
        mime_type: 'image/*',
      }

      onLoad(imageData)
      setUrl('') // Clear input after successful load
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load image'
      setError(errorMessage)
      onError?.(new Error(errorMessage))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading && !disabled) {
      e.preventDefault()
      loadImageFromUrl()
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className='space-y-2'>
        <Label htmlFor='image-url' className='text-sm font-medium'>
          Image URL
        </Label>
        <div className='flex gap-2'>
          <div className='relative flex-1'>
            <Link2 className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              id='image-url'
              type='url'
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError(null)
              }}
              onKeyDown={handleKeyDown}
              placeholder='https://example.com/image.jpg'
              disabled={disabled || loading}
              className={cn(
                'pl-9',
                error && 'border-destructive focus-visible:ring-destructive'
              )}
            />
          </div>
          <Button
            type='button'
            onClick={loadImageFromUrl}
            disabled={disabled || loading || !url.trim()}
            size='default'
          >
            {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Load'}
          </Button>
        </div>
        {error && (
          <div className='text-destructive flex items-center gap-2 text-sm'>
            <AlertCircle className='h-4 w-4' />
            <span>{error}</span>
          </div>
        )}
      </div>
      <p className='text-muted-foreground text-xs'>
        Enter a direct link to an image file (JPG, PNG, GIF, WebP, SVG)
      </p>
    </div>
  )
}
