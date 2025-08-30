import React, { useEffect, useRef, useState } from 'react'
import { Bold, Italic, Link, Copy, Trash2, Edit, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContextMenuItem {
  icon: React.ReactNode
  label: string
  action: () => void
  separator?: boolean
}

interface ContextMenuProps {
  onFormat: (action: string, value?: string | number | boolean) => void
  onEditLink?: (url: string, text: string) => void
  onEditImage?: (element: HTMLImageElement) => void
  onEditVideo?: (element: HTMLImageElement) => void
  onFullscreen?: () => void
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  onFormat,
  onEditLink,
  onEditImage,
  onEditVideo,
  onFullscreen,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [menuItems, setMenuItems] = useState<ContextMenuItem[]>([])
  const menuRef = useRef<HTMLDivElement>(null)
  const targetElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Only show context menu within the editor
      if (!target.closest('.mdx-editor-content')) return

      e.preventDefault()
      targetElementRef.current = target

      const items: ContextMenuItem[] = []

      // Check what element was clicked
      const isLink = target.tagName === 'A' || target.closest('a')
      const isImage = target.tagName === 'IMG' || target.closest('img')
      const isCode = target.tagName === 'CODE' || target.closest('code')
      const isPre = target.tagName === 'PRE' || target.closest('pre')
      const selection = window.getSelection()
      const hasSelection = selection && selection.toString().trim().length > 0

      // Check if it's a video placeholder
      let isVideo = false
      if (isImage) {
        const imgElement = (
          target.tagName === 'IMG' ? target : target.closest('img')
        ) as HTMLImageElement
        isVideo =
          imgElement?.getAttribute('data-is-video-placeholder') === 'true'
      }

      // Selection-based items
      if (hasSelection) {
        items.push(
          {
            icon: <Bold className='h-4 w-4' />,
            label: 'Bold',
            action: () => onFormat('bold'),
          },
          {
            icon: <Italic className='h-4 w-4' />,
            label: 'Italic',
            action: () => onFormat('italic'),
          },
          {
            icon: <Link className='h-4 w-4' />,
            label: 'Create Link',
            action: () => onFormat('link'),
          },
          {
            icon: <Copy className='h-4 w-4' />,
            label: 'Copy',
            action: () => document.execCommand('copy'),
          }
        )
      }

      // Link-specific items
      if (isLink) {
        const linkElement = (
          target.tagName === 'A' ? target : target.closest('a')
        ) as HTMLAnchorElement
        if (linkElement) {
          items.push(
            {
              icon: <Edit className='h-4 w-4' />,
              label: 'Edit Link',
              action: () => {
                if (onEditLink) {
                  onEditLink(
                    linkElement.getAttribute('href') || linkElement.href,
                    linkElement.textContent || ''
                  )
                }
              },
            },
            {
              icon: <Copy className='h-4 w-4' />,
              label: 'Copy Link',
              action: () => {
                navigator.clipboard.writeText(linkElement.href)
              },
            },
            {
              icon: <Trash2 className='h-4 w-4' />,
              label: 'Remove Link',
              action: () => {
                const text = linkElement.textContent || ''
                const textNode = document.createTextNode(text)
                linkElement.parentNode?.replaceChild(textNode, linkElement)
              },
            }
          )
        }
      }

      // Image-specific items
      if (isImage && !isVideo) {
        const imgElement = (
          target.tagName === 'IMG' ? target : target.closest('img')
        ) as HTMLImageElement
        if (imgElement) {
          items.push(
            {
              icon: <Edit className='h-4 w-4' />,
              label: 'Edit Image',
              action: () => {
                if (onEditImage) {
                  onEditImage(imgElement)
                }
              },
            },
            {
              icon: <Copy className='h-4 w-4' />,
              label: 'Copy Image URL',
              action: () => {
                navigator.clipboard.writeText(imgElement.src)
              },
            },
            {
              icon: <Trash2 className='h-4 w-4' />,
              label: 'Remove Image',
              action: () => {
                imgElement.remove()
              },
            }
          )
        }
      }

      // Video-specific items
      if (isVideo) {
        const imgElement = (
          target.tagName === 'IMG' ? target : target.closest('img')
        ) as HTMLImageElement
        if (imgElement) {
          items.push(
            {
              icon: <Edit className='h-4 w-4' />,
              label: 'Edit Video',
              action: () => {
                if (onEditVideo) {
                  onEditVideo(imgElement)
                }
              },
            },
            {
              icon: <Copy className='h-4 w-4' />,
              label: 'Copy Video URL',
              action: () => {
                const videoUrl =
                  imgElement.getAttribute('data-video-url') || imgElement.src
                navigator.clipboard.writeText(videoUrl)
              },
            },
            {
              icon: <Trash2 className='h-4 w-4' />,
              label: 'Remove Video',
              action: () => {
                imgElement.remove()
              },
            }
          )
        }
      }

      // Code block items
      if (isCode || isPre) {
        items.push({
          icon: <Copy className='h-4 w-4' />,
          label: 'Copy Code',
          action: () => {
            const codeElement = isCode ? target : target.querySelector('code')
            if (codeElement) {
              navigator.clipboard.writeText(codeElement.textContent || '')
            }
          },
        })
      }

      // Always add fullscreen option
      if (items.length > 0) {
        items.push({ separator: true } as ContextMenuItem)
      }
      items.push({
        icon: <Maximize2 className='h-4 w-4' />,
        label: 'Fullscreen',
        action: () => {
          if (onFullscreen) onFullscreen()
          setIsVisible(false)
        },
      })

      setMenuItems(items)
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsVisible(false)
      }
    }

    const handleScroll = () => {
      setIsVisible(false)
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('click', handleClick)
    document.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [onFormat, onEditLink, onEditImage, onEditVideo, onFullscreen])

  if (!isVisible || menuItems.length === 0) return null

  return (
    <div
      ref={menuRef}
      className={cn(
        'bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 fixed z-50 min-w-[160px] rounded-md border p-1 shadow-md'
      )}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      {menuItems.map((item, index) =>
        item.separator ? (
          <div key={index} className='bg-border my-1 h-px' />
        ) : (
          <button
            key={index}
            className='hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm'
            onClick={() => {
              item.action()
              setIsVisible(false)
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        )
      )}
    </div>
  )
}
