import { IMAGE_PRESETS } from '@/config/image-optimization.config'
import type { ImageContext } from '@/types/storage.types'

export function calculateOptimalDimensions(
  containerSize: { width?: number; height?: number } | undefined,
  devicePixelRatio: number = window.devicePixelRatio || 1
): { width: number; height: number | undefined } {
  if (!containerSize || !containerSize.width) {
    return { width: 800, height: undefined } // Default fallback
  }

  // Account for high DPI displays
  const multiplier = Math.min(devicePixelRatio, 2) // Cap at 2x for performance

  return {
    width: Math.round(containerSize.width * multiplier),
    height: containerSize.height
      ? Math.round(containerSize.height * multiplier)
      : undefined,
  }
}

export function getFormatForBrowser(): 'webp' | 'jpeg' | 'auto' {
  // Simple WebP support detection
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const supported = canvas.toDataURL('image/webp').indexOf('image/webp') === 5

  return supported ? 'webp' : 'auto'
}

export function getQualityForContext(context: ImageContext): number {
  const preset = IMAGE_PRESETS[context.type]
  if (preset) return preset.quality

  // Default quality based on priority
  switch (context.priority) {
    case 'high':
      return 85
    case 'low':
      return 65
    default:
      return 75
  }
}

export function generateSrcSet(
  path: string,
  sizes: number[],
  urlBuilder: (path: string, width: number) => string
): string {
  return sizes.map((size) => `${urlBuilder(path, size)} ${size}w`).join(', ')
}

export function generateSizesAttribute(context: ImageContext): string {
  // Generate responsive sizes attribute based on context
  switch (context.type) {
    case 'hero':
      return '100vw'
    case 'card':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
    case 'thumbnail':
      return '(max-width: 640px) 50vw, 25vw'
    case 'avatar':
      return '64px'
    case 'gallery':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
    default:
      return '100vw'
  }
}

export function supportsWebP(): boolean {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5
  } catch {
    return false
  }
}

export function supportsAvif(): boolean {
  // AVIF detection is more complex, for now return false
  // In production, you might want to use a more sophisticated detection
  return false
}
