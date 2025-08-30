import { IMAGE_PRESETS } from '@/config/image-optimization.config'
import { bunnyStorage } from '@/repositories/bunny-storage.repository'
import type { ImageTransformOptions as BunnyImageTransformOptions } from '@/types/bunny-storage.types'
import type {
  ImageTransformOptions,
  ImageContext,
  ResponsiveImageSet,
} from '@/types/storage.types'
import { getStorageConfig, isStorageConfigured } from '@/lib/storage/config'
import {
  calculateOptimalDimensions,
  getFormatForBrowser,
  getQualityForContext,
  generateSrcSet,
  generateSizesAttribute,
} from '@/lib/storage/image-optimization'
import {
  isFullUrl,
  normalizeStoragePath,
  buildFallbackUrl as _buildFallbackUrl,
} from '@/lib/storage/url-utils'

export interface IStorageService {
  getImageUrl(path: string, options?: ImageTransformOptions): string
  getOptimizedImageUrl(path: string, context: ImageContext): string
  getResponsiveImageSet(path: string, context: ImageContext): ResponsiveImageSet
  getVideoUrl(path: string): string
  getDocumentUrl(path: string): string
}

export class StorageService implements IStorageService {
  private config = getStorageConfig()

  private convertToBunnyOptions(
    options?: ImageTransformOptions
  ): BunnyImageTransformOptions | undefined {
    if (!options) return undefined

    const bunnyOptions: BunnyImageTransformOptions = {}

    if (options.width) bunnyOptions.width = options.width
    if (options.height) bunnyOptions.height = options.height
    if (options.quality) bunnyOptions.quality = options.quality

    // Convert format: 'jpeg' -> 'jpg'
    if (options.format) {
      bunnyOptions.format =
        options.format === 'jpeg'
          ? 'jpg'
          : (options.format as 'webp' | 'png' | 'auto')
    }

    // Map fit to mode
    if (options.fit) {
      if (options.fit === 'cover' || options.fit === 'fill') {
        bunnyOptions.mode = 'crop'
      } else if (options.fit === 'contain' || options.fit === 'inside') {
        bunnyOptions.mode = 'max'
      } else if (options.fit === 'outside') {
        bunnyOptions.mode = 'pad'
      }
    }

    // Map gravity to crop_gravity
    if (options.gravity) {
      bunnyOptions.crop_gravity = options.gravity as
        | 'center'
        | 'top'
        | 'bottom'
        | 'left'
        | 'right'
        | 'auto'
    }

    return bunnyOptions
  }

  getImageUrl(path: string, options?: ImageTransformOptions): string {
    if (!path) return this.getPlaceholderUrl()

    // Don't process video URLs
    if (path.match(/^(youtube|vimeo|loom|wistia):/)) {
      return path
    }

    // If already a full URL, just add transforms if needed
    if (isFullUrl(path)) {
      return options ? this.applyTransformsToUrl(path, options) : path
    }

    // Try to get CDN URL
    try {
      if (!isStorageConfigured()) {
        return this.handleFallback(path, options)
      }
      return bunnyStorage.getPublicUrl(
        path,
        this.convertToBunnyOptions(options)
      )
    } catch (_error) {
      // Failed to get CDN URL, will use fallback
      return this.handleFallback(path, options)
    }
  }

  getOptimizedImageUrl(path: string, context: ImageContext): string {
    if (!path) return this.getPlaceholderUrl()

    // Don't process video URLs
    if (path.match(/^(youtube|vimeo|loom|wistia):/)) {
      return path
    }

    const preset = IMAGE_PRESETS[context.type]
    if (!preset) {
      // Fallback to basic URL if no preset
      return this.getImageUrl(path)
    }

    // Calculate optimal dimensions
    const optimalSize = context.container
      ? calculateOptimalDimensions(context.container)
      : { width: preset.sizes[0], height: undefined }

    // Build optimization parameters
    const options: ImageTransformOptions = {
      width: optimalSize.width,
      height: optimalSize.height,
      format: getFormatForBrowser(),
      quality: getQualityForContext(context),
      fit: preset.fit,
    }

    if (preset.aspectRatio) {
      options.aspect_ratio = preset.aspectRatio
    }

    if (preset.gravity) {
      options.gravity = preset.gravity as ImageTransformOptions['gravity']
    }

    return this.getImageUrl(path, options)
  }

  getResponsiveImageSet(
    path: string,
    context: ImageContext
  ): ResponsiveImageSet {
    if (!path) {
      return {
        src: this.getPlaceholderUrl(),
        loading: 'lazy',
      }
    }

    // Don't process video URLs - return them as-is
    if (path.match(/^(youtube|vimeo|loom|wistia):/)) {
      return {
        src: path,
        loading: 'lazy',
      }
    }

    const preset = IMAGE_PRESETS[context.type]
    if (!preset) {
      return {
        src: this.getImageUrl(path),
        loading: context.priority === 'high' ? 'eager' : 'lazy',
      }
    }

    // Generate srcSet for responsive images
    const srcSet = generateSrcSet(path, preset.sizes, (p, width) =>
      this.getOptimizedImageUrl(p, {
        ...context,
        container: { width, height: undefined },
      })
    )

    return {
      src: this.getOptimizedImageUrl(path, context),
      srcSet,
      sizes: generateSizesAttribute(context),
      loading: context.priority === 'high' ? 'eager' : 'lazy',
    }
  }

  getVideoUrl(path: string): string {
    // Videos typically don't need optimization parameters
    return this.getImageUrl(path)
  }

  getDocumentUrl(path: string): string {
    // Documents don't need optimization
    return this.getImageUrl(path)
  }

  private handleFallback(
    path: string,
    options?: ImageTransformOptions
  ): string {
    const normalizedPath = normalizeStoragePath(path)

    if (this.config.isDevelopment) {
      // In development, try to proxy through local server
      const baseUrl = `${window.location.origin}/api/images/${normalizedPath}`
      return options ? this.applyTransformsToUrl(baseUrl, options) : baseUrl
    }

    // In production without CDN, return placeholder
    return this.getPlaceholderUrl()
  }

  private applyTransformsToUrl(
    url: string,
    options: ImageTransformOptions
  ): string {
    try {
      const urlObj = new URL(url)

      if (options.width) {
        urlObj.searchParams.set('width', options.width.toString())
      }
      if (options.height) {
        urlObj.searchParams.set('height', options.height.toString())
      }
      if (options.quality) {
        urlObj.searchParams.set('quality', options.quality.toString())
      }
      if (options.format) {
        urlObj.searchParams.set('format', options.format)
      }
      if (options.fit) {
        urlObj.searchParams.set('fit', options.fit)
      }
      if (options.gravity) {
        urlObj.searchParams.set('gravity', options.gravity)
      }
      if (options.aspect_ratio) {
        urlObj.searchParams.set('aspect_ratio', options.aspect_ratio)
      }
      if (options.blur) {
        urlObj.searchParams.set('blur', options.blur.toString())
      }
      if (options.sharpen) {
        urlObj.searchParams.set('sharpen', options.sharpen.toString())
      }

      return urlObj.toString()
    } catch {
      // If URL parsing fails, return original
      return url
    }
  }

  private getPlaceholderUrl(): string {
    return '/images/placeholder.jpg'
  }
}

// Singleton instance
export const storageService = new StorageService()
