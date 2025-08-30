export function isFullUrl(path: string): boolean {
  if (!path) return false
  return (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('youtube:') ||
    path.startsWith('vimeo:') ||
    path.startsWith('loom:') ||
    path.startsWith('wistia:')
  )
}

export function normalizeStoragePath(path: string): string {
  if (!path) return ''
  // Remove leading slash if present
  return path.startsWith('/') ? path.slice(1) : path
}

export function buildFallbackUrl(path: string, isDev: boolean): string {
  if (!path) return '/images/placeholder.jpg'

  const normalizedPath = normalizeStoragePath(path)

  if (isDev) {
    // In development, try to serve from local API
    return `${window.location.origin}/api/images/${normalizedPath}`
  }

  // In production without CDN, return placeholder
  return '/images/placeholder.jpg'
}

export function extractFilenameFromPath(path: string): string {
  if (!path) return ''
  const parts = path.split('/')
  return parts[parts.length - 1] || ''
}
