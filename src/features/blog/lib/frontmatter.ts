import { z } from 'zod'
import type { BlogMetadata } from '@/types/app.types'

const blogMetadataSchema = z.object({
  title: z.string(),
  excerpt: z.string().optional(),
  author: z.string(),
  date: z.string(),
  tags: z.array(z.string()).optional().default([]),
  featuredImage: z.string().optional(),
  draft: z.boolean().optional().default(false),
})

export interface ParsedMarkdown {
  content: string
  metadata: BlogMetadata
  excerpt?: string
}

export function parseFrontmatter(markdownContent: string): ParsedMarkdown {
  // Simple frontmatter parser that works in the browser
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = markdownContent.match(frontmatterRegex)

  if (!match) {
    // No frontmatter found, return content as-is with default metadata
    const metadata = blogMetadataSchema.parse({
      title: 'Untitled',
      excerpt: extractExcerpt(markdownContent),
      author: 'Anonymous',
      date: new Date().toISOString(),
      tags: [],
      draft: false,
    })

    return {
      content: markdownContent,
      metadata,
    }
  }

  const [, frontmatterText, content] = match

  // Parse YAML-like frontmatter (simple key-value pairs)
  const data: Record<string, string | string[]> = {}
  const lines = frontmatterText.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1) continue

    const key = trimmed.substring(0, colonIndex).trim()
    let value: string | string[] = trimmed.substring(colonIndex + 1).trim()

    // Handle arrays (simple format: [item1, item2, item3])
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim())
    }

    // Remove quotes from strings
    if (
      typeof value === 'string' &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1)
    }

    data[key] = value
  }

  // Parse and validate metadata
  const metadata = blogMetadataSchema.parse({
    ...data,
    // Ensure date is a string
    date: data.date
      ? new Date(
          Array.isArray(data.date) ? data.date[0] : data.date
        ).toISOString()
      : new Date().toISOString(),
  })

  return {
    content,
    metadata,
    excerpt: Array.isArray(data.excerpt)
      ? data.excerpt[0]
      : data.excerpt || metadata.excerpt,
  }
}

export function extractExcerpt(
  content: string,
  maxLength: number = 160
): string {
  // Remove markdown syntax
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/```[^`]*```/g, '') // Code blocks
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/>\s+/g, '') // Blockquotes
    .replace(/\n{2,}/g, ' ') // Multiple newlines
    .trim()

  if (plainText.length <= maxLength) {
    return plainText
  }

  return plainText.substring(0, maxLength).trim() + '...'
}
