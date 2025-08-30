/**
 * Preprocesses markdown to extract and remove image/video attributes
 * Converts: ![alt](url){width=300 height=200}
 * To: ![alt](url)
 * Returns the processed markdown and a map of attributes
 */
export function preprocessMarkdownImages(markdown: string): {
  processedMarkdown: string
  imageAttributes: Map<string, { width?: number; height?: number }>
} {
  const imageAttributes = new Map<string, { width?: number; height?: number }>()

  // Match images/videos with attributes: ![alt](url){width=X height=Y}
  // This regex matches the image syntax followed by optional attributes
  const imageWithAttributesRegex = /!\[([^\]]*)\]\(([^)]+)\)(\{[^}]+\})?/g

  // Track image occurrences to create unique keys for duplicate URLs
  const imageOccurrences = new Map<string, number>()

  const processedMarkdown = markdown.replace(
    imageWithAttributesRegex,
    (match, alt, url, attributesStr) => {
      // Track occurrence count for this URL
      const count = imageOccurrences.get(url) || 0
      imageOccurrences.set(url, count + 1)

      // Create a unique key that includes the occurrence index
      const uniqueKey = count > 0 ? `${url}#${count}` : url

      // If no attributes, return as-is
      if (!attributesStr) {
        return match
      }

      // Parse attributes
      const attributes: { width?: number; height?: number } = {}

      const widthMatch = attributesStr.match(/width\s*=\s*(\d+)/)
      if (widthMatch) {
        attributes.width = parseInt(widthMatch[1], 10)
      }

      const heightMatch = attributesStr.match(/height\s*=\s*(\d+)/)
      if (heightMatch) {
        attributes.height = parseInt(heightMatch[1], 10)
      }

      // Store attributes with unique key (works for both images and videos)
      if (attributes.width || attributes.height) {
        imageAttributes.set(uniqueKey, attributes)
      }

      // Return image/video without attributes
      return `![${alt}](${url})`
    }
  )

  return { processedMarkdown, imageAttributes }
}
