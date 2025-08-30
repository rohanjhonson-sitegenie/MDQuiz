import type { Plugin } from 'unified'
import type { Node } from 'unist'
import { visit } from 'unist-util-visit'

interface ImageNode extends Node {
  type: 'image'
  url: string
  alt?: string | null
  title?: string | null
  data?: {
    hProperties?: Record<string, unknown>
  }
}

interface LinkNode extends Node {
  type: 'link'
  url: string
  title?: string | null
  children?: Node[]
}

/**
 * Remark plugin to preserve video embed URLs with custom protocols
 * This runs before ReactMarkdown's URL filtering, ensuring video URLs aren't stripped
 */
export const remarkVideoEmbed: Plugin = () => {
  return (tree) => {
    visit(tree, 'image', (node: ImageNode) => {
      // Check if the URL uses a video protocol
      if (node.url && node.url.match(/^(youtube|vimeo|loom|wistia):/)) {
        // Transform the node to have a special marker that won't be stripped
        // We'll use a data URL that encodes our video URL
        const videoUrl = node.url

        // Change the URL to something that will pass through ReactMarkdown's filter
        // We'll use a placeholder and store the real URL in data attributes
        node.url = `data:video/x-custom,${encodeURIComponent(videoUrl)}`

        // Store the original URL in data for our component to use
        // Add data properties for the HTML output
        const nodeWithData = node as ImageNode & {
          data?: { hProperties?: Record<string, string> }
        }
        nodeWithData.data = {
          ...nodeWithData.data,
          hProperties: {
            'data-video-url': videoUrl,
            'data-video-embed': 'true',
            alt: node.alt || '',
            // Preserve any existing data attributes (like width/height from remarkImageAttributes)
            ...nodeWithData.data?.hProperties,
          },
        }
      }
    })

    // Also handle link elements in case someone uses [Video](youtube:id) syntax
    visit(tree, 'link', (node: LinkNode) => {
      if (node.url && node.url.match(/^(youtube|vimeo|loom|wistia):/)) {
        const nodeWithData = node as LinkNode & {
          data?: { hProperties?: Record<string, string> }
        }
        nodeWithData.data = {
          ...nodeWithData.data,
          hProperties: {
            href: node.url,
          },
        }
      }
    })
  }
}
