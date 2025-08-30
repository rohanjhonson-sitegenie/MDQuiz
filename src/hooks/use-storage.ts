import { storageService } from '@/services/storage/storage.service'
import type {
  ImageTransformOptions,
  ImageContext,
  ResponsiveImageSet,
} from '@/types/storage.types'

export function useStorage() {
  return {
    getImageUrl: (path: string, options?: ImageTransformOptions) =>
      storageService.getImageUrl(path, options),

    getOptimizedImageUrl: (path: string, context: ImageContext) =>
      storageService.getOptimizedImageUrl(path, context),

    getResponsiveImageSet: (
      path: string,
      context: ImageContext
    ): ResponsiveImageSet =>
      storageService.getResponsiveImageSet(path, context),

    getVideoUrl: (path: string) => storageService.getVideoUrl(path),

    getDocumentUrl: (path: string) => storageService.getDocumentUrl(path),
  }
}
