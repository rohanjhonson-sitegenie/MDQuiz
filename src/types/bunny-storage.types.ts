export interface UploadResponse {
  id: string
  url: string
  publicUrl: string
  path: string
  size: number
  filename: string
  mimeType: string
}

export interface ListResponse {
  files: BunnyFile[]
  hasMore: boolean
  nextCursor?: string
}

export interface BunnyFile {
  path: string
  url: string
  size: number
  lastModified: string
  contentType: string
  name: string
  mimeType?: string
  created?: string
  modified?: string
}

export interface ImageTransformOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpg' | 'png' | 'auto'
  mode?: 'crop' | 'max' | 'pad'
  crop_gravity?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'auto'
}

export interface StorageError {
  error: string
}
