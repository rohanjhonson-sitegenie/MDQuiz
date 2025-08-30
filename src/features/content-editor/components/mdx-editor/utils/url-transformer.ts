import { isFullUrl, normalizeStoragePath } from '@/lib/storage/url-utils'

export function transformImageUrl(
  url: string | undefined,
  imageBaseUrl: string | undefined
): string {
  if (!url) return ''

  // Don't transform video protocols
  if (url.match(/^(youtube|vimeo|loom|wistia):/)) {
    return url
  }

  // If already a full URL, return as-is
  if (isFullUrl(url)) {
    return url
  }

  // If no base URL provided, return original
  if (!imageBaseUrl) {
    return url
  }

  // Normalize the path (remove leading slash if present)
  const normalizedPath = normalizeStoragePath(url)

  // Ensure base URL doesn't end with slash
  const baseUrl = imageBaseUrl.endsWith('/')
    ? imageBaseUrl.slice(0, -1)
    : imageBaseUrl

  // Combine base URL with path
  return `${baseUrl}/${normalizedPath}`
}

export function extractRelativePath(
  url: string,
  imageBaseUrl: string | undefined
): string {
  if (!url || !imageBaseUrl) return url

  // Don't transform video protocols
  if (url.match(/^(youtube|vimeo|loom|wistia):/)) {
    return url
  }

  // If it's not a full URL, it's already relative
  if (!isFullUrl(url)) {
    return url
  }

  // Check if URL starts with the base URL
  const baseUrl = imageBaseUrl.endsWith('/')
    ? imageBaseUrl.slice(0, -1)
    : imageBaseUrl

  if (url.startsWith(baseUrl)) {
    // Extract the relative part
    const relativePath = url.slice(baseUrl.length)
    // Ensure it starts with /
    return relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  }

  // If URL doesn't match base URL, return as-is
  return url
}

export function isImageUrl(url: string): boolean {
  if (!url) return false

  const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.svg',
    '.bmp',
    '.ico',
  ]
  const lowerUrl = url.toLowerCase()

  return imageExtensions.some((ext) => lowerUrl.includes(ext))
}
