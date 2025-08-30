import { IMAGE_PICKER_CONSTANTS } from '../constants'

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function isValidImageType(
  file: File,
  acceptedTypes?: string[]
): boolean {
  const types = acceptedTypes || IMAGE_PICKER_CONSTANTS.DEFAULT_ACCEPTED_TYPES
  return (types as readonly string[]).includes(file.type)
}

export function isValidFileSize(file: File, maxSize?: number): boolean {
  const max = maxSize || IMAGE_PICKER_CONSTANTS.DEFAULT_MAX_FILE_SIZE
  return file.size <= max
}

export function generateAltTextFromFilename(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
}

export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

export function createImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

export function cleanupImagePreviewUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

export function getGridColumns(): number {
  if (typeof window === 'undefined') {
    return IMAGE_PICKER_CONSTANTS.GRID_COLUMNS.desktop
  }

  const width = window.innerWidth
  if (width < 640) return IMAGE_PICKER_CONSTANTS.GRID_COLUMNS.mobile
  if (width < 1024) return IMAGE_PICKER_CONSTANTS.GRID_COLUMNS.tablet
  return IMAGE_PICKER_CONSTANTS.GRID_COLUMNS.desktop
}
