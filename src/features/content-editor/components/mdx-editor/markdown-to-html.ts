import rehypeStringify from 'rehype-stringify'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import type { Node } from 'unist'
import { preprocessMarkdownImages } from '@/features/blog/api'
import { rehypeApplyImageAttributes } from '@/features/blog/api'
import { remarkVideoPlaceholder } from '@/features/content-editor/lib/remark-video-placeholder'

type Root = Node

// Remark plugin to apply stored image attributes
const createImageAttributesPlugin = (
  imageAttributes: Map<string, { width?: number; height?: number }>
) => {
  return () => {
    return (tree: Root) => {
      // Track image occurrences to match with preprocessed attributes
      const imageOccurrences = new Map<string, number>()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const visit = (node: any): void => {
        if (node.type === 'image' && node.url) {
          const url = node.url

          // Track occurrence count for this URL
          const count = imageOccurrences.get(url) || 0
          imageOccurrences.set(url, count + 1)

          // Create the same unique key used during preprocessing
          const uniqueKey = count > 0 ? `${url}#${count}` : url

          // Try to get attributes with unique key first, fallback to URL only
          const attributes =
            imageAttributes.get(uniqueKey) || imageAttributes.get(url)

          if (attributes) {
            node.data = {
              ...node.data,
              hProperties: {
                ...node.data?.hProperties,
                ...(attributes.width && {
                  'data-width': attributes.width.toString(),
                }),
                ...(attributes.height && {
                  'data-height': attributes.height.toString(),
                }),
              },
            }
          }
        }
        if (node.children) {
          node.children.forEach(visit)
        }
      }
      visit(tree)
    }
  }
}

// Convert markdown to HTML string for ContentEditable
export const renderMarkdownToHtml = async (
  markdown: string
): Promise<string> => {
  // Preprocess markdown to extract and remove image attributes
  const { processedMarkdown, imageAttributes } =
    preprocessMarkdownImages(markdown)

  // Process the cleaned markdown with attributes applied
  const result = await remark()
    .use(remarkGfm)
    .use(createImageAttributesPlugin(imageAttributes))
    .use(remarkVideoPlaceholder)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeApplyImageAttributes)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(processedMarkdown)

  return result.toString()
}
