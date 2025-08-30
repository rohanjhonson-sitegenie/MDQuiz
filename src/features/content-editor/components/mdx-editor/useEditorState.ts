import { useState, useCallback, useRef, useEffect } from 'react'
import { domToMarkdown } from './dom-to-markdown'
import { renderMarkdownToHtml } from './markdown-to-html'
import { ChangeContext } from './types'

export const useEditorState = (
  initialMarkdown: string,
  onChange: (markdown: string, context?: ChangeContext) => void
) => {
  const [markdown, setMarkdown] = useState(initialMarkdown)
  const [html, setHtml] = useState('')
  const [isSourceMode, setIsSourceMode] = useState(false)
  const isUpdatingRef = useRef(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const markdownRef = useRef(initialMarkdown)

  // Initialize HTML from markdown on mount
  useEffect(() => {
    renderMarkdownToHtml(initialMarkdown).then(setHtml)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Sync with external markdown changes
  useEffect(() => {
    if (initialMarkdown !== markdown && !isUpdatingRef.current) {
      setMarkdown(initialMarkdown)
      markdownRef.current = initialMarkdown
      renderMarkdownToHtml(initialMarkdown).then(setHtml)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMarkdown]) // Only depend on initialMarkdown, not markdown

  const updateMarkdown = useCallback(
    (newMarkdown: string, context?: ChangeContext) => {
      isUpdatingRef.current = true
      setMarkdown(newMarkdown)
      markdownRef.current = newMarkdown
      onChange(newMarkdown, context)
      renderMarkdownToHtml(newMarkdown).then((html) => {
        setHtml(html)
        setTimeout(() => {
          isUpdatingRef.current = false
        }, 100)
      })
    },
    [onChange]
  )

  const updateHtml = useCallback(
    (newHtml: string) => {
      // console.log('[useEditorState] updateHtml called, isUpdating:', isUpdatingRef.current)
      if (isUpdatingRef.current) {
        return
      }
      setHtml(newHtml)

      // Convert to markdown asynchronously
      requestAnimationFrame(() => {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = newHtml
        const newMarkdown = domToMarkdown(tempDiv)

        // Update ref immediately for comparison
        const hasChanged = newMarkdown !== markdownRef.current
        if (hasChanged) {
          // console.log('[useEditorState] Markdown changed, updating ref')
          markdownRef.current = newMarkdown

          // Update local state immediately for UI responsiveness
          setMarkdown(newMarkdown)
        }

        // Clear existing debounce timer
        if (debounceTimerRef.current) {
          // console.log('[useEditorState] Clearing existing debounce timer')
          clearTimeout(debounceTimerRef.current)
        }

        // Debounce the onChange callback to parent
        // console.log('[useEditorState] Setting new debounce timer (300ms)')
        debounceTimerRef.current = setTimeout(() => {
          // console.log('[useEditorState] Debounce timer fired, calling onChange')
          isUpdatingRef.current = true
          onChange(newMarkdown)
          setTimeout(() => {
            isUpdatingRef.current = false
          }, 100)
        }, 300) // 300ms debounce delay
      })
    },
    [onChange]
  )

  const toggleSourceMode = useCallback(() => {
    // Clear any pending debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      // Flush any pending changes
      onChange(markdown)
    }

    // Before switching modes, ensure the current content is synced
    if (!isSourceMode) {
      // Switching from visual to source mode
      // The markdown should already be up to date from updateHtml calls
      // Force a re-render of the markdown to ensure it's current
      renderMarkdownToHtml(markdown).then(setHtml)
    } else {
      // Switching from source to visual mode
      // Convert the current markdown to HTML
      renderMarkdownToHtml(markdown).then(setHtml)
    }
    setIsSourceMode((prev) => !prev)
  }, [isSourceMode, markdown, onChange])

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    markdown,
    html,
    isSourceMode,
    updateMarkdown,
    updateHtml,
    toggleSourceMode,
  }
}
