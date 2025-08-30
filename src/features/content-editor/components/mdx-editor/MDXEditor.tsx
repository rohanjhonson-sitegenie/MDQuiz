import React, { useState, useCallback, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { parseVideoUrl, convertInternalUrlToActual } from '@/features/blog/api'
import { ContentEditable } from './ContentEditable'
import { ContextMenu } from './ContextMenu'
import { EditorToolbar } from './EditorToolbar'
import { CodeBlockDialog } from './dialogs/CodeBlockDialog'
import { ImageDialog } from './dialogs/ImageDialog'
import { LinkDialog } from './dialogs/LinkDialog'
import { VideoDialog } from './dialogs/VideoDialog'
import {
  applyMarkdownFormat,
  formatAsLink,
  formatAsImage,
  formatAsVideo,
  toggleList,
  indentList,
  insertTable,
  insertCodeBlock,
  insertAtPosition,
} from './markdown-parser'
import type { MDXEditorProps, EditorSelection } from './types'
import { useEditorState } from './useEditorState'
import { transformImageUrl, extractRelativePath } from './utils/url-transformer'

export const MDXEditor: React.FC<MDXEditorProps> = ({
  value,
  onChange,
  onImageUpload,
  imageBaseUrl,
  className,
  placeholder,
}) => {
  const {
    markdown,
    html,
    isSourceMode,
    updateMarkdown,
    updateHtml,
    toggleSourceMode,
  } = useEditorState(value, onChange)

  const [selection, setSelection] = useState<EditorSelection | null>(null)
  const [history, setHistory] = useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Dialog states
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [editingImage, setEditingImage] = useState<HTMLImageElement | null>(
    null
  )
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [showCodeBlockDialog, setShowCodeBlockDialog] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [editingLink, setEditingLink] = useState<{
    url: string
    text: string
  } | null>(null)

  // Store cursor position before opening dialogs
  const savedSelectionRef = useRef<Range | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // Save current selection before opening dialogs
  const saveSelection = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange()
    }
  }, [])

  // Shared function to insert HTML content at cursor position in visual mode
  const insertHtmlAtCursor = useCallback(
    (html: string) => {
      // Find the contentEditable element
      const contentEditable = editorRef.current?.querySelector(
        '[contenteditable="true"]'
      ) as HTMLDivElement

      if (!contentEditable) {
        // ContentEditable not found
        return false
      }

      // Focus the contentEditable to ensure selection is within it
      contentEditable.focus()

      // Try to restore saved selection first
      if (savedSelectionRef.current) {
        const selection = window.getSelection()
        if (selection) {
          try {
            selection.removeAllRanges()
            selection.addRange(savedSelectionRef.current)
            savedSelectionRef.current = null // Clear it after use
          } catch (_e) {
            // If restoration fails, fall through to default behavior
          }
        }
      }

      // Get current selection
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        // If no selection, create one at the end of content
        const newSelection = window.getSelection()
        if (!newSelection) return false

        const range = document.createRange()
        range.selectNodeContents(contentEditable)
        range.collapse(false) // Collapse to end
        newSelection.removeAllRanges()
        newSelection.addRange(range)
      }

      const currentSelection = window.getSelection()
      if (!currentSelection || currentSelection.rangeCount === 0) return false

      const range = currentSelection.getRangeAt(0)

      // Make sure the selection is within the contentEditable
      if (!contentEditable.contains(range.commonAncestorContainer)) {
        const newRange = document.createRange()
        newRange.selectNodeContents(contentEditable)
        newRange.collapse(false)
        currentSelection.removeAllRanges()
        currentSelection.addRange(newRange)
      }

      // Try using execCommand for better compatibility
      // First delete any selected content
      if (!range.collapsed) {
        document.execCommand('delete', false)
      }

      // Insert the HTML using execCommand
      // This should properly trigger all the necessary events
      const success = document.execCommand('insertHTML', false, html)

      if (!success) {
        // Fallback to manual insertion if execCommand fails
        range.deleteContents()
        const fragment = document.createRange().createContextualFragment(html)
        range.insertNode(fragment)
        range.collapse(false)
        currentSelection.removeAllRanges()
        currentSelection.addRange(range)

        // Manually trigger input event
        const inputEvent = new Event('input', {
          bubbles: true,
          cancelable: true,
        })
        contentEditable.dispatchEvent(inputEvent)
      }

      return true
    },
    [editorRef]
  )

  // Wrapped updateMarkdown that includes formatting context
  const updateMarkdownWithContext = useCallback(
    (text: string, isFormatting: boolean = false) => {
      updateMarkdown(text, { isFormatting })
    },
    [updateMarkdown]
  )

  // Handle formatting commands
  const handleFormat = useCallback(
    (action: string, value?: string | number | boolean) => {
      if (isSourceMode) {
        // Handle formatting in source mode
        const textarea = document.querySelector(
          'textarea'
        ) as HTMLTextAreaElement
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = textarea.value

        let result: {
          text: string
          newSelection?: { start: number; end: number }
          newPosition?: number
        }

        switch (action) {
          case 'bold':
            result = applyMarkdownFormat(
              text,
              { start, end },
              'bold',
              '**',
              '**'
            )
            break
          case 'italic':
            result = applyMarkdownFormat(
              text,
              { start, end },
              'italic',
              '*',
              '*'
            )
            break
          case 'code':
            result = applyMarkdownFormat(text, { start, end }, 'code', '`', '`')
            break
          case 'heading': {
            const level = typeof value === 'number' ? value : 1
            const prefix = '#'.repeat(level) + ' '
            result = applyMarkdownFormat(
              text,
              { start, end },
              'heading',
              prefix
            )
            break
          }
          case 'list':
            result = toggleList(text, { start, end }, false)
            break
          case 'ordered-list':
            result = toggleList(text, { start, end }, true)
            break
          case 'quote':
            result = applyMarkdownFormat(text, { start, end }, 'quote', '> ')
            break
          case 'link':
            setShowLinkDialog(true)
            return
          case 'image':
            setShowImageDialog(true)
            return
          case 'video':
            setShowVideoDialog(true)
            return
          case 'table': {
            const tableParams =
              typeof value === 'object' &&
              value !== null &&
              'rows' in value &&
              'cols' in value
                ? (value as { rows: number; cols: number })
                : { rows: 3, cols: 3 }
            result = insertTable(
              text,
              start,
              tableParams.rows,
              tableParams.cols
            )
            break
          }
          case 'code-block':
            setShowCodeBlockDialog(true)
            return
          case 'hr':
            result = insertAtPosition(text, start, '\n\n---\n\n')
            break
          case 'undo':
            if (historyIndex > 0) {
              const newIndex = historyIndex - 1
              setHistoryIndex(newIndex)
              updateMarkdownWithContext(history[newIndex], true)
            }
            return
          case 'redo':
            if (historyIndex < history.length - 1) {
              const newIndex = historyIndex + 1
              setHistoryIndex(newIndex)
              updateMarkdownWithContext(history[newIndex], true)
            }
            return
          default:
            return
        }

        updateMarkdownWithContext(result.text, true)

        // Update history
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(result.text)
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)

        // Restore selection
        setTimeout(() => {
          if (result.newSelection) {
            textarea.setSelectionRange(
              result.newSelection.start,
              result.newSelection.end
            )
          } else if (result.newPosition) {
            textarea.setSelectionRange(result.newPosition, result.newPosition)
          }
          textarea.focus()
        }, 0)
      } else {
        // Handle formatting in visual mode
        switch (action) {
          case 'bold':
            document.execCommand('bold', false)
            break
          case 'italic':
            document.execCommand('italic', false)
            break
          case 'code': {
            // Wrap selection in code tags
            const codeHtml = `<code>${window.getSelection()?.toString() || 'code'}</code>`
            document.execCommand('insertHTML', false, codeHtml)
            break
          }
          case 'heading': {
            const level = typeof value === 'number' ? value : 1
            document.execCommand('formatBlock', false, `h${level}`)
            break
          }
          case 'list':
            document.execCommand('insertUnorderedList', false)
            break
          case 'ordered-list':
            document.execCommand('insertOrderedList', false)
            break
          case 'quote':
            document.execCommand('formatBlock', false, 'blockquote')
            break
          case 'link':
            setShowLinkDialog(true)
            break
          case 'image':
            saveSelection()
            setShowImageDialog(true)
            break
          case 'video':
            saveSelection()
            setShowVideoDialog(true)
            break
          case 'table': {
            const tableParams =
              typeof value === 'object' &&
              value !== null &&
              'rows' in value &&
              'cols' in value
                ? (value as { rows: number; cols: number })
                : { rows: 3, cols: 3 }

            const headerRow =
              '<tr>' +
              Array(tableParams.cols).fill('<th>Header</th>').join('') +
              '</tr>'
            const dataRows = Array(tableParams.rows - 1)
              .fill(
                '<tr>' +
                  Array(tableParams.cols).fill('<td>Cell</td>').join('') +
                  '</tr>'
              )
              .join('')

            const tableHtml = `<table>${headerRow}${dataRows}</table>`
            document.execCommand('insertHTML', false, tableHtml)
            break
          }
          case 'code-block':
            setShowCodeBlockDialog(true)
            break
          case 'hr':
            document.execCommand('insertHTML', false, '<hr>')
            break
          case 'undo':
            if (historyIndex > 0) {
              const newIndex = historyIndex - 1
              setHistoryIndex(newIndex)
              updateMarkdown(history[newIndex])
            }
            break
          case 'redo':
            if (historyIndex < history.length - 1) {
              const newIndex = historyIndex + 1
              setHistoryIndex(newIndex)
              updateMarkdown(history[newIndex])
            }
            break
        }
      }
    },
    [
      isSourceMode,
      updateMarkdownWithContext,
      updateMarkdown,
      history,
      historyIndex,
      saveSelection,
    ]
  )

  // Handle link insertion
  const handleLinkInsert = useCallback(
    (url: string, text: string) => {
      if (isSourceMode) {
        const textarea = document.querySelector(
          'textarea'
        ) as HTMLTextAreaElement
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const currentText = textarea.value

        const result = formatAsLink(currentText, { start, end }, url)
        updateMarkdownWithContext(result.text, true)

        setTimeout(() => {
          textarea.setSelectionRange(
            result.newSelection.start,
            result.newSelection.end
          )
          textarea.focus()
        }, 0)
      } else {
        const linkHtml = `<a href="${url}">${text || 'link'}</a>`
        document.execCommand('insertHTML', false, linkHtml)
      }
      setEditingLink(null)
    },
    [isSourceMode, updateMarkdownWithContext]
  )

  // Handle link editing
  const handleEditLink = useCallback((url: string, text: string) => {
    setEditingLink({ url, text })
    setShowLinkDialog(true)
  }, [])

  // Handle image editing
  const handleEditImage = useCallback((imgElement: HTMLImageElement) => {
    setEditingImage(imgElement)
    setShowImageDialog(true)
  }, [])

  // Handle video editing
  const handleEditVideo = useCallback((imgElement: HTMLImageElement) => {
    const videoUrl = imgElement.getAttribute('data-video-url')
    if (videoUrl) {
      // Store the element for later replacement
      setEditingImage(imgElement)
      setShowVideoDialog(true)
    }
  }, [])

  // Memoize initial video data to prevent unnecessary re-renders
  const initialVideoData = useMemo(() => {
    if (
      editingImage &&
      editingImage.getAttribute('data-is-video-placeholder') === 'true'
    ) {
      return {
        url: convertInternalUrlToActual(
          editingImage.getAttribute('data-video-url') || ''
        ),
        title: editingImage.alt,
        width: editingImage.getAttribute('data-width')
          ? parseInt(editingImage.getAttribute('data-width')!)
          : undefined,
        height: editingImage.getAttribute('data-height')
          ? parseInt(editingImage.getAttribute('data-height')!)
          : undefined,
      }
    }
    return undefined
  }, [editingImage])

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
    if (!isFullscreen && editorRef.current) {
      // Focus editor when entering fullscreen
      setTimeout(() => {
        const contentEditable =
          editorRef.current?.querySelector('[contenteditable]')
        if (contentEditable instanceof HTMLElement) {
          contentEditable.focus()
        }
      }, 100)
    }
  }, [isFullscreen])

  // Handle image insertion
  const handleImageInsert = useCallback(
    (url: string, alt: string, width?: number, height?: number) => {
      // Extract relative path if it's a full CDN URL
      const relativeUrl = extractRelativePath(url, imageBaseUrl)

      // Transform URL for display if imageBaseUrl is provided
      const displayUrl = transformImageUrl(relativeUrl, imageBaseUrl)

      // If we're editing an existing image, update it
      if (editingImage) {
        editingImage.src = displayUrl
        editingImage.alt = alt
        editingImage.setAttribute('data-original-src', relativeUrl)

        if (width) {
          editingImage.setAttribute('data-width', width.toString())
          editingImage.setAttribute('width', width.toString())
          editingImage.style.width = `${width}px`
        } else {
          editingImage.removeAttribute('data-width')
          editingImage.removeAttribute('width')
          editingImage.style.width = ''
        }

        if (height) {
          editingImage.setAttribute('data-height', height.toString())
          editingImage.setAttribute('height', height.toString())
          editingImage.style.height = `${height}px`
        } else {
          editingImage.removeAttribute('data-height')
          editingImage.removeAttribute('height')
          editingImage.style.height = ''
        }

        // Trigger content change on the contentEditable container
        const contentEditable = editorRef.current?.querySelector(
          '[contenteditable="true"]'
        )
        if (contentEditable) {
          const event = new Event('input', { bubbles: true, cancelable: true })
          contentEditable.dispatchEvent(event)
        }

        setEditingImage(null)
        return
      }

      if (isSourceMode) {
        const textarea = document.querySelector(
          'textarea'
        ) as HTMLTextAreaElement
        if (!textarea) return

        const position = textarea.selectionStart
        const currentText = textarea.value

        // Always use relative URL in markdown for portability
        const result = formatAsImage(
          currentText,
          position,
          relativeUrl,
          alt,
          width,
          height
        )
        updateMarkdownWithContext(result.text, true)

        setTimeout(() => {
          textarea.setSelectionRange(result.newPosition, result.newPosition)
          textarea.focus()
        }, 0)
      } else {
        // Insert image in visual mode with transformed URL for display
        let imgHtml = `<img src="${displayUrl}" alt="${alt}" data-original-src="${relativeUrl}"`
        if (width) {
          imgHtml += ` data-width="${width}" width="${width}" style="width: ${width}px"`
        }
        if (height) {
          imgHtml += ` data-height="${height}" height="${height}" style="height: ${height}px"`
        }
        imgHtml += ' />'

        // Use shared insertion function
        const success = insertHtmlAtCursor(imgHtml)

        if (success) {
          // Update history after insertion
          setTimeout(() => {
            const newHistory = history.slice(0, historyIndex + 1)
            newHistory.push(markdown)
            setHistory(newHistory)
            setHistoryIndex(newHistory.length - 1)
          }, 100)
        }
      }
    },
    [
      isSourceMode,
      updateMarkdownWithContext,
      history,
      historyIndex,
      markdown,
      imageBaseUrl,
      insertHtmlAtCursor,
      editingImage,
    ]
  )

  // Handle video insertion/editing
  const handleVideoInsert = useCallback(
    (url: string, title: string, width?: number, height?: number) => {
      // Check if we're editing an existing video
      const isEditingVideo =
        editingImage &&
        editingImage.getAttribute('data-is-video-placeholder') === 'true'
      if (isSourceMode) {
        const textarea = document.querySelector(
          'textarea'
        ) as HTMLTextAreaElement
        if (!textarea) return

        const position = textarea.selectionStart
        const currentText = textarea.value

        const result = formatAsVideo(
          currentText,
          position,
          url,
          title,
          width,
          height
        )
        updateMarkdownWithContext(result.text, true)

        // Update history
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(result.text)
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)

        setTimeout(() => {
          textarea.setSelectionRange(result.newPosition, result.newPosition)
          textarea.focus()
        }, 0)
      } else {
        // In visual mode, insert video at cursor position (similar to image insertion)

        // Parse the video URL to get provider info
        const videoInfo = parseVideoUrl(url)
        if (!videoInfo.provider || !videoInfo.videoId) {
          // Invalid video URL format
          return
        }

        // Generate placeholder thumbnail URL based on provider
        let placeholderUrl = ''
        switch (videoInfo.provider) {
          case 'youtube':
            placeholderUrl = `https://img.youtube.com/vi/${videoInfo.videoId}/maxresdefault.jpg`
            break
          case 'vimeo':
            placeholderUrl = `https://placehold.co/1280x720/1a1a1a/666666?text=${encodeURIComponent('Vimeo Video')}`
            break
          case 'loom':
            placeholderUrl = `https://placehold.co/1280x720/5850ec/ffffff?text=${encodeURIComponent('Loom Video')}`
            break
          case 'wistia':
            placeholderUrl = `https://placehold.co/1280x720/54bbff/ffffff?text=${encodeURIComponent('Wistia Video')}`
            break
        }

        // Create video placeholder HTML
        let videoHtml = `<img src="${placeholderUrl}" alt="${title}" data-video-url="${url}" data-video-provider="${videoInfo.provider}" data-video-id="${videoInfo.videoId}" data-is-video-placeholder="true"`
        if (width) videoHtml += ` data-width="${width}"`
        if (height) videoHtml += ` data-height="${height}"`

        // Build style attribute
        const styles = ['cursor: pointer', 'opacity: 0.8']
        if (width) styles.push(`width: ${width}px`)
        if (height) styles.push(`height: ${height}px`)
        videoHtml += ` style="${styles.join('; ')}" />`

        let success = false
        if (isEditingVideo) {
          // Replace existing video placeholder
          const newImg = document.createElement('img')
          newImg.src = placeholderUrl
          newImg.alt = title
          newImg.setAttribute('data-video-url', url)
          newImg.setAttribute('data-video-provider', videoInfo.provider)
          newImg.setAttribute('data-video-id', videoInfo.videoId)
          newImg.setAttribute('data-is-video-placeholder', 'true')
          if (width) {
            newImg.setAttribute('data-width', width.toString())
            newImg.style.width = `${width}px`
          }
          if (height) {
            newImg.setAttribute('data-height', height.toString())
            newImg.style.height = `${height}px`
          }
          newImg.style.cursor = 'pointer'
          newImg.style.opacity = '0.8'

          editingImage.parentNode?.replaceChild(newImg, editingImage)
          setEditingImage(null)
          success = true
        } else {
          // Use shared insertion function for new videos
          success = insertHtmlAtCursor(videoHtml)
        }

        if (success) {
          // Update history after insertion
          // Need to wait longer for the markdown to be updated from the DOM changes
          setTimeout(() => {
            const newHistory = history.slice(0, historyIndex + 1)
            newHistory.push(markdown)
            setHistory(newHistory)
            setHistoryIndex(newHistory.length - 1)
          }, 500) // Increased timeout to allow for DOM -> markdown conversion
        }
      }
    },
    [
      isSourceMode,
      updateMarkdownWithContext,
      history,
      historyIndex,
      markdown,
      insertHtmlAtCursor,
      editingImage,
      setHistory,
      setHistoryIndex,
    ]
  )

  // Handle code block insertion
  const handleCodeBlockInsert = useCallback(
    (language: string) => {
      if (isSourceMode) {
        const textarea = document.querySelector(
          'textarea'
        ) as HTMLTextAreaElement
        if (!textarea) return

        const position = textarea.selectionStart
        const currentText = textarea.value

        const result = insertCodeBlock(currentText, position, language)
        updateMarkdownWithContext(result.text, true)

        setTimeout(() => {
          textarea.setSelectionRange(result.newPosition, result.newPosition)
          textarea.focus()
        }, 0)
      } else {
        // Store current selection before inserting
        // const selection = window.getSelection()
        // const range = selection?.getRangeAt(0) // Currently unused

        // Insert the code block HTML
        const codeHtml = `<pre><code class="language-${language}">// Your code here</code></pre><p><br></p>`
        document.execCommand('insertHTML', false, codeHtml)

        // Let ContentEditable handle the change naturally
        // The onInput handler will convert to markdown and trigger onChange

        // Focus the code block after a short delay
        setTimeout(() => {
          const contentEditable = editorRef.current?.querySelector(
            '[contenteditable]'
          ) as HTMLDivElement
          if (!contentEditable) return

          const codeBlocks = contentEditable.querySelectorAll('pre > code')
          if (codeBlocks.length > 0) {
            // Find the most recently added code block
            const lastCodeBlock = codeBlocks[
              codeBlocks.length - 1
            ] as HTMLElement

            // Select the placeholder text
            const range = document.createRange()
            const selection = window.getSelection()

            // Find text node with placeholder
            const walker = document.createTreeWalker(
              lastCodeBlock,
              NodeFilter.SHOW_TEXT,
              null
            )

            const textNode = walker.nextNode()
            if (textNode && textNode.textContent?.includes('Your code here')) {
              range.selectNodeContents(textNode)
            } else {
              range.selectNodeContents(lastCodeBlock)
            }

            selection?.removeAllRanges()
            selection?.addRange(range)

            // Focus to allow immediate typing
            lastCodeBlock.focus()
          }
        }, 50)
      }
    },
    [isSourceMode, updateMarkdownWithContext]
  )

  return (
    <>
      <div
        ref={editorRef}
        className={cn(
          'flex flex-col overflow-hidden rounded-lg border transition-all',
          isFullscreen &&
            'bg-background fixed inset-0 z-50 rounded-none border-0',
          className
        )}
      >
        <EditorToolbar
          onFormat={handleFormat}
          isSourceMode={isSourceMode}
          onToggleSourceMode={toggleSourceMode}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          className={cn(isFullscreen && 'sticky top-0 z-10')}
        />

        <div
          className={cn(
            'min-h-[500px] flex-1',
            isFullscreen && 'h-full overflow-auto'
          )}
        >
          {isSourceMode ? (
            <Textarea
              value={markdown}
              onChange={(e) => updateMarkdown(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault()
                  const textarea = e.currentTarget
                  const start = textarea.selectionStart
                  const end = textarea.selectionEnd
                  const text = textarea.value

                  // Check if we're in a list item
                  const lines = text.substring(0, start).split('\n')
                  const currentLine = lines[lines.length - 1]
                  const isListItem = /^(\s*)([-*+]|\d+\.)\s/.test(currentLine)

                  if (isListItem) {
                    // Handle list indentation
                    const result = indentList(text, { start, end }, e.shiftKey)
                    updateMarkdownWithContext(result.text, true)

                    // Restore cursor position
                    setTimeout(() => {
                      textarea.setSelectionRange(
                        result.newSelection.start,
                        result.newSelection.end
                      )
                      textarea.focus()
                    }, 0)
                  } else {
                    // Insert tab character
                    const newText =
                      text.substring(0, start) + '\t' + text.substring(end)
                    updateMarkdownWithContext(newText, true)

                    setTimeout(() => {
                      textarea.setSelectionRange(start + 1, start + 1)
                      textarea.focus()
                    }, 0)
                  }
                }
              }}
              className='h-full min-h-[500px] resize-none rounded-none border-0 font-mono'
              placeholder={placeholder}
            />
          ) : (
            <div className='mdx-editor-content'>
              <ContentEditable
                html={html}
                onChange={updateHtml}
                onSelectionChange={setSelection}
                imageBaseUrl={imageBaseUrl}
                placeholder={placeholder}
                className='rounded-none border-0'
              />
            </div>
          )}
        </div>

        <ContextMenu
          onFormat={handleFormat}
          onEditLink={handleEditLink}
          onEditImage={handleEditImage}
          onEditVideo={handleEditVideo}
          onFullscreen={toggleFullscreen}
        />
      </div>

      <LinkDialog
        open={showLinkDialog}
        onOpenChange={(open) => {
          setShowLinkDialog(open)
          if (!open) setEditingLink(null)
        }}
        onSubmit={handleLinkInsert}
        defaultText={editingLink?.text || selection?.text}
        defaultUrl={editingLink?.url}
      />

      <ImageDialog
        open={showImageDialog}
        onOpenChange={(open) => {
          setShowImageDialog(open)
          if (!open) setEditingImage(null)
        }}
        onSubmit={handleImageInsert}
        onUpload={onImageUpload}
        initialImage={
          editingImage
            ? {
                url: editingImage.src, // Use the already transformed src for display
                alt: editingImage.alt,
                width: editingImage.getAttribute('data-width')
                  ? parseInt(editingImage.getAttribute('data-width')!)
                  : editingImage.width,
                height: editingImage.getAttribute('data-height')
                  ? parseInt(editingImage.getAttribute('data-height')!)
                  : editingImage.height,
              }
            : undefined
        }
      />

      <VideoDialog
        open={showVideoDialog}
        onOpenChange={(open) => {
          setShowVideoDialog(open)
          if (!open) setEditingImage(null)
        }}
        onSubmit={handleVideoInsert}
        initialVideo={initialVideoData}
      />

      <CodeBlockDialog
        open={showCodeBlockDialog}
        onOpenChange={setShowCodeBlockDialog}
        onSubmit={handleCodeBlockInsert}
      />
    </>
  )
}
