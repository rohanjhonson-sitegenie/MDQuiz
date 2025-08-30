/**
 * Sanitization utilities for kanban data
 */

/**
 * Sanitizes text input to prevent XSS attacks
 * Removes potentially dangerous HTML/script content while preserving safe text
 */
export function sanitizeText(input: string): string {
  if (!input) return ''

  // Remove any HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')

  // Remove any script-like content
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')

  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')

  return sanitized.trim()
}

/**
 * Validates and sanitizes a URL
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''

  try {
    const parsed = new URL(url)
    // Only allow http(s) protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }
    return parsed.toString()
  } catch {
    return ''
  }
}

/**
 * Sanitizes color hex values
 */
export function sanitizeColor(color: string): string {
  if (!color) return ''

  // Ensure it's a valid hex color
  const hexRegex = /^#[0-9A-F]{6}$/i
  return hexRegex.test(color) ? color : ''
}
