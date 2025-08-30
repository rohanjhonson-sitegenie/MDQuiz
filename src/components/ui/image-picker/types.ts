export interface ImageData {
  id: string
  url: string
  publicUrl: string
  filename: string
  alt_text?: string
  caption?: string
  size_bytes: number
  mime_type: string
  width?: number
  height?: number
  storage_path: string
  created_at: string
  updated_at?: string
}

export interface ImageUploadOptions {
  bucket?: string
  maxSize?: number
  acceptedTypes?: string[]
  generateAltText?: boolean
}

export interface ImageFilter {
  search?: string
  mimeTypes?: string[]
  minSize?: number
  maxSize?: number
  dateFrom?: Date
  dateTo?: Date
}

export interface ImagePickerConfig {
  bucket: string
  allowUpload?: boolean
  allowUrl?: boolean
  allowGallery?: boolean
  multiple?: boolean
  maxFiles?: number
  uploadOptions?: ImageUploadOptions
}

export type ImageSelectionMode = 'single' | 'multiple'

export interface ImageSelection {
  images: ImageData[]
  mode: ImageSelectionMode
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export interface UploadResult {
  status: UploadStatus
  data?: ImageData
  error?: Error
  progress?: UploadProgress
}
