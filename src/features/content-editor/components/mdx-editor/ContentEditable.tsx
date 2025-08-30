import React, { useRef, useEffect, useCallback, useState } from 'react'
import ReactDOM from 'react-dom'
import { cn } from '@/lib/utils'
import { CodeBlockLanguageSelector } from './CodeBlockLanguageSelector'
import { transformImageUrl, extractRelativePath } from './utils/url-transformer'

interface ContentEditableProps {
  html: string
  onChange: (html: string) => void
  onSelectionChange?: (selection: {
    start: number
    end: number
    text: string
  }) => void
  imageBaseUrl?: string
  className?: string
  placeholder?: string
}

export const ContentEditable: React.FC<ContentEditableProps> = React.memo(
  ({
    html,
    onChange,
    onSelectionChange,
    imageBaseUrl,
    className,
    placeholder,
  }) => {
    const contentRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isEmpty, setIsEmpty] = useState(true)
    const isInternalChange = useRef(false)
    const isComposingRef = useRef(false)

    // Helper function to check if content has meaningful elements
    const hasContent = useCallback((element: HTMLElement): boolean => {
      const textContent = element.textContent?.trim()
      const hasText = textContent !== ''
      const hasImages = element.querySelector('img') !== null
      const hasVideos = element.querySelector('iframe') !== null
      const hasTables = element.querySelector('table') !== null
      const hasHr = element.querySelector('hr') !== null
      const hasCodeBlocks = element.querySelector('pre') !== null

      return (
        hasText || hasImages || hasVideos || hasTables || hasHr || hasCodeBlocks
      )
    }, [])
    const observerRef = useRef<MutationObserver | null>(null)
    const [codeBlockSelectors, setCodeBlockSelectors] = useState<
      Array<{
        id: string
        element: HTMLElement
        language: string
      }>
    >([])
    const [, forceUpdate] = useState(0)

    // Initialize content
    useEffect(() => {
      if (!contentRef.current) {
        return
      }

      if (isInternalChange.current) {
        return
      }

      // Only update if the HTML is significantly different
      const currentHtml = contentRef.current.innerHTML

      // Handle empty html case
      if (html === '' && currentHtml === '') {
        setIsEmpty(true)
        return
      }

      // Don't process if html hasn't changed (but check initial isEmpty state)
      if (html === currentHtml) {
        // On first render, check if we have content
        if (html && isEmpty && contentRef.current) {
          setIsEmpty(!hasContent(contentRef.current))
        }
        return
      }

      if (html !== currentHtml && html !== '') {
        // Check if content is actually different (not just formatting)
        const tempDiv1 = document.createElement('div')
        tempDiv1.innerHTML = html
        const tempDiv2 = document.createElement('div')
        tempDiv2.innerHTML = currentHtml

        const isDifferentContent =
          tempDiv1.textContent?.trim() !== tempDiv2.textContent?.trim() ||
          !currentHtml

        if (isDifferentContent) {
          // Transform image URLs before setting HTML
          let transformedHtml = html
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = html
          const images = tempDiv.querySelectorAll('img')

          images.forEach((img) => {
            const originalSrc =
              img.getAttribute('data-original-src') ||
              img.getAttribute('src') ||
              ''

            // Handle regular images only if imageBaseUrl is provided
            if (
              originalSrc &&
              imageBaseUrl &&
              !img.getAttribute('data-is-video-placeholder')
            ) {
              const displayUrl = transformImageUrl(originalSrc, imageBaseUrl)
              img.setAttribute('src', displayUrl)
              img.setAttribute('data-original-src', originalSrc)
            }
          })

          transformedHtml = tempDiv.innerHTML

          contentRef.current.innerHTML = transformedHtml

          // Check for content after setting innerHTML
          setTimeout(() => {
            if (contentRef.current) {
              setIsEmpty(!hasContent(contentRef.current))
            }
          }, 0)
        }
      }
    }, [html, imageBaseUrl, hasContent, isEmpty])

    const handleInput = useCallback(() => {
      if (!contentRef.current || isComposingRef.current) return

      isInternalChange.current = true
      let newHtml = contentRef.current.innerHTML

      // Extract relative URLs before passing to onChange
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = newHtml

      if (imageBaseUrl) {
        // Handle regular images
        const images = tempDiv.querySelectorAll('img')
        images.forEach((img) => {
          const isVideoPlaceholder =
            img.getAttribute('data-is-video-placeholder') === 'true'
          if (!isVideoPlaceholder) {
            // Only process non-video placeholder images
            const originalSrc = img.getAttribute('data-original-src')
            const currentSrc = img.getAttribute('src')
            if (originalSrc) {
              // Use the original relative path for storage
              img.setAttribute('src', originalSrc)
            } else if (currentSrc && imageBaseUrl) {
              // Extract relative path from CDN URL if needed
              const relativePath = extractRelativePath(currentSrc, imageBaseUrl)
              img.setAttribute('src', relativePath)
            }
          }
        })
        newHtml = tempDiv.innerHTML
      }

      setIsEmpty(!hasContent(contentRef.current))
      onChange(newHtml)

      // Reset the flag after a short delay
      setTimeout(() => {
        isInternalChange.current = false
      }, 0)
    }, [onChange, imageBaseUrl, hasContent])

    const handleSelectionChange = useCallback(() => {
      if (!contentRef.current || !onSelectionChange) return

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      const text = range.toString()

      // Calculate offsets relative to contentEditable
      const preRange = range.cloneRange()
      preRange.selectNodeContents(contentRef.current)
      preRange.setEnd(range.startContainer, range.startOffset)
      const start = preRange.toString().length

      onSelectionChange({
        start,
        end: start + text.length,
        text,
      })
    }, [onSelectionChange])

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        // Handle keyboard shortcuts
        if (e.metaKey || e.ctrlKey) {
          switch (e.key) {
            case 'b':
              e.preventDefault()
              document.execCommand('bold', false)
              handleInput()
              break
            case 'i':
              e.preventDefault()
              document.execCommand('italic', false)
              handleInput()
              break
            case 'u':
              e.preventDefault()
              document.execCommand('underline', false)
              handleInput()
              break
          }
        }

        // Handle tab key for list indentation
        if (e.key === 'Tab') {
          const selection = window.getSelection()
          if (!selection || selection.rangeCount === 0) return

          const range = selection.getRangeAt(0)
          let node = range.startContainer as Node

          // Find the closest list item
          while (
            node &&
            node.nodeName !== 'LI' &&
            node !== contentRef.current
          ) {
            node = node.parentNode as Node
          }

          if (node && node.nodeName === 'LI') {
            e.preventDefault()

            if (e.shiftKey) {
              // Outdent
              document.execCommand('outdent', false)
            } else {
              // Indent
              document.execCommand('indent', false)
            }

            handleInput()
          }
        }
      },
      [handleInput]
    )

    const handlePaste = useCallback(
      (e: React.ClipboardEvent) => {
        e.preventDefault()

        // Get plain text from clipboard
        const text = e.clipboardData.getData('text/plain')

        // Insert the text at current cursor position
        const selection = window.getSelection()
        if (!selection?.rangeCount) return

        selection.deleteFromDocument()

        // Split text by newlines and wrap in paragraphs
        const lines = text.split('\n')
        const fragment = document.createDocumentFragment()

        lines.forEach((line, index) => {
          if (line.trim()) {
            const textNode = document.createTextNode(line)
            fragment.appendChild(textNode)
          }
          if (index < lines.length - 1) {
            fragment.appendChild(document.createElement('br'))
          }
        })

        selection.getRangeAt(0).insertNode(fragment)
        selection.collapseToEnd()

        handleInput()
      },
      [handleInput]
    )

    const handleCompositionStart = () => {
      isComposingRef.current = true
    }

    const handleCompositionEnd = () => {
      isComposingRef.current = false
      handleInput()
    }

    useEffect(() => {
      document.addEventListener('selectionchange', handleSelectionChange)
      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange)
      }
    }, [handleSelectionChange])

    // Set up MutationObserver to catch all changes
    useEffect(() => {
      if (!contentRef.current) return

      // Disconnect existing observer
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      // Create new observer
      const observer = new MutationObserver((mutations) => {
        // Skip if we're internally updating or composing
        if (isInternalChange.current || isComposingRef.current) {
          return
        }

        // Skip if the mutation was triggered by our own code
        const isOurChange = mutations.some((mutation) => {
          const target = mutation.target as HTMLElement
          return target.getAttribute?.('data-internal-change') === 'true'
        })

        if (isOurChange) {
          return
        }

        // Check if any mutation actually changed content
        const hasContentChange = mutations.some(
          (mutation) =>
            mutation.type === 'childList' ||
            mutation.type === 'characterData' ||
            (mutation.type === 'attributes' &&
              (mutation.attributeName === 'style' ||
                mutation.attributeName === 'src' ||
                mutation.attributeName === 'data-original-src'))
        )

        if (hasContentChange) {
          handleInput()
        }
      })

      // Start observing
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['style', 'src', 'data-original-src'],
      })

      observerRef.current = observer

      return () => {
        observer.disconnect()
      }
    }, [handleInput])

    // Function to update language in code block
    const updateCodeBlockLanguage = useCallback(
      (id: string, newLanguage: string) => {
        const selector = codeBlockSelectors.find((s) => s.id === id)
        if (!selector) return

        const codeElement = selector.element.querySelector('code')
        if (!codeElement) return

        // Update class name
        const currentClasses = Array.from(codeElement.classList)
        const languageClasses = currentClasses.filter((c) =>
          c.startsWith('language-')
        )
        languageClasses.forEach((c) => codeElement.classList.remove(c))

        if (newLanguage && newLanguage !== 'text') {
          codeElement.classList.add(`language-${newLanguage}`)
        }

        // Trigger change
        handleInput()
      },
      [codeBlockSelectors, handleInput]
    )

    // Set up code block selectors
    useEffect(() => {
      if (!contentRef.current) return

      const setupSelectors = () => {
        const codeBlocks = contentRef.current?.querySelectorAll('pre')
        if (!codeBlocks) return

        const newSelectors: typeof codeBlockSelectors = []

        codeBlocks.forEach((pre, index) => {
          const codeElement = pre.querySelector('code')
          const languageMatch = codeElement?.className.match(/language-(\w+)/)
          const language = languageMatch ? languageMatch[1] : 'text'

          // Generate unique ID for this code block
          const id = `code-block-${index}-${Date.now()}`
          pre.setAttribute('data-code-block-id', id)

          newSelectors.push({
            id,
            element: pre as HTMLElement,
            language,
          })
        })

        setCodeBlockSelectors(newSelectors)
      }

      // Set up initially
      setupSelectors()

      // Listen for changes
      const observer = new MutationObserver(() => {
        setupSelectors()
      })

      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
      })

      return () => observer.disconnect()
    }, [html])

    // Update positions on scroll/resize
    useEffect(() => {
      const updatePositions = () => {
        forceUpdate((prev) => prev + 1)
      }

      const scrollableParent = contentRef.current?.closest(
        '.mdx-editor-content'
      )?.parentElement

      window.addEventListener('resize', updatePositions)
      scrollableParent?.addEventListener('scroll', updatePositions)

      return () => {
        window.removeEventListener('resize', updatePositions)
        scrollableParent?.removeEventListener('scroll', updatePositions)
      }
    }, [codeBlockSelectors])

    return (
      <div ref={containerRef} className='relative'>
        {isEmpty && (
          <div className='text-muted-foreground pointer-events-none absolute top-6 left-6 z-10'>
            {placeholder || 'Start writing...'}
          </div>
        )}
        <div
          ref={contentRef}
          contentEditable
          className={cn(
            'min-h-[400px] w-full rounded-md border px-6 py-4 outline-none',
            'prose prose-sm dark:prose-invert max-w-none',
            'focus:ring-ring focus:ring-2 focus:ring-offset-2',
            // Allow images to use their specified dimensions
            '[&_img]:max-w-none [&_img[style*="height"]]:h-auto [&_img[style*="width"]]:w-auto',
            // Ensure all prose styles are applied
            '[&_h1]:mb-4 [&_h1]:text-4xl [&_h1]:font-bold',
            '[&_h2]:mb-3 [&_h2]:text-3xl [&_h2]:font-semibold',
            '[&_h3]:mb-2 [&_h3]:text-2xl [&_h3]:font-semibold',
            '[&_h4]:mb-2 [&_h4]:text-xl [&_h4]:font-semibold',
            '[&_h5]:mb-1 [&_h5]:text-lg [&_h5]:font-semibold',
            '[&_h6]:mb-1 [&_h6]:text-base [&_h6]:font-semibold',
            '[&_p]:mb-4 [&_p]:leading-relaxed',
            '[&_hr]:border-border [&_hr]:my-8 [&_hr]:border-t',
            '[&_ul]:mb-4 [&_ul]:ml-6 [&_ul]:list-disc [&_ul_li]:mt-2',
            '[&_ol]:mb-4 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol_li]:mt-2',
            '[&_li]:leading-relaxed',
            // Support nested lists
            '[&_ul_ul]:mt-2 [&_ul_ul]:mb-2 [&_ul_ul]:ml-6',
            '[&_ul_ol]:mt-2 [&_ul_ol]:mb-2 [&_ul_ol]:ml-6',
            '[&_ol_ul]:mt-2 [&_ol_ul]:mb-2 [&_ol_ul]:ml-6',
            '[&_ol_ol]:mt-2 [&_ol_ol]:mb-2 [&_ol_ol]:ml-6',
            '[&_blockquote]:border-muted [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic',
            '[&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm',
            '[&_pre]:bg-muted [&_pre]:relative [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-4',
            '[&_pre_code]:display-block [&_pre_code]:min-h-[1em] [&_pre_code]:bg-transparent [&_pre_code]:p-0',
            '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2',
            '[&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_img]:object-cover',
            '[&_table]:w-full [&_table]:border-collapse',
            '[&_th]:border-border [&_th]:border [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold',
            '[&_td]:border-border [&_td]:border [&_td]:px-4 [&_td]:py-2',
            className
          )}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          suppressContentEditableWarning
        />

        {/* Render language selectors */}
        {codeBlockSelectors.map(({ id, element, language }) => {
          if (!containerRef.current) return null

          const rect = element.getBoundingClientRect()
          const containerRect = containerRef.current.getBoundingClientRect()

          return ReactDOM.createPortal(
            <div
              key={id}
              className='pointer-events-none absolute z-10'
              style={{
                top: rect.top - containerRect.top + 4,
                left: rect.left - containerRect.left,
                width: rect.width,
              }}
            >
              <div className='relative h-0 w-full'>
                <div className='pointer-events-auto absolute right-1'>
                  <CodeBlockLanguageSelector
                    value={language}
                    onChange={(lang) => updateCodeBlockLanguage(id, lang)}
                    className='bg-background/95 border-input w-24 text-xs shadow-sm'
                  />
                </div>
              </div>
            </div>,
            containerRef.current
          )
        })}
      </div>
    )
  }
)
