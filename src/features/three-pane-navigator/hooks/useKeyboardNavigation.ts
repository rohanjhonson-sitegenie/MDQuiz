import { useEffect, useRef, useCallback } from 'react'

interface UseKeyboardNavigationProps<T> {
  items: T[]
  selectedId: string | null
  onSelect: (id: string) => void
  getItemId: (item: T) => string
  isActive?: boolean
  onRightPress?: () => void
  onLeftPress?: () => void
}

export function useKeyboardNavigation<T>({
  items,
  selectedId,
  onSelect,
  getItemId,
  isActive = true,
  onRightPress,
  onLeftPress,
}: UseKeyboardNavigationProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // Find current index
  const currentIndex = items.findIndex((item) => getItemId(item) === selectedId)

  // Register item ref
  const registerItemRef = useCallback(
    (id: string, element: HTMLButtonElement | null) => {
      if (element) {
        itemRefs.current.set(id, element)
      } else {
        itemRefs.current.delete(id)
      }
    },
    []
  )

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive || items.length === 0) return

      const { key } = event

      if (key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault()

        let nextIndex: number

        if (key === 'ArrowDown') {
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        }

        const nextItem = items[nextIndex]
        const nextId = getItemId(nextItem)
        onSelect(nextId)

        // Scroll to the selected item
        const nextElement = itemRefs.current.get(nextId)
        if (nextElement && containerRef.current) {
          nextElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          })
        }
      }

      if (key === 'ArrowRight' && onRightPress) {
        event.preventDefault()
        onRightPress()
      }

      if (key === 'ArrowLeft' && onLeftPress) {
        event.preventDefault()
        onLeftPress()
      }
    },
    [
      items,
      currentIndex,
      isActive,
      getItemId,
      onSelect,
      onRightPress,
      onLeftPress,
    ]
  )

  // Add keyboard event listener
  useEffect(() => {
    if (!isActive) return

    const container = containerRef.current
    if (!container) return

    // Add event listener to container
    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, isActive])

  // Focus management
  useEffect(() => {
    if (!isActive || !selectedId) return

    const selectedElement = itemRefs.current.get(selectedId)
    if (selectedElement && document.activeElement !== selectedElement) {
      selectedElement.focus()
    }
  }, [selectedId, isActive])

  return {
    containerRef,
    registerItemRef,
  }
}
