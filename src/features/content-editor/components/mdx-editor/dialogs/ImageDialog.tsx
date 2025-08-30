import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ImagePickerDialog,
  ImageUploadZone,
  ImageUrlInput,
  ImageGallery,
  ImagePreview,
  useImageUpload,
} from '@/components/ui/image-picker'
import type { ImageData } from '@/components/ui/image-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface ImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (url: string, alt: string, width?: number, height?: number) => void
  onUpload?: (file: File) => Promise<string>
  initialImage?: {
    url: string
    alt: string
    width?: number
    height?: number
  }
}

export const ImageDialog: React.FC<ImageDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  onUpload,
  initialImage,
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)
  const [altText, setAltText] = useState('')
  const [width, setWidth] = useState<string>('')
  const [height, setHeight] = useState<string>('')
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const hasInitializedRef = useRef(false)

  const { uploading } = useImageUpload({
    onSuccess: (image) => {
      setSelectedImage(image)
      setAltText(image.alt_text || image.filename)
    },
  })

  // Handle initial image data when dialog opens
  useEffect(() => {
    if (open) {
      if (initialImage && !hasInitializedRef.current) {
        const imageData: ImageData = {
          id: `initial-${Date.now()}`,
          url: initialImage.url,
          publicUrl: initialImage.url,
          filename: initialImage.alt || 'image',
          size_bytes: 0,
          mime_type: 'image/jpeg',
          storage_path: initialImage.url,
          created_at: new Date().toISOString(),
          alt_text: initialImage.alt,
        }
        setSelectedImage(imageData)
        setAltText(initialImage.alt)
        setWidth(initialImage.width?.toString() || '')
        setHeight(initialImage.height?.toString() || '')
        // Calculate aspect ratio if both dimensions are available
        if (initialImage.width && initialImage.height) {
          setAspectRatio(initialImage.width / initialImage.height)
        }
        hasInitializedRef.current = true
      }
    } else {
      // Reset when dialog closes
      setSelectedImage(null)
      setAltText('')
      setWidth('')
      setHeight('')
      setAspectRatio(null)
      hasInitializedRef.current = false
    }
  }, [open, initialImage])

  const handleSubmit = () => {
    if (selectedImage && altText) {
      // Use storage_path (relative path) instead of publicUrl for portability
      const imagePath = selectedImage.storage_path || selectedImage.publicUrl
      const widthNum = width ? parseInt(width, 10) : undefined
      const heightNum = height ? parseInt(height, 10) : undefined
      onSubmit(imagePath, altText, widthNum, heightNum)
      resetAndClose()
    }
  }

  const resetAndClose = () => {
    onOpenChange(false)
  }

  // Handle width change with aspect ratio
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = e.target.value
    setWidth(newWidth)

    if (maintainAspectRatio && aspectRatio) {
      if (newWidth === '') {
        setHeight('')
      } else {
        const widthNum = parseInt(newWidth, 10)
        if (!isNaN(widthNum)) {
          const newHeight = Math.round(widthNum / aspectRatio)
          setHeight(newHeight.toString())
        }
      }
    }
  }

  // Handle height change with aspect ratio
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = e.target.value
    setHeight(newHeight)

    if (maintainAspectRatio && aspectRatio) {
      if (newHeight === '') {
        setWidth('')
      } else {
        const heightNum = parseInt(newHeight, 10)
        if (!isNaN(heightNum)) {
          const newWidth = Math.round(heightNum * aspectRatio)
          setWidth(newWidth.toString())
        }
      }
    }
  }

  const handleUpload = async (files: File[]) => {
    if (files.length > 0 && onUpload) {
      const file = files[0]
      try {
        const uploadedUrl = await onUpload(file)
        const imageData: ImageData = {
          id: `upload-${Date.now()}`,
          url: uploadedUrl,
          publicUrl: uploadedUrl,
          filename: file.name,
          size_bytes: file.size,
          mime_type: file.type,
          storage_path: uploadedUrl,
          created_at: new Date().toISOString(),
          alt_text: file.name.replace(/\.[^/.]+$/, ''),
        }
        setSelectedImage(imageData)
        setAltText(imageData.alt_text || '')
      } catch (_error) {
        // Upload failed - error handled by hook
      }
    }
  }

  // Helper function to load image and calculate aspect ratio
  const loadImageDimensions = (
    url: string
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = reject
      img.src = url
    })
  }

  const handleUrlLoad = async (image: Partial<ImageData>) => {
    setSelectedImage(image as ImageData)
    setAltText(image.alt_text || image.filename || '')

    // Try to get image dimensions and calculate aspect ratio
    if (image.publicUrl || image.url) {
      try {
        const dimensions = await loadImageDimensions(
          image.publicUrl || image.url || ''
        )
        setAspectRatio(dimensions.width / dimensions.height)
        // Don't set width/height here, let user control them
      } catch (_error) {
        // Failed to load image dimensions
        setAspectRatio(null)
      }
    }
  }

  const handleGallerySelect = async (image: ImageData) => {
    setSelectedImage(image)
    setAltText(image.alt_text || image.filename || '')

    // Try to get image dimensions and calculate aspect ratio
    if (image.publicUrl || image.url) {
      try {
        const dimensions = await loadImageDimensions(
          image.publicUrl || image.url
        )
        setAspectRatio(dimensions.width / dimensions.height)
        // Don't set width/height here, let user control them
      } catch (_error) {
        // Failed to load image dimensions
        setAspectRatio(null)
      }
    }
  }

  return (
    <ImagePickerDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialImage ? 'Edit Image' : 'Insert Image'}
      layout='landscape'
    >
      <ImagePickerDialog.InputPanel>
        <div className='space-y-6'>
          {/* Upload Zone */}
          {onUpload && (
            <>
              <ImageUploadZone onUpload={handleUpload} disabled={uploading} />
              <Separator />
            </>
          )}

          {/* URL Input */}
          <ImageUrlInput onLoad={handleUrlLoad} disabled={uploading} />

          <Separator />

          {/* Gallery Browser */}
          <ImageGallery
            bucket='blog/images'
            onSelect={handleGallerySelect}
            selectedImage={selectedImage}
            showRecent={4}
          />
        </div>
      </ImagePickerDialog.InputPanel>

      <ImagePickerDialog.PreviewPanel>
        <div className='flex h-full flex-col'>
          <div className='flex-1 overflow-y-auto'>
            <ImagePreview
              image={selectedImage}
              onAltTextChange={setAltText}
              showMetadata={true}
            />

            {/* Dimensions inputs */}
            {selectedImage && (
              <div className='mt-4 space-y-3 px-1'>
                <Separator />
                <div className='space-y-3'>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='maintain-ratio'
                      checked={maintainAspectRatio}
                      onCheckedChange={(checked) =>
                        setMaintainAspectRatio(checked as boolean)
                      }
                      disabled={!aspectRatio}
                    />
                    <Label
                      htmlFor='maintain-ratio'
                      className='cursor-pointer text-sm font-normal'
                    >
                      Maintain aspect ratio
                    </Label>
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-2'>
                      <Label htmlFor='width'>Width (px)</Label>
                      <Input
                        id='width'
                        type='number'
                        placeholder='Auto'
                        value={width}
                        onChange={handleWidthChange}
                        min='1'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='height'>Height (px)</Label>
                      <Input
                        id='height'
                        type='number'
                        placeholder='Auto'
                        value={height}
                        onChange={handleHeightChange}
                        min='1'
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className='mt-auto flex gap-2 border-t pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={resetAndClose}
              className='flex-1'
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={handleSubmit}
              disabled={!selectedImage || !altText}
              className='flex-1'
            >
              {initialImage ? 'Update Image' : 'Insert Image'}
            </Button>
          </div>
        </div>
      </ImagePickerDialog.PreviewPanel>
    </ImagePickerDialog>
  )
}
