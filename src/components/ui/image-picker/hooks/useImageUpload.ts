import { useState, useCallback } from 'react'
import { bunnyStorage } from '@/repositories/bunny-storage.repository'
import type { ImageData, UploadProgress, UploadStatus } from '../types'

interface UseImageUploadOptions {
  bucket?: string
  postId?: string
  onSuccess?: (image: ImageData) => void
  onError?: (error: Error) => void
}

interface UseImageUploadReturn {
  upload: (file: File) => Promise<ImageData>
  uploadMultiple: (files: File[]) => Promise<ImageData[]>
  uploading: boolean
  progress: UploadProgress | null
  status: UploadStatus
  error: Error | null
}

export function useImageUpload({
  bucket = 'blog/images',
  postId,
  onSuccess,
  onError,
}: UseImageUploadOptions = {}): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [error, setError] = useState<Error | null>(null)

  const upload = useCallback(
    async (file: File): Promise<ImageData> => {
      setUploading(true)
      setStatus('uploading')
      setError(null)
      setProgress({ loaded: 0, total: file.size, percentage: 0 })

      try {
        // Upload to Bunny Storage
        const path = 'blog/images'
        const result = await bunnyStorage.upload(file, path)

        // Transform to ImageData format
        const imageData: ImageData = {
          id: result.id,
          url: result.publicUrl,
          publicUrl: result.publicUrl,
          filename: result.filename,
          size_bytes: result.size,
          mime_type: result.mimeType,
          storage_path: result.path,
          created_at: new Date().toISOString(),
        }

        setStatus('success')
        setProgress({ loaded: file.size, total: file.size, percentage: 100 })
        onSuccess?.(imageData)

        return imageData
      } catch (err) {
        const error = err as Error
        setStatus('error')
        setError(error)
        onError?.(error)
        throw error
      } finally {
        setUploading(false)
        // Reset progress after a delay
        setTimeout(() => {
          setProgress(null)
          setStatus('idle')
        }, 2000)
      }
    },
    [bucket, postId, onSuccess, onError]
  )

  const uploadMultiple = useCallback(
    async (files: File[]): Promise<ImageData[]> => {
      const results: ImageData[] = []
      const totalSize = files.reduce((sum, file) => sum + file.size, 0)
      let loadedSize = 0

      for (const file of files) {
        try {
          // Update progress for multiple files
          setProgress({
            loaded: loadedSize,
            total: totalSize,
            percentage: Math.round((loadedSize / totalSize) * 100),
          })

          const imageData = await upload(file)
          results.push(imageData)
          loadedSize += file.size
        } catch (error) {
          // Continue with other files even if one fails
          console.error(`Failed to upload ${file.name}:`, error)
        }
      }

      return results
    },
    [upload]
  )

  return {
    upload,
    uploadMultiple,
    uploading,
    progress,
    status,
    error,
  }
}
