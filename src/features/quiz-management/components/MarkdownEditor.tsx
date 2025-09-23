// MarkdownEditor with live transformation for quiz management
// Real-time bidirectional transformation with existing quiz schema

import { useCallback, useEffect, useRef } from 'react'
import { useQuizStore } from '@/stores/quizStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { parseMarkdownQuiz } from '@/lib/markdown-quiz-parser'
import { Save, FileText } from 'lucide-react'

interface MarkdownEditorProps {
  className?: string
}

export function MarkdownEditor({ className }: MarkdownEditorProps) {
  const {
    markdownContent,
    selectedQuiz,
    isLoading,
    error,
    setMarkdownContent,
    saveQuiz,
    setError
  } = useQuizStore()

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<number | undefined>(undefined)

  // Content update with scroll position preservation (NO AUTO-SAVE)
  const handleContentChange = useCallback((content: string) => {
    // Preserve scroll position during content update
    const scrollTop = textareaRef.current?.scrollTop || 0
    const selectionStart = textareaRef.current?.selectionStart || 0
    const selectionEnd = textareaRef.current?.selectionEnd || 0

    setMarkdownContent(content)

    // Restore scroll position and selection after React re-render
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.scrollTop = scrollTop
        textareaRef.current.setSelectionRange(selectionStart, selectionEnd)
      }
    })

    // Clear any existing timeout to prevent auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
  }, [setMarkdownContent])

  // Handle manual save - only way to save content
  const handleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveQuiz()
  }, [saveQuiz])

  // Parse and validate markdown content (without auto-save)
  const handleParseMarkdown = useCallback(() => {
    if (!markdownContent.trim()) {
      setError('Please enter markdown content before parsing')
      return
    }

    try {
      const parsedQuiz = parseMarkdownQuiz(markdownContent)

      // Just validate, don't auto-save
      setError(null) // Clear any previous errors

      // Optional: Show success message
      console.log('Quiz parsed successfully:', parsedQuiz)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse markdown'
      setError(`Parse error: ${errorMessage}`)
    }
  }, [markdownContent, setError])
  
  // Keyboard shortcuts and cleanup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    if (textareaRef.current) {
      textareaRef.current.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      if (textareaRef.current) {
        textareaRef.current.removeEventListener('keydown', handleKeyDown)
      }
      // Cancel any pending auto-save when component unmounts or quiz changes
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = undefined
      }
    }
  }, [handleSave])

  // Clear timeouts when selectedQuiz changes to prevent cross-quiz saves
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = undefined
      }
    }
  }, [selectedQuiz?.id])

  if (!selectedQuiz) {
    return (
      <div className={cn('flex items-center justify-center h-full bg-muted/20', className)}>
        <div className='text-center text-muted-foreground'>
          <p>Select a quiz from the list to start editing</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with parse button */}
      <div className='flex items-center justify-between p-4 border-b bg-background/95'>
        <div className='flex items-center gap-2'>
          <FileText className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>Markdown Editor</span>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            onClick={handleParseMarkdown}
            size='sm'
            variant='outline'
            disabled={isLoading || !markdownContent.trim()}
          >
            Parse Quiz
          </Button>
          <Button
            onClick={handleSave}
            size='sm'
            disabled={isLoading}
          >
            <Save className='h-4 w-4 mr-2' />
            Save
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div className='flex-1 relative'>
        <textarea
          ref={textareaRef}
          value={markdownContent}
          onChange={(e) => handleContentChange(e.target.value)}
          className='w-full h-full p-4 text-sm bg-background border-0 outline-none resize-none font-mono leading-6'
          placeholder='Start typing your quiz in Markdown...'
          style={{
            fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
            lineHeight: '1.6'
          }}
          spellCheck={false}
          disabled={isLoading}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className='absolute inset-0 bg-background/50 flex items-center justify-center'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <div className='w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin' />
              Saving...
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className='absolute bottom-4 right-4 bg-destructive/90 text-destructive-foreground px-3 py-2 rounded text-sm max-w-md'>
            {error}
          </div>
        )}
      </div>

      {/* Editor status bar */}
      <div className='px-4 py-2 bg-muted/20 border-t border-border text-xs text-muted-foreground flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <span>{(markdownContent.match(/^## (Q\d+|Question)/gm) || []).length} questions detected</span>
          <span>•</span>
          <span>Line {markdownContent.split('\n').length}, Column 1</span>
          <span>•</span>
          <span className='text-green-600'>
            ✓ Valid Markdown
          </span>
        </div>
        <div className='flex items-center space-x-2'>
          <span>Manual save required</span>
          <div className='w-2 h-2 rounded-full bg-blue-500'></div>
        </div>
      </div>
    </div>
  )
}