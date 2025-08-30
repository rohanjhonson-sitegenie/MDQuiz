import React, { useState, useEffect } from 'react'
import { Search, FolderOpen, Loader2, Database, HardDrive } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useBunnyStorage } from '../hooks/useBunnyStorage'
import { useImageGallery, useRecentImages } from '../hooks/useImageGallery'
import type { ImageData, ImageFilter } from '../types'
import { ImageGrid } from './ImageGrid'
import { useImagePicker } from './ImagePickerDialog'
import { ImageThumbnail } from './ImageThumbnail'

interface ImageGalleryProps {
  bucket: string
  onSelect: (image: ImageData) => void
  selectedImage?: ImageData | null
  searchable?: boolean
  showRecent?: number
  filter?: ImageFilter
  className?: string
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  bucket,
  onSelect,
  selectedImage,
  searchable = true,
  showRecent = 4,
  filter: externalFilter,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFullGallery, setShowFullGallery] = useState(false)
  const [filter, setFilter] = useState<ImageFilter>(externalFilter || {})
  const [dataSource, setDataSource] = useState<'database' | 'bucket'>(
    'database'
  )

  // Get the context if available
  let contextSelectedImage: ImageData | null | undefined
  let contextSetSelectedImage: ((image: ImageData | null) => void) | undefined
  try {
    const context = useImagePicker()
    contextSelectedImage = context?.selectedImage
    contextSetSelectedImage = context?.setSelectedImage
  } catch {
    // Context might not be available, that's okay
  }

  // Update filter when search changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilter((prev) => ({
        ...prev,
        search: searchQuery,
      }))
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Fetch recent images
  const { images: recentImages, loading: recentLoading } = useRecentImages(
    bucket,
    showRecent
  )

  // Fetch full gallery from database
  const {
    images: galleryImages,
    loading: galleryLoading,
    hasMore,
    loadMore,
    totalCount,
  } = useImageGallery({
    bucket,
    filter,
    enabled: showFullGallery && dataSource === 'database',
  })

  // Fetch from storage bucket
  const {
    images: bucketImages,
    loading: bucketLoading,
    error: bucketError,
  } = useBunnyStorage({
    path: bucket,
    enabled: showFullGallery && dataSource === 'bucket',
  })

  const handleImageSelect = (image: ImageData) => {
    // Update context if available so preview updates immediately
    if (contextSetSelectedImage) {
      contextSetSelectedImage(image)
    }
    // Call the onSelect callback which will set form value and close dialog
    onSelect(image)
  }

  const selectedImages = contextSelectedImage
    ? [contextSelectedImage]
    : selectedImage
      ? [selectedImage]
      : []

  return (
    <div className={cn('space-y-4', className)}>
      {/* Recent uploads section */}
      {!showFullGallery && showRecent > 0 && (
        <div className='space-y-3'>
          <h3 className='text-sm font-medium'>Recent Uploads</h3>

          {recentLoading ? (
            <div className='flex h-24 items-center justify-center'>
              <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
            </div>
          ) : recentImages.length > 0 ? (
            <div className='grid grid-cols-4 gap-2'>
              {recentImages.map((image) => (
                <ImageThumbnail
                  key={image.id}
                  image={image}
                  selected={
                    contextSelectedImage?.id === image.id ||
                    selectedImage?.id === image.id
                  }
                  onSelect={handleImageSelect}
                  showMetadata={false}
                  className='h-20'
                />
              ))}
            </div>
          ) : (
            <p className='text-muted-foreground text-sm'>No recent images</p>
          )}

          <Button
            type='button'
            variant='outline'
            onClick={() => setShowFullGallery(true)}
            className='w-full'
          >
            <FolderOpen className='mr-2 h-4 w-4' />
            Browse All Images
          </Button>
        </div>
      )}

      {/* Full gallery */}
      {showFullGallery && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => setShowFullGallery(false)}
            >
              ← Back
            </Button>

            <ToggleGroup
              type='single'
              value={dataSource}
              onValueChange={(value) =>
                value && setDataSource(value as 'database' | 'bucket')
              }
            >
              <ToggleGroupItem
                value='database'
                aria-label='Show database images'
              >
                <Database className='mr-2 h-4 w-4' />
                Database
              </ToggleGroupItem>
              <ToggleGroupItem
                value='bucket'
                aria-label='Show all bucket files'
              >
                <HardDrive className='mr-2 h-4 w-4' />
                All Files
              </ToggleGroupItem>
            </ToggleGroup>

            {dataSource === 'database' && totalCount > 0 && (
              <span className='text-muted-foreground text-sm'>
                {totalCount} image{totalCount !== 1 && 's'}
              </span>
            )}
            {dataSource === 'bucket' && !bucketLoading && (
              <span className='text-muted-foreground text-sm'>
                {bucketImages.length} image{bucketImages.length !== 1 && 's'}
              </span>
            )}
            {dataSource === 'bucket' && bucketLoading && (
              <span className='text-muted-foreground flex items-center text-sm'>
                <Loader2 className='mr-2 h-3 w-3 animate-spin' />
                Scanning folders...
              </span>
            )}
          </div>

          {searchable && (
            <div className='relative'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                type='search'
                placeholder='Search images...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>
          )}

          <div className='h-[320px] overflow-hidden rounded-lg border'>
            <ImageGrid
              images={dataSource === 'database' ? galleryImages : bucketImages}
              selectedImages={selectedImages}
              onSelect={handleImageSelect}
              loading={
                dataSource === 'database' ? galleryLoading : bucketLoading
              }
              loadMore={dataSource === 'database' ? loadMore : undefined}
              hasMore={dataSource === 'database' ? hasMore : false}
              emptyMessage={
                bucketError
                  ? 'Error loading bucket files'
                  : searchQuery
                    ? `No images found for "${searchQuery}"`
                    : dataSource === 'database'
                      ? 'No images in database'
                      : 'No files in bucket'
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}
