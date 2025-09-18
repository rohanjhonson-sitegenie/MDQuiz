// QuizManagement - Main component integrating quiz list and editor panes
// Adapted from ThreePaneNavigator pattern for two-pane quiz management

import { useCallback, useEffect, useRef } from 'react'
import { useQuizStore } from '@/stores/quizStore'
import { cn } from '@/lib/utils'
import { ResizeHandle } from '@/features/three-pane-navigator/components/ResizeHandle'
import { QuizListPane } from './QuizListPane'
import { QuizEditorPane } from './QuizEditorPane'

interface QuizManagementProps {
  className?: string
}

export function QuizManagement({ className }: QuizManagementProps) {
  const { paneWidths, setPaneWidth } = useQuizStore()
  const quizListRef = useRef<HTMLDivElement>(null)
  
  // Custom resize logic for quiz list pane (adapted from three-pane patterns)
  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)
  const minWidth = 250
  const maxWidth = 500

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isResizing.current = true
      startX.current = e.clientX
      startWidth.current = paneWidths.quizList

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      e.preventDefault()
    },
    [paneWidths.quizList]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing.current) return

      const diff = e.clientX - startX.current
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidth.current + diff)
      )

      setPaneWidth('quizList', newWidth)
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

  // Load initial data
  useEffect(() => {
    // Data loading is handled by individual panes
  }, [])

  return (
    <div className={cn('flex h-full overflow-hidden', className)}>
      {/* Left pane - Quiz List */}
      <div
        ref={quizListRef}
        className='flex-shrink-0 border-r border-border bg-card'
        style={{ width: `${paneWidths.quizList}px` }}
      >
        <QuizListPane />
      </div>

      {/* Resize Handle between quiz list and editor */}
      <ResizeHandle 
        onMouseDown={handleMouseDown}
        className='hover:bg-primary/20'
      />

      {/* Right pane - Quiz Editor (with internal split) */}
      <div className='flex-1 min-w-0 bg-background'>
        <QuizEditorPane />
      </div>
    </div>
  )
}