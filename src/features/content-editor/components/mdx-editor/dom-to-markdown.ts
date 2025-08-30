// Convert DOM content back to markdown
export const domToMarkdown = (element: HTMLElement): string => {
  const lines: string[] = []

  const processNode = (node: Node, listLevel: number = 0): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ''
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return ''
    }

    const el = node as HTMLElement
    const tagName = el.tagName.toLowerCase()

    switch (tagName) {
      case 'p':
        return processChildren(el, listLevel) + '\n\n'

      case 'h1':
        return `# ${processChildren(el, listLevel)}\n\n`

      case 'h2':
        return `## ${processChildren(el, listLevel)}\n\n`

      case 'h3':
        return `### ${processChildren(el, listLevel)}\n\n`

      case 'h4':
        return `#### ${processChildren(el, listLevel)}\n\n`

      case 'h5':
        return `##### ${processChildren(el, listLevel)}\n\n`

      case 'h6':
        return `###### ${processChildren(el, listLevel)}\n\n`

      case 'strong':
      case 'b':
        return `**${processChildren(el, listLevel)}**`

      case 'em':
      case 'i':
        return `*${processChildren(el, listLevel)}*`

      case 'code': {
        // Check if it's inside a pre tag
        if (el.parentElement?.tagName.toLowerCase() === 'pre') {
          const language = el.className.match(/language-(\w+)/)?.[1] || ''
          return `\`\`\`${language}\n${processChildren(el, listLevel)}\n\`\`\``
        }
        return `\`${processChildren(el, listLevel)}\``
      }

      case 'pre':
        // If it contains a code element, let the code element handle it
        if (el.querySelector('code')) {
          return processChildren(el, listLevel) + '\n\n'
        }
        return `\`\`\`\n${processChildren(el, listLevel)}\n\`\`\`\n\n`

      case 'a': {
        const href = el.getAttribute('href') || ''
        return `[${processChildren(el, listLevel)}](${href})`
      }

      case 'img': {
        const src = el.getAttribute('src') || ''
        const alt = el.getAttribute('alt') || ''
        const dataVideoUrl = el.getAttribute('data-video-url')
        const isVideoPlaceholder =
          el.getAttribute('data-is-video-placeholder') === 'true'
        const dataWidth = el.getAttribute('data-width')
        const dataHeight = el.getAttribute('data-height')

        // Use data-video-url if this is a video placeholder
        const finalSrc = isVideoPlaceholder && dataVideoUrl ? dataVideoUrl : src

        // Build attributes string if width/height are present
        let attributes = ''
        if (dataWidth || dataHeight) {
          const attrs: string[] = []
          if (dataWidth) attrs.push(`width=${dataWidth}`)
          if (dataHeight) attrs.push(`height=${dataHeight}`)
          attributes = `{${attrs.join(' ')}}`
        }

        return `![${alt}](${finalSrc})${attributes}`
      }

      case 'div': {
        // Process children normally
        return processChildren(el, listLevel)
      }

      case 'ul':
      case 'ol': {
        // Check if this list is nested inside another list item
        let parentLI = el.parentElement
        while (parentLI && parentLI !== element) {
          if (parentLI.tagName.toLowerCase() === 'li') {
            // This is a nested list
            return processListItems(el, listLevel)
          }
          parentLI = parentLI.parentElement
        }

        // This is a top-level list
        return processListItems(el, listLevel) + '\n'
      }

      case 'li': {
        const parent = el.parentElement
        const isOrdered = parent?.tagName.toLowerCase() === 'ol'
        const index = parent ? Array.from(parent.children).indexOf(el) + 1 : 1
        const prefix = '  '.repeat(listLevel)
        const marker = isOrdered ? `${index}. ` : '- '

        // Process content and nested lists separately
        let content = ''
        let nestedLists = ''

        el.childNodes.forEach((child) => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            const childEl = child as HTMLElement
            const childTag = childEl.tagName.toLowerCase()

            if (childTag === 'ul' || childTag === 'ol') {
              // Process nested list with increased level
              nestedLists += processListItems(childEl, listLevel + 1)
            } else {
              // Process inline content
              content += processNode(child, listLevel)
            }
          } else if (child.nodeType === Node.TEXT_NODE) {
            content += child.textContent || ''
          }
        })

        // Trim and combine
        content = content.trim()
        const result = `${prefix}${marker}${content}\n${nestedLists}`
        return result
      }

      case 'blockquote':
        return (
          processChildren(el, listLevel)
            .split('\n')
            .filter((line) => line.trim())
            .map((line) => `> ${line}`)
            .join('\n') + '\n\n'
        )

      case 'hr':
        return '---\n\n'

      case 'table':
        return processTable(el) + '\n\n'

      case 'br':
        return '\n'

      default:
        return processChildren(el, listLevel)
    }
  }

  // Helper function to process child nodes
  const processChildren = (el: HTMLElement, listLevel: number): string => {
    return Array.from(el.childNodes)
      .map((child) => processNode(child, listLevel))
      .join('')
  }

  // Helper function to process list items
  const processListItems = (listEl: HTMLElement, listLevel: number): string => {
    let result = ''

    // Process all children, handling both li and nested ul/ol
    Array.from(listEl.children).forEach((child) => {
      const tagName = child.tagName.toLowerCase()

      if (tagName === 'li') {
        const processed = processNode(child, listLevel)
        // Filter out empty list items
        const trimmed = processed.trim()
        if (trimmed && !trimmed.match(/^(-|\d+\.)\s*$/)) {
          result += processed
        }
      } else if (tagName === 'ul' || tagName === 'ol') {
        // Handle invalid nested lists (ul/ol directly inside ul/ol)
        // Treat them as if they belong to the previous li
        const nestedContent = processListItems(
          child as HTMLElement,
          listLevel + 1
        )
        result += nestedContent
      }
    })

    return result
  }

  const processTable = (table: HTMLElement): string => {
    const rows: string[][] = []
    const headerRows: string[][] = []

    // Check for th elements directly in table
    const directHeaders = table.querySelectorAll(':scope > tr > th')
    if (directHeaders.length > 0) {
      const cells: string[] = []
      directHeaders.forEach((th) => {
        cells.push(th.textContent?.trim() || '')
      })
      headerRows.push(cells)
    }

    // Process all tr elements
    table.querySelectorAll('tr').forEach((tr) => {
      const thCells = tr.querySelectorAll('th')
      const tdCells = tr.querySelectorAll('td')

      if (thCells.length > 0 && headerRows.length === 0) {
        // This row contains headers
        const cells: string[] = []
        thCells.forEach((th) => {
          cells.push(th.textContent?.trim() || '')
        })
        headerRows.push(cells)
      } else if (tdCells.length > 0) {
        // This row contains data
        const cells: string[] = []
        tdCells.forEach((td) => {
          cells.push(td.textContent?.trim() || '')
        })
        rows.push(cells)
      }
    })

    // Build markdown table
    const allRows = [...headerRows, ...rows]
    if (allRows.length === 0) return ''

    const columnCount = Math.max(...allRows.map((row) => row.length))
    const separator = Array(columnCount).fill('---')

    let markdown = ''

    // Add header
    if (headerRows.length > 0) {
      markdown += '| ' + headerRows[0].join(' | ') + ' |\n'
      markdown += '| ' + separator.join(' | ') + ' |\n'

      // Add remaining header rows as body rows
      for (let i = 1; i < headerRows.length; i++) {
        markdown += '| ' + headerRows[i].join(' | ') + ' |\n'
      }
    }

    // Add body rows
    rows.forEach((row) => {
      markdown += '| ' + row.join(' | ') + ' |\n'
    })

    return markdown.trim()
  }

  // Process all child nodes
  Array.from(element.childNodes).forEach((node) => {
    const processed = processNode(node)
    if (processed) {
      lines.push(processed)
    }
  })

  // Clean up extra newlines
  const result = lines
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return result
}

// Sanitize HTML to prevent XSS while preserving structure
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div')
  div.innerHTML = html

  // Remove script tags and event handlers
  div.querySelectorAll('script').forEach((el) => el.remove())
  div.querySelectorAll('*').forEach((el) => {
    // Remove event handlers
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name)
      }
    }
  })

  return div.innerHTML
}
