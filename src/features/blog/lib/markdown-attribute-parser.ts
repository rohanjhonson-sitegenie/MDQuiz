/**
 * Parser for markdown image/video attributes syntax: {width=300 height=200}
 */

export interface MarkdownAttributes {
  width?: number
  height?: number
}

/**
 * Parses attributes from markdown syntax like ![alt](url){width=300 height=200}
 * @param text The full markdown text containing the image/video reference
 * @returns Parsed attributes and the text without attributes
 */
export function parseMarkdownAttributes(text: string): {
  attributes: MarkdownAttributes
  textWithoutAttributes: string
} {
  // Match {width=X height=Y} pattern at the end of the string
  const attributePattern = /\{([^}]+)\}\s*$/
  const match = text.match(attributePattern)

  if (!match) {
    return {
      attributes: {},
      textWithoutAttributes: text,
    }
  }

  const attributeString = match[1]
  const textWithoutAttributes = text.substring(0, match.index).trim()

  // Parse individual attributes
  const attributes: MarkdownAttributes = {}

  // Match width=value
  const widthMatch = attributeString.match(/width\s*=\s*(\d+)/)
  if (widthMatch) {
    attributes.width = parseInt(widthMatch[1], 10)
  }

  // Match height=value
  const heightMatch = attributeString.match(/height\s*=\s*(\d+)/)
  if (heightMatch) {
    attributes.height = parseInt(heightMatch[1], 10)
  }

  return {
    attributes,
    textWithoutAttributes,
  }
}

/**
 * Extracts attributes from a markdown image/video node's raw value
 * This is used within remark plugins where we have access to the raw markdown
 */
export function extractAttributesFromNode(
  nodeValue: string | undefined
): MarkdownAttributes {
  if (!nodeValue) return {}

  const { attributes } = parseMarkdownAttributes(nodeValue)
  return attributes
}
