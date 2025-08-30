import type { Plugin } from 'unified'
import type { Node } from 'unist'
import { visit } from 'unist-util-visit'
import { parseVideoUrl } from '@/features/blog/api'

interface ImageNode extends Node {
  type: 'image'
  url: string
  alt?: string | null
  title?: string | null
  data?: {
    hProperties?: Record<string, string | number>
  }
}

/**
 * Remark plugin to transform video URLs into placeholder images for the editor
 * This simplifies the editor by avoiding iframe rendering while preserving video data
 */
export const remarkVideoPlaceholder: Plugin = () => {
  return (tree) => {
    visit(tree, 'image', (node: ImageNode) => {
      // Check if this is a video URL
      const videoInfo = parseVideoUrl(node.url)

      if (videoInfo.provider && videoInfo.videoId) {
        // Transform the node to include video metadata
        const nodeWithData = node

        // Generate a placeholder thumbnail URL based on the provider
        let placeholderUrl = ''

        switch (videoInfo.provider) {
          case 'youtube':
            placeholderUrl = `https://img.youtube.com/vi/${videoInfo.videoId}/maxresdefault.jpg`
            break
          case 'vimeo':
            // Vimeo thumbnails require API calls, so we'll use a generic placeholder
            placeholderUrl = `https://placehold.co/1280x720/1a1a1a/666666?text=${encodeURIComponent('Vimeo Video')}`
            break
          case 'loom':
            placeholderUrl = `https://placehold.co/1280x720/5850ec/ffffff?text=${encodeURIComponent('Loom Video')}`
            break
          case 'wistia':
            placeholderUrl = `https://placehold.co/1280x720/54bbff/ffffff?text=${encodeURIComponent('Wistia Video')}`
            break
        }

        // Store the original video URL and metadata
        // Preserve any existing data attributes (like width/height)
        const existingProperties = nodeWithData.data?.hProperties || {}
        const dataWidth =
          existingProperties['data-width'] || existingProperties['dataWidth']
        const dataHeight =
          existingProperties['data-height'] || existingProperties['dataHeight']

        // Build style string with width/height if available
        const styles: string[] = ['cursor: pointer', 'opacity: 0.8']
        if (dataWidth) {
          styles.push(`width: ${dataWidth}px`)
        }
        if (dataHeight) {
          styles.push(`height: ${dataHeight}px`)
        }

        nodeWithData.data = {
          ...nodeWithData.data,
          hProperties: {
            ...existingProperties,
            'data-video-url': node.url,
            'data-video-provider': videoInfo.provider,
            'data-video-id': videoInfo.videoId,
            'data-is-video-placeholder': 'true',
            alt: node.alt || `${videoInfo.provider} video`,
            src: placeholderUrl,
            style: styles.join('; '),
            // Preserve width/height as actual attributes too
            ...(dataWidth && { width: dataWidth }),
            ...(dataHeight && { height: dataHeight }),
          },
        }

        // Update the URL to the placeholder
        node.url = placeholderUrl
      }
    })
  }
}
