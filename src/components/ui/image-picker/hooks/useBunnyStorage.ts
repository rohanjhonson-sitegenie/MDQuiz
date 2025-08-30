import { useState, useEffect, useCallback } from 'react'
import { bunnyStorage } from '@/repositories/bunny-storage.repository'
import { useStorage } from '@/hooks/use-storage'
import type { ImageData } from '../types'

// Helper function to determine MIME type from filename
function getMimeTypeFromName(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
  }
  return mimeTypes[extension || ''] || 'application/octet-stream'
}

// Helper function to check if a file is an image
function isImageFile(filename: string, mimeType: string): boolean {
  // Check by MIME type first
  if (mimeType.startsWith('image/')) return true

  // Fallback to extension check
  const imageExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'svg',
    'bmp',
    'ico',
  ]
  const extension = filename.split('.').pop()?.toLowerCase()
  return imageExtensions.includes(extension || '')
}

interface UseBunnyStorageOptions {
  path: string
  enabled?: boolean
}

export function useBunnyStorage({
  path,
  enabled = true,
}: UseBunnyStorageOptions) {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const storage = useStorage()

  const fetchBucketImages = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      // Fetch files from Bunny Storage
      const response = await bunnyStorage.list(path)
      const items = response.files || []

      // Filter for image files only
      const imagesFromBucket: ImageData[] = items
        .filter((item) =>
          isImageFile(
            item.name,
            item.mimeType || getMimeTypeFromName(item.name)
          )
        )
        .map((item) => ({
          id: `bucket-${item.path.replace(/\//g, '-')}`,
          url: storage.getImageUrl(item.path),
          publicUrl: storage.getImageUrl(item.path),
          filename: item.name,
          size_bytes: item.size || 0,
          mime_type: item.mimeType || getMimeTypeFromName(item.name),
          storage_path: item.path,
          created_at: item.created || new Date().toISOString(),
          updated_at: item.modified,
        }))

      // Sort by created_at date (newest first)
      imagesFromBucket.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateB - dateA
      })

      setImages(imagesFromBucket)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [path, enabled, storage])

  useEffect(() => {
    fetchBucketImages()
  }, [fetchBucketImages])

  return { images, loading, error, refresh: fetchBucketImages }
}
