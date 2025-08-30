import type { Plugin } from 'unified'
import type { Node } from 'unist'
import { visit } from 'unist-util-visit'

interface ElementNode extends Node {
  type: 'element'
  tagName: string
  properties?: Record<string, unknown>
  children?: Node[]
}

/**
 * Rehype plugin to apply width/height from data attributes to actual img attributes
 * Transforms data-width and data-height into width and height attributes
 */
export const rehypeApplyImageAttributes: Plugin = () => {
  return (tree) => {
    visit(tree, 'element', (node: ElementNode) => {
      if (node.tagName === 'img' && node.properties) {
        const dataWidth =
          node.properties['dataWidth'] || node.properties['data-width']
        const dataHeight =
          node.properties['dataHeight'] || node.properties['data-height']

        if (dataWidth) {
          node.properties.width = dataWidth
          // Also add to style for better control
          const currentStyle = (node.properties.style as string) || ''
          node.properties.style = `${currentStyle}${currentStyle ? '; ' : ''}width: ${dataWidth}px`
        }

        if (dataHeight) {
          node.properties.height = dataHeight
          // Also add to style for better control
          const currentStyle = (node.properties.style as string) || ''
          node.properties.style = `${currentStyle}${currentStyle ? '; ' : ''}height: ${dataHeight}px`
        }
      }
    })
  }
}
