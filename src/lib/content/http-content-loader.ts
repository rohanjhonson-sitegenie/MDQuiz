import { parseFrontmatter } from './index'
import {
  extractDirectivesFromRaw,
  replaceDirectiveBlocksWithPlaceholders,
} from './index'

/**
 * Build content URL for HTTP requests
 * Single source of truth for content path construction
 */
export function buildContentURL(contentPath: string, locale: string): string {
  const normalizedLocale = locale === 'zh-CN' ? 'zh-CN' : 'en'

  if (contentPath.includes('/')) {
    // For paths like 'landing/footer', structure is: /content/landing/en/footer.mdx
    const [folder, filename] = contentPath.split('/')
    return `/content/${folder}/${normalizedLocale}/${filename}.mdx`
  } else {
    // For simple paths, structure is: /content/en/path.mdx
    return `/content/${normalizedLocale}/${contentPath}.mdx`
  }
}

/**
 * Load MDX content via HTTP fetch
 * Replaces complex import system with simple HTTP requests
 */
export async function loadMDXContentViaHTTP(
  contentPath: string,
  locale: string = 'en'
): Promise<{
  content: string
  metadata: Record<string, unknown>
  directives?: Record<string, unknown>
}> {
  try {
    const url = buildContentURL(contentPath, locale)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status}`)
    }

    const markdownContent = await response.text()

    // Parse frontmatter using existing parser (100% reuse)
    const parsed = parseFrontmatter(markdownContent)

    // Extract directives from raw content before processing (100% reuse)
    const directives = extractDirectivesFromRaw(parsed.content)

    // Replace directive blocks with HTML placeholders for inline rendering (100% reuse)
    const finalContent = replaceDirectiveBlocksWithPlaceholders(parsed.content)

    return {
      content: finalContent,
      metadata: parsed.metadata,
      directives,
    }
  } catch {
    // Silent error handling matching existing patterns (100% reuse)
    return {
      content: 'Content temporarily unavailable. Please try again later.',
      metadata: {
        title: 'Content',
        subtitle: 'Content loading error',
        description: 'Content loading error',
      },
    }
  }
}
