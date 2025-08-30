import { parse as parseYaml } from 'yaml'
import { parseDirectiveContent } from '../mdx-directives'

/**
 * Extract directives from raw markdown content using regex
 * This preserves the original YAML structure before AST processing
 */
export function extractDirectivesFromRaw(
  content: string
): Record<string, unknown> {
  const directives: Record<string, unknown> = {}
  const instanceCount: Record<string, number> = {}

  // Normalize line endings first
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Regex to match directive blocks: :::directive-name ... :::
  const directivePattern = /:::([a-z-]+)\n([\s\S]*?)(?:\n|^):::/gm

  let match
  while ((match = directivePattern.exec(normalizedContent)) !== null) {
    const [, directiveName, yamlContent] = match

    // Only process directives we recognize
    if (
      [
        'hero',
        'stats-bar',
        'features',
        'services',
        'about',
        'team',
        'pricing',
        'newsletter',
        'faq',
        'how-it-works',
        'footer',
      ].includes(directiveName)
    ) {
      try {
        const component = parseDirectiveContent(
          directiveName,
          yamlContent.trim()
        )
        // Generate unique instance key for multiple instances
        const currentCount = instanceCount[directiveName] || 0
        instanceCount[directiveName] = currentCount + 1
        const instanceKey =
          currentCount === 0
            ? directiveName
            : `${directiveName}-${currentCount + 1}`
        directives[instanceKey] = component
      } catch {
        // Silent error handling for directive parsing
      }
    }
  }

  return directives
}

/**
 * Replace directive blocks with HTML placeholders for inline rendering
 * This allows directives to be rendered in place within the markdown content
 */
export function replaceDirectiveBlocksWithPlaceholders(
  content: string
): string {
  // Normalize line endings first
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Replace directive blocks with HTML comment placeholders
  const directivePattern = /:::([a-z-]+)\n([\s\S]*?)(?:\n|^):::/gm
  const instanceCount: Record<string, number> = {}

  return normalizedContent
    .replace(directivePattern, (_match, directiveName) => {
      // Generate unique instance placeholders for multiple instances
      const currentCount = instanceCount[directiveName] || 0
      instanceCount[directiveName] = currentCount + 1
      const instanceSuffix = currentCount === 0 ? '' : `_${currentCount + 1}`
      return `<!-- DIRECTIVE_${directiveName.toUpperCase()}${instanceSuffix}_PLACEHOLDER -->`
    })
    .trim()
}

/**
 * Parse MDX frontmatter
 */
export function parseFrontmatter(content: string): {
  metadata: Record<string, unknown>
  content: string
} {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/)

  if (!frontmatterMatch) {
    return {
      metadata: {},
      content: content,
    }
  }

  const yamlContent = frontmatterMatch[1]

  try {
    // Normalize line endings to handle Windows/Unix differences
    const normalizedYaml = yamlContent
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
    const metadata = parseYaml(normalizedYaml)
    const markdownContent = content.slice(frontmatterMatch[0].length).trim()

    return {
      metadata: metadata || {},
      content: markdownContent,
    }
  } catch {
    // Silently handle YAML parsing errors and return empty metadata
    return {
      metadata: {},
      content: content,
    }
  }
}
