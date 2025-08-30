export interface ImageTransformOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'auto' | 'webp' | 'jpeg' | 'png' | 'avif'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  gravity?:
    | 'center'
    | 'north'
    | 'south'
    | 'east'
    | 'west'
    | 'northeast'
    | 'northwest'
    | 'southeast'
    | 'southwest'
  aspect_ratio?: string
  blur?: number
  sharpen?: number
}

export interface ImageContext {
  type: 'hero' | 'thumbnail' | 'card' | 'avatar' | 'gallery' | 'inline' | 'blog'
  container?: { width?: number; height?: number }
  priority?: 'high' | 'normal' | 'low'
  responsive?: boolean
}

export interface ResponsiveImageSet {
  src: string
  srcSet?: string
  sizes?: string
  loading?: 'lazy' | 'eager'
}

export interface Size {
  width: number
  height: number
}

export interface ImagePreset {
  sizes: number[]
  quality: number
  format: 'auto' | 'webp' | 'jpeg' | 'png' | 'avif'
  fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  aspectRatio?: string
  gravity?: string
}
