// QuizEditorPane with left-right split for markdown editor and preview
// Adapted from three-pane navigator patterns with ResizeHandle integration

import { useRef, useCallback, useEffect } from 'react'
import { useQuizStore } from '@/stores/quizStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MarkdownEditor } from './MarkdownEditor'
import { QuizPreview } from './QuizPreview'
import { QuizStructureToggle } from './QuizStructureToggle'
import { ContactRequirementSettings } from './ContactRequirementSettings'

interface QuizEditorPaneProps {
  className?: string
}

export function QuizEditorPane({ className }: QuizEditorPaneProps) {
  const {
    selectedQuiz,
    sections,
    setPaneWidth,
    loadSections,
    toggleQuizStructure,
    updateContactRequirement,
    isLoading
  } = useQuizStore()

  
  // Custom resize logic adapted from three-pane navigator patterns
  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)
  const minWidth = 300
  const maxWidth = 1200


  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing.current) return

      const diff = e.clientX - startX.current
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidth.current + diff)
      )

      setPaneWidth('editor', newWidth)
    },
    [setPaneWidth]
  )

  const handleMouseUp = useCallback(() => {
    isResizing.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Load sections when quiz is selected
  useEffect(() => {
    if (selectedQuiz?.id) {
      loadSections(selectedQuiz.id)
    }
  }, [selectedQuiz?.id, loadSections])

  const handleToggleStructure = (structureType: 'mixed' | 'sectioned') => {
    if (selectedQuiz?.id) {
      toggleQuizStructure(selectedQuiz.id, structureType)
    }
  }

  const handleContactRequirementChange = (contactRequirement: 'none' | 'optional' | 'required') => {
    if (selectedQuiz?.id) {
      updateContactRequirement(selectedQuiz.id, contactRequirement)
    }
  }

  const currentStructureType = selectedQuiz?.settings?.structure_type || 'mixed'
  const currentContactRequirement = selectedQuiz?.settings?.contact_requirement || 'optional'

  if (!selectedQuiz) {
    return (
      <div className={cn(
        'flex items-center justify-center h-full bg-muted/10',
        className
      )}>
        <div className='text-center text-muted-foreground'>
          <div className='mb-4'>
            <div className='w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center'>
              <svg 
                className='w-8 h-8 text-muted-foreground/50' 
                fill='none' 
                viewBox='0 0 24 24' 
                stroke='currentColor'
              >
                <path 
                  strokeLinecap='round' 
                  strokeLinejoin='round' 
                  strokeWidth={1.5}
                  d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' 
                />
              </svg>
            </div>
            <h3 className='text-lg font-medium mb-2'>No Quiz Selected</h3>
            <p className='text-sm'>
              Select a quiz from the list to start editing, or create a new quiz to get started.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex h-full', className)}>
      {/* Left Panel - Markdown Editor (50% width) */}
      <div
        className='flex-1 border-r border-border bg-card flex flex-col min-h-0 overflow-y-auto'
      >
        {/* Quiz Settings */}
        <div className='px-4 py-3 border-b border-border flex-shrink-0 space-y-4'>
          <QuizStructureToggle
            currentMode={currentStructureType}
            onModeChange={handleToggleStructure}
            questionCount={selectedQuiz.questions?.length || 0}
            sectionCount={sections.length}
            isLoading={isLoading}
          />

          <ContactRequirementSettings
            value={currentContactRequirement}
            onChange={handleContactRequirementChange}
          />
        </div>


        {/* Unified Markdown Editor */}
        <div className='flex-shrink-0 flex flex-col'>
          <MarkdownEditor className='flex-shrink-0' />
        </div>
      </div>

      {/* Preview Pane (50% width) */}
      <div className='flex-1 bg-muted/10 flex flex-col min-h-0'>
        <div className='flex items-center justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0'>
          <h3 className='text-sm font-semibold text-foreground'>Live Preview</h3>
        </div>
        <div className='flex-1 overflow-y-auto min-h-0'>
          <QuizPreview className='h-full' />
        </div>
      </div>
    </div>
  )
}