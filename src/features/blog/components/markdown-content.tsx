import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkEmoji from 'remark-emoji'
import remarkGfm from 'remark-gfm'
import { preprocessMarkdownImages } from '../lib/preprocess-markdown-images'
import { remarkVideoEmbed } from '../lib/remark-video-embed'
import { markdownComponents } from './markdown-components-config'

interface MarkdownContentProps {
  content: string
  className?: string
  components?: Partial<typeof markdownComponents>
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  components = {},
}) => {
  // Preprocess content to handle image attributes
  const { processedContent, imageAttributesPlugin } = useMemo(() => {
    const { processedMarkdown, imageAttributes } =
      preprocessMarkdownImages(content)

    // Create a remark plugin to apply the attributes
    const plugin = () => {
      return (tree: { children?: unknown[] }) => {
        // Track image occurrences to match with preprocessed attributes
        const imageOccurrences = new Map<string, number>()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const visit = (node: any) => {
          if (node.type === 'image') {
            const url = node.url || ''

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

    return {
      processedContent: processedMarkdown,
      imageAttributesPlugin: plugin,
    }
  }, [content])

  return (
    <ReactMarkdown
      remarkPlugins={[
        remarkGfm,
        remarkEmoji,
        imageAttributesPlugin,
        remarkVideoEmbed,
      ]}
      rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
      components={{
        ...markdownComponents,
        ...components, // Allow overriding specific components
      }}
      urlTransform={(url) => {
        // Allow video protocols
        if (url.match(/^(youtube|vimeo|loom|wistia):/)) {
          return url
        }
        // Default behavior for other URLs
        return url
      }}
    >
      {processedContent}
    </ReactMarkdown>
  )
}
