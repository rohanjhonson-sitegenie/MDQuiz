import React from 'react'
import { FileImage, Calendar, HardDrive } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import type { ImageData } from '../types'
import { formatFileSize } from '../utils/image-utils'

interface ImagePreviewProps {
  image: ImageData | Partial<ImageData> | null
  onAltTextChange?: (text: string) => void
  onCaptionChange?: (text: string) => void
  showMetadata?: boolean
  actions?: React.ReactNode
  loading?: boolean
  className?: string
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  onAltTextChange,
  onCaptionChange,
  showMetadata = true,
  actions,
  loading = false,
  className,
}) => {
  const [altText, setAltText] = React.useState(image?.alt_text || '')
  const [caption, setCaption] = React.useState(image?.caption || '')

  // Update local state when image changes
  React.useEffect(() => {
    setAltText(
      image?.alt_text || image?.filename?.replace(/\.[^/.]+$/, '') || ''
    )
    setCaption(image?.caption || '')
  }, [image])

  const handleAltTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAltText(value)
    onAltTextChange?.(value)
  }

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setCaption(value)
    onCaptionChange?.(value)
  }

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <Skeleton className='aspect-video w-full rounded-lg' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-20 w-full' />
        </div>
      </div>
    )
  }

  if (!image) {
    return (
      <div
        className={cn(
          'text-muted-foreground flex flex-col items-center justify-center py-12',
          className
        )}
      >
        <FileImage className='mb-4 h-12 w-12' />
        <p className='text-sm'>No image selected</p>
        <p className='text-xs'>Select an image to preview</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Image preview */}
      <div className='bg-muted relative overflow-hidden rounded-lg border'>
        <img
          src={image.publicUrl || image.url}
          alt={altText || image.filename}
          className='max-h-[300px] w-full object-contain'
        />
      </div>

      {/* Alt text input */}
      <div className='space-y-2'>
        <Label htmlFor='alt-text' className='text-sm font-medium'>
          Alt Text <span className='text-destructive'>*</span>
        </Label>
        <Input
          id='alt-text'
          value={altText}
          onChange={handleAltTextChange}
          placeholder='Describe the image for accessibility'
          required
        />
        <p className='text-muted-foreground text-xs'>
          Required for accessibility and SEO
        </p>
      </div>

      {/* Caption input */}
      {onCaptionChange && (
        <div className='space-y-2'>
          <Label htmlFor='caption' className='text-sm font-medium'>
            Caption <span className='text-muted-foreground'>(optional)</span>
          </Label>
          <Textarea
            id='caption'
            value={caption}
            onChange={handleCaptionChange}
            placeholder='Add a caption to display below the image'
            rows={2}
          />
        </div>
      )}

      {/* Metadata */}
      {showMetadata && (
        <div className='bg-muted/50 space-y-2 rounded-lg p-3 text-sm'>
          <h4 className='font-medium'>Image Details</h4>
          <div className='text-muted-foreground space-y-1'>
            <div className='flex items-center gap-2'>
              <HardDrive className='h-3 w-3' />
              <span>{formatFileSize(image.size_bytes || 0)}</span>
              {image.width && image.height && (
                <span>
                  • {image.width}×{image.height}px
                </span>
              )}
            </div>
            {image.created_at && (
              <div className='flex items-center gap-2'>
                <Calendar className='h-3 w-3' />
                <span>
                  Uploaded {new Date(image.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
            {image.filename && (
              <div className='truncate' title={image.filename}>
                File: {image.filename}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom actions */}
      {actions && <div className='pt-2'>{actions}</div>}
    </div>
  )
}
