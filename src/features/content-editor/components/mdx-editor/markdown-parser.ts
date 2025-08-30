import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'

// Parse markdown to AST
export const parseMarkdown = (markdown: string) => {
  const processor = unified().use(remarkParse).use(remarkGfm)

  return processor.parse(markdown)
}

// Convert markdown to HTML for rendering
export const markdownToHtml = async (markdown: string): Promise<string> => {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(markdown)

  return result.toString()
}

// Convert AST back to markdown
export const astToMarkdown = (ast: unknown): string => {
  const processor = unified().use(remarkStringify).use(remarkGfm)

  return processor.stringify(ast as Parameters<typeof processor.stringify>[0])
}

// Apply formatting to text
export const applyMarkdownFormat = (
  text: string,
  selection: { start: number; end: number },
  _format: string,
  prefix: string,
  suffix: string = ''
): { text: string; newSelection: { start: number; end: number } } => {
  const before = text.substring(0, selection.start)
  const selected = text.substring(selection.start, selection.end)
  const after = text.substring(selection.end)

  // Check if already formatted
  const prefixBefore = before.substring(before.length - prefix.length)
  const suffixAfter = after.substring(0, suffix.length)

  if (prefixBefore === prefix && suffixAfter === suffix) {
    // Remove formatting
    const newText =
      before.substring(0, before.length - prefix.length) +
      selected +
      after.substring(suffix.length)
    return {
      text: newText,
      newSelection: {
        start: selection.start - prefix.length,
        end: selection.end - prefix.length,
      },
    }
  }

  // Add formatting
  const newText = before + prefix + selected + suffix + after
  return {
    text: newText,
    newSelection: {
      start: selection.start + prefix.length,
      end: selection.end + prefix.length,
    },
  }
}

// Insert text at position
export const insertAtPosition = (
  text: string,
  position: number,
  insertion: string
): { text: string; newPosition: number } => {
  const before = text.substring(0, position)
  const after = text.substring(position)

  return {
    text: before + insertion + after,
    newPosition: position + insertion.length,
  }
}

// Format selection as link
export const formatAsLink = (
  text: string,
  selection: { start: number; end: number },
  url: string
): { text: string; newSelection: { start: number; end: number } } => {
  const before = text.substring(0, selection.start)
  const selected = text.substring(selection.start, selection.end) || 'link'
  const after = text.substring(selection.end)

  const formatted = `[${selected}](${url})`
  const newText = before + formatted + after

  return {
    text: newText,
    newSelection: {
      start: selection.start + 1,
      end: selection.start + 1 + selected.length,
    },
  }
}

// Format selection as image
export const formatAsImage = (
  text: string,
  position: number,
  url: string,
  alt: string = 'image',
  width?: number,
  height?: number
): { text: string; newPosition: number } => {
  let formatted = `![${alt}](${url})`

  // Add width/height attributes if provided
  if (width || height) {
    const attrs: string[] = []
    if (width) attrs.push(`width=${width}`)
    if (height) attrs.push(`height=${height}`)
    formatted += `{${attrs.join(' ')}}`
  }

  return insertAtPosition(text, position, formatted)
}

// Format selection as video
export const formatAsVideo = (
  text: string,
  position: number,
  url: string,
  title: string = 'Video',
  width?: number,
  height?: number
): { text: string; newPosition: number } => {
  let formatted = `![${title}](${url})`

  // Add width/height attributes if provided
  if (width || height) {
    const attrs: string[] = []
    if (width) attrs.push(`width=${width}`)
    if (height) attrs.push(`height=${height}`)
    formatted += `{${attrs.join(' ')}}`
  }

  return insertAtPosition(text, position, formatted)
}

// Toggle list formatting
export const toggleList = (
  text: string,
  selection: { start: number; end: number },
  ordered: boolean = false
): { text: string; newSelection: { start: number; end: number } } => {
  const lines = text.split('\n')
  const startLine = text.substring(0, selection.start).split('\n').length - 1
  const endLine = text.substring(0, selection.end).split('\n').length - 1

  const prefix = ordered ? '1. ' : '- '
  const pattern = ordered ? /^(\s*)\d+\.\s/ : /^(\s*)-\s/
  const anyListPattern = /^(\s*)[-*+]\s|^(\s*)\d+\.\s/

  let modified = false
  for (let i = startLine; i <= endLine; i++) {
    const match = lines[i].match(pattern)
    if (match) {
      // Remove list marker, preserving indentation
      lines[i] = match[1] + lines[i].substring(match[0].length)
      modified = true
    } else if (!modified) {
      // Check if line already has a different list type
      const existingMatch = lines[i].match(anyListPattern)
      if (existingMatch) {
        // Replace with new list type, preserving indentation
        const indent = existingMatch[1] || existingMatch[2] || ''
        lines[i] = indent + prefix + lines[i].substring(existingMatch[0].length)
      } else {
        // Add list marker, preserving any existing indentation
        const leadingWhitespace = lines[i].match(/^(\s*)/)?.[1] || ''
        lines[i] = leadingWhitespace + prefix + lines[i].trimStart()
      }
    }
  }

  const newText = lines.join('\n')
  return {
    text: newText,
    newSelection: selection, // Keep selection as is
  }
}

// Indent list items
export const indentList = (
  text: string,
  selection: { start: number; end: number },
  outdent: boolean = false
): { text: string; newSelection: { start: number; end: number } } => {
  const lines = text.split('\n')
  const startLine = text.substring(0, selection.start).split('\n').length - 1
  const endLine = text.substring(0, selection.end).split('\n').length - 1

  const indent = '  ' // Two spaces for nested lists

  for (let i = startLine; i <= endLine; i++) {
    const listMatch = lines[i].match(/^(\s*)([-*+]|\d+\.)\s(.*)/)
    if (listMatch) {
      const currentIndent = listMatch[1]
      const marker = listMatch[2]
      const content = listMatch[3]

      if (outdent && currentIndent.length >= indent.length) {
        // Remove one level of indentation
        lines[i] =
          currentIndent.substring(indent.length) + marker + ' ' + content
      } else if (!outdent) {
        // Add one level of indentation
        lines[i] = indent + currentIndent + marker + ' ' + content
      }
    }
  }

  const newText = lines.join('\n')
  return {
    text: newText,
    newSelection: selection,
  }
}

// Insert table
export const insertTable = (
  text: string,
  position: number,
  rows: number = 3,
  cols: number = 3
): { text: string; newPosition: number } => {
  const header = '| ' + Array(cols).fill('Header').join(' | ') + ' |'
  const separator = '| ' + Array(cols).fill('---').join(' | ') + ' |'
  const row = '| ' + Array(cols).fill('Cell').join(' | ') + ' |'

  const table = ['', header, separator, ...Array(rows - 1).fill(row), ''].join(
    '\n'
  )

  return insertAtPosition(text, position, table)
}

// Insert code block
export const insertCodeBlock = (
  text: string,
  position: number,
  language: string = ''
): { text: string; newPosition: number } => {
  const codeBlock = `\n\`\`\`${language}\n\n\`\`\`\n`
  const result = insertAtPosition(text, position, codeBlock)

  // Position cursor inside code block
  return {
    text: result.text,
    newPosition: position + 4 + language.length,
  }
}
