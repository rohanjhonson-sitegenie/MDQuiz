// MarkdownEditor with live transformation for quiz management
// Real-time bidirectional transformation with existing quiz schema

import { useCallback, useEffect, useRef } from 'react'
import { useQuizStore } from '@/stores/quizStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { validateMarkdown } from '@/utils/markdown-transform'
import { Save, AlertCircle, CheckCircle } from 'lucide-react'

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
    saveQuiz
  } = useQuizStore()

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<number | undefined>(undefined)

  // Debounced content update
  const handleContentChange = useCallback((content: string) => {
    setMarkdownContent(content)
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Auto-save after 2 seconds of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      if (selectedQuiz && content.trim()) {
        saveQuiz()
      }
    }, 2000) as any
  }, [setMarkdownContent, saveQuiz, selectedQuiz])

  // Handle manual save
  const handleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveQuiz()
  }, [saveQuiz])

  // Validate markdown content
  const validation = validateMarkdown(markdownContent)
  
  // Keyboard shortcuts
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
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [handleSave])

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
      {/* Editor toolbar */}
      <div className='flex-shrink-0 border-b bg-background px-4 py-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h3 className='font-medium text-sm'>Markdown Editor</h3>
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              {validation.valid ? (
                <div className='flex items-center gap-1 text-green-600'>
                  <CheckCircle className='h-3 w-3' />
                  Valid
                </div>
              ) : (
                <div className='flex items-center gap-1 text-red-600'>
                  <AlertCircle className='h-3 w-3' />
                  {validation.errors.length} errors
                </div>
              )}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <div className='text-xs text-muted-foreground'>
              {markdownContent.length} characters
            </div>
            <Button
              size='sm'
              onClick={handleSave}
              disabled={isLoading || !validation.valid}
            >
              <Save className='h-3 w-3 mr-1' />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className='flex-shrink-0 bg-red-50 border-b border-red-200 px-4 py-2'>
          <div className='flex items-center gap-2 text-sm text-red-700'>
            <AlertCircle className='h-4 w-4' />
            {error}
          </div>
        </div>
      )}

      {/* Validation errors */}
      {!validation.valid && (
        <div className='flex-shrink-0 bg-yellow-50 border-b border-yellow-200 px-4 py-2'>
          <div className='text-sm'>
            <div className='font-medium text-yellow-800 mb-1'>Markdown Issues:</div>
            <ul className='text-yellow-700 text-xs space-y-1'>
              {validation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Editor area */}
      <div className='flex-1 relative'>
        <textarea
          ref={textareaRef}
          value={markdownContent}
          onChange={(e) => handleContentChange(e.target.value)}
          className={cn(
            'w-full h-full p-4 font-mono text-sm bg-background border-0 outline-none resize-none',
            'placeholder:text-muted-foreground/50',
            !validation.valid && 'bg-red-50/30'
          )}
          placeholder={`---
title: "My Quiz Title"
description: "Quiz description"
published: false
settings:
  time_limit: 30
  show_feedback: true
---

# My Quiz Title

Brief description of what this quiz covers.

## Question 1

What is the correct way to declare a variable in JavaScript?

A) var myVariable = "value" ✓
B) variable myVariable = "value"
C) declare myVariable = "value"
D) let myVariable

**Explanation:** The 'var' keyword is used to declare variables in JavaScript.

---

## Question 2

True or False: JavaScript is case-sensitive.

True ✓
False

**Explanation:** JavaScript treats 'myVar' and 'myvar' as different variables.`}
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
      </div>

      {/* Editor footer */}
      <div className='flex-shrink-0 border-t bg-muted/20 px-4 py-2'>
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <div className='flex items-center gap-4'>
            <span>
              Lines: {markdownContent.split('\n').length}
            </span>
            <span>
              Questions: {(markdownContent.match(/^## Question/gm) || []).length}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span>Ctrl+S to save</span>
            <span>•</span>
            <span>Auto-save enabled</span>
          </div>
        </div>
      </div>
    </div>
  )
}