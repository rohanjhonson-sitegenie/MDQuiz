import { useState, useEffect, useCallback } from 'react'
import { bunnyStorage } from '@/repositories/bunny-storage.repository'
import { useStorage } from '@/hooks/use-storage'
import { IMAGE_PICKER_CONSTANTS } from '../constants'
import type { ImageData, ImageFilter } from '../types'

interface UseImageGalleryOptions {
  bucket: string
  pageSize?: number
  filter?: ImageFilter
  enabled?: boolean
}

interface UseImageGalleryReturn {
  images: ImageData[]
  loading: boolean
  error: Error | null
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
  totalCount: number
}

export function useImageGallery({
  bucket,
  pageSize = IMAGE_PICKER_CONSTANTS.DEFAULT_PAGE_SIZE,
  filter,
  enabled = true,
}: UseImageGalleryOptions): UseImageGalleryReturn {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const storage = useStorage()

  const fetchImages = useCallback(
    async (pageNum: number, append = false) => {
      if (!enabled) return

      setLoading(true)
      setError(null)

      try {
        // Fetch images from Bunny Storage
        const response = await bunnyStorage.list(bucket)
        let allImages = response.files || []

        // Transform to ImageData format
        let imagesData: ImageData[] = allImages.map((item) => ({
          id: `bunny-${item.path.replace(/\//g, '-')}`,
          url: storage.getImageUrl(item.path),
          publicUrl: storage.getImageUrl(item.path),
          filename: item.name,
          size_bytes: item.size || 0,
          mime_type: item.mimeType || 'application/octet-stream',
          storage_path: item.path,
          created_at: item.created || new Date().toISOString(),
          updated_at: item.modified,
        }))

        // Apply client-side filters
        if (filter?.search) {
          const searchLower = filter.search.toLowerCase()
          imagesData = imagesData.filter((img) =>
            img.filename.toLowerCase().includes(searchLower)
          )
        }

        if (filter?.mimeTypes && filter.mimeTypes.length > 0) {
          imagesData = imagesData.filter((img) =>
            filter.mimeTypes!.includes(img.mime_type)
          )
        }

        if (filter?.minSize) {
          imagesData = imagesData.filter(
            (img) => img.size_bytes >= filter.minSize!
          )
        }

        if (filter?.maxSize) {
          imagesData = imagesData.filter(
            (img) => img.size_bytes <= filter.maxSize!
          )
        }

        if (filter?.dateFrom) {
          imagesData = imagesData.filter(
            (img) => new Date(img.created_at) >= filter.dateFrom!
          )
        }

        if (filter?.dateTo) {
          imagesData = imagesData.filter(
            (img) => new Date(img.created_at) <= filter.dateTo!
          )
        }

        // Sort by created date (newest first)
        imagesData.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        // Implement pagination
        const startIndex = pageNum * pageSize
        const endIndex = startIndex + pageSize
        const paginatedImages = imagesData.slice(startIndex, endIndex)

        if (append) {
          setImages((prev) => [...prev, ...paginatedImages])
        } else {
          setImages(paginatedImages)
        }

        setTotalCount(imagesData.length)
        setHasMore(endIndex < imagesData.length)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    },
    [enabled, pageSize, filter, bucket, storage]
  )

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchImages(nextPage, true)
    }
  }, [loading, hasMore, page, fetchImages])

  const refresh = useCallback(() => {
    setPage(0)
    setImages([])
    fetchImages(0, false)
  }, [fetchImages])

  // Initial load and filter changes
  useEffect(() => {
    setPage(0)
    setImages([])
    fetchImages(0, false)
  }, [filter, enabled]) // fetchImages is excluded to prevent infinite loop

  return {
    images,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    totalCount,
  }
}

// Hook for fetching recent images
export function useRecentImages(
  _bucket: string,
  limit: number = IMAGE_PICKER_CONSTANTS.DEFAULT_RECENT_COUNT
) {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchRecentImages = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch all images from Bunny Storage
        const response = await bunnyStorage.list(_bucket)
        const allImages = response.files || []

        // Transform and sort by date
        const imagesData: ImageData[] = allImages
          .map((item) => ({
            id: `bunny-${item.path.replace(/\//g, '-')}`,
            url: bunnyStorage.getPublicUrl(item.path),
            publicUrl: bunnyStorage.getPublicUrl(item.path),
            filename: item.name,
            size_bytes: item.size || 0,
            mime_type: item.mimeType || 'application/octet-stream',
            storage_path: item.path,
            created_at: item.created || new Date().toISOString(),
            updated_at: item.modified,
          }))
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, limit)

        setImages(imagesData)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentImages()
  }, [_bucket, limit])

  return { images, loading, error }
}
