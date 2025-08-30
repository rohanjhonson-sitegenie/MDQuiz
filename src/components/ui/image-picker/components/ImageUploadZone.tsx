import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Upload, Image as ImageIcon, X, Clipboard } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { IMAGE_PICKER_CONSTANTS } from '../constants'
import type { UploadProgress, UploadStatus } from '../types'
import {
  formatFileSize,
  isValidFileSize,
  isValidImageType,
} from '../utils/image-utils'

interface ImageUploadZoneProps {
  onUpload: (files: File[]) => void | Promise<void>
  onError?: (error: Error) => void
  accept?: string[]
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  className?: string
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  onUpload,
  onError,
  accept = IMAGE_PICKER_CONSTANTS.DEFAULT_ACCEPTED_TYPES,
  maxSize = IMAGE_PICKER_CONSTANTS.DEFAULT_MAX_FILE_SIZE,
  multiple = false,
  disabled = false,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)

      // Validate files
      const validFiles: File[] = []
      for (const file of fileArray) {
        if (!isValidImageType(file, accept ? [...accept] : undefined)) {
          toast.error(`${file.name} is not a supported image format`)
          continue
        }

        if (!isValidFileSize(file, maxSize)) {
          toast.error(
            `${file.name} exceeds the maximum size of ${formatFileSize(maxSize)}`
          )
          continue
        }

        validFiles.push(file)
        if (!multiple) break // Only take first valid file if not multiple
      }

      if (validFiles.length === 0) return

      try {
        setUploadStatus('uploading')
        setUploadProgress({ loaded: 0, total: 100, percentage: 0 })

        // Simulate progress for demo (replace with actual upload progress)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (!prev || prev.percentage >= 90) return prev
            const newPercentage = prev.percentage + 10
            return { ...prev, percentage: newPercentage }
          })
        }, 200)

        await onUpload(validFiles)

        clearInterval(progressInterval)
        setUploadProgress({ loaded: 100, total: 100, percentage: 100 })
        setUploadStatus('success')

        setTimeout(() => {
          setUploadStatus('idle')
          setUploadProgress(null)
        }, 2000)
      } catch (error) {
        setUploadStatus('error')
        onError?.(error as Error)
        toast.error('There was an error uploading your image(s)')
        setTimeout(() => {
          setUploadStatus('idle')
          setUploadProgress(null)
        }, 3000)
      }
    },
    [accept, maxSize, multiple, onUpload, onError, toast]
  )

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.target === dropZoneRef.current) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled || uploadStatus === 'uploading') return

      const { files } = e.dataTransfer
      if (files && files.length > 0) {
        handleFiles(files)
      }
    },
    [disabled, uploadStatus, handleFiles]
  )

  // File input handler
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target
      if (files && files.length > 0) {
        handleFiles(files)
      }
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [handleFiles]
  )

  // Click handler
  const handleClick = useCallback(() => {
    if (!disabled && uploadStatus !== 'uploading') {
      fileInputRef.current?.click()
    }
  }, [disabled, uploadStatus])

  // Paste handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled || uploadStatus === 'uploading') return

      const items = e.clipboardData?.items
      if (!items) return

      const imageFiles: File[] = []
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) imageFiles.push(file)
        }
      }

      if (imageFiles.length > 0) {
        handleFiles(imageFiles)
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [disabled, uploadStatus, handleFiles])

  return (
    <div className={cn('relative', className)}>
      <div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          'relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'cursor-not-allowed opacity-50',
          uploadStatus === 'uploading' && 'pointer-events-none',
          !isDragging && !disabled && 'hover:border-muted-foreground/50'
        )}
      >
        <input
          ref={fileInputRef}
          type='file'
          accept={accept.join(',')}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className='hidden'
        />

        {uploadStatus === 'idle' && (
          <>
            <ImageIcon className='text-muted-foreground mb-4 h-10 w-10' />
            <p className='mb-2 text-sm font-medium'>
              Drag and drop {multiple ? 'images' : 'an image'} here
            </p>
            <p className='text-muted-foreground mb-4 text-xs'>or</p>
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='secondary'
                size='sm'
                disabled={disabled}
                onClick={(e) => e.stopPropagation()}
              >
                <Upload className='mr-2 h-4 w-4' />
                Choose File{multiple && 's'}
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                disabled={disabled}
                onClick={(e) => e.stopPropagation()}
              >
                <Clipboard className='mr-2 h-4 w-4' />
                Paste
              </Button>
            </div>
            <p className='text-muted-foreground mt-4 text-xs'>
              Max size: {formatFileSize(maxSize)}
            </p>
          </>
        )}

        {uploadStatus === 'uploading' && uploadProgress && (
          <div className='w-full max-w-xs'>
            <Upload className='text-primary mb-4 h-10 w-10 animate-pulse' />
            <p className='mb-2 text-sm font-medium'>Uploading...</p>
            <Progress value={uploadProgress.percentage} className='mb-2' />
            <p className='text-muted-foreground text-xs'>
              {uploadProgress.percentage}%
            </p>
          </div>
        )}

        {uploadStatus === 'success' && (
          <>
            <div className='bg-success text-success-foreground mb-4 flex h-10 w-10 items-center justify-center rounded-full'>
              ✓
            </div>
            <p className='text-success text-sm font-medium'>Upload complete!</p>
          </>
        )}

        {uploadStatus === 'error' && (
          <>
            <div className='bg-destructive text-destructive-foreground mb-4 flex h-10 w-10 items-center justify-center rounded-full'>
              <X className='h-6 w-6' />
            </div>
            <p className='text-destructive text-sm font-medium'>
              Upload failed
            </p>
          </>
        )}
      </div>
    </div>
  )
}
