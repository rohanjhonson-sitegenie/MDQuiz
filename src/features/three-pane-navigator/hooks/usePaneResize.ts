import { useRef, useCallback, useEffect } from 'react'
import { useThreePaneNavigatorStore } from '@/stores/threePaneNavigatorStore'
import { PANE_DIMENSIONS } from '../constants/layout.constants'

interface UsePaneResizeProps {
  pane: 'programs' | 'courses'
}

export function usePaneResize({ pane }: UsePaneResizeProps) {
  const minWidth = PANE_DIMENSIONS[pane].min
  const maxWidth = PANE_DIMENSIONS[pane].max
  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const { paneWidths, setPaneWidth } = useThreePaneNavigatorStore()

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isResizing.current = true
      startX.current = e.clientX
      startWidth.current = paneWidths[pane]

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      e.preventDefault()
    },
    [pane, paneWidths]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing.current) return

      const diff = e.clientX - startX.current
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidth.current + diff)
      )

      setPaneWidth(pane, newWidth)
    },
    [pane, minWidth, maxWidth, setPaneWidth]
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

  return {
    handleMouseDown,
    isResizing: isResizing.current,
  }
}
