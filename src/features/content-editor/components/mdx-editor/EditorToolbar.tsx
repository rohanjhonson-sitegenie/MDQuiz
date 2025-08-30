import React, { useState } from 'react'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Link,
  Image,
  Video,
  List,
  ListOrdered,
  Quote,
  Code,
  Table,
  Undo,
  Redo,
  Eye,
  FileText,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { TableSizeSelector } from './TableSizeSelector'

interface EditorToolbarProps {
  onFormat: (action: string, value?: string | number | boolean) => void
  isSourceMode: boolean
  onToggleSourceMode: () => void
  canUndo: boolean
  canRedo: boolean
  onToggleFullscreen?: () => void
  isFullscreen?: boolean
  className?: string
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFormat,
  isSourceMode,
  onToggleSourceMode,
  canUndo,
  canRedo,
  onToggleFullscreen,
  isFullscreen,
  className,
}) => {
  const [tableDropdownOpen, setTableDropdownOpen] = useState(false)

  return (
    <div
      className={cn(
        'bg-background/95 supports-[backdrop-filter]:bg-background/60 flex items-center gap-1 border-b p-2 backdrop-blur',
        className
      )}
    >
      {/* Undo/Redo */}
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('undo')}
        disabled={!canUndo}
        title='Undo (Ctrl+Z)'
      >
        <Undo className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('redo')}
        disabled={!canRedo}
        title='Redo (Ctrl+Y)'
      >
        <Redo className='h-4 w-4' />
      </Button>

      <Separator orientation='vertical' className='h-6' />

      {/* Text formatting */}
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('bold')}
        title='Bold (Ctrl+B)'
      >
        <Bold className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('italic')}
        title='Italic (Ctrl+I)'
      >
        <Italic className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('code')}
        title='Inline code'
      >
        <Code className='h-4 w-4' />
      </Button>

      <Separator orientation='vertical' className='h-6' />

      {/* Headings */}
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('heading', 1)}
        title='Heading 1'
      >
        <Heading1 className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('heading', 2)}
        title='Heading 2'
      >
        <Heading2 className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('heading', 3)}
        title='Heading 3'
      >
        <Heading3 className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('heading', 4)}
        title='Heading 4'
      >
        <Heading4 className='h-4 w-4' />
      </Button>

      <Separator orientation='vertical' className='h-6' />

      {/* Lists */}
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('list')}
        title='Bullet list'
      >
        <List className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('ordered-list')}
        title='Numbered list'
      >
        <ListOrdered className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('quote')}
        title='Quote'
      >
        <Quote className='h-4 w-4' />
      </Button>

      <Separator orientation='vertical' className='h-6' />

      {/* Insert */}
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('link')}
        title='Insert link'
      >
        <Link className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('image')}
        title='Insert image'
      >
        <Image className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('video')}
        title='Insert video'
      >
        <Video className='h-4 w-4' />
      </Button>
      <DropdownMenu
        open={tableDropdownOpen}
        onOpenChange={setTableDropdownOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button type='button' variant='ghost' size='sm' title='Insert table'>
            <Table className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='p-0'>
          <TableSizeSelector
            onSelect={(rows, cols) => {
              onFormat('table', `${rows}x${cols}`)
              setTableDropdownOpen(false)
            }}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('code-block')}
        title='Code block'
      >
        <FileText className='h-4 w-4' />
      </Button>

      <Separator orientation='vertical' className='h-6' />

      {/* Horizontal Rule */}
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onFormat('hr')}
        title='Horizontal rule'
      >
        <span className='text-sm font-medium'>—</span>
      </Button>

      {/* View mode toggle */}
      <div className='ml-auto flex items-center gap-2'>
        <ToggleGroup
          type='single'
          value={isSourceMode ? 'source' : 'visual'}
          onValueChange={(value) => {
            if (
              value &&
              ((value === 'source' && !isSourceMode) ||
                (value === 'visual' && isSourceMode))
            ) {
              onToggleSourceMode()
            }
          }}
        >
          <ToggleGroupItem value='visual' title='Visual editor'>
            <Eye className='h-4 w-4' />
          </ToggleGroupItem>
          <ToggleGroupItem value='source' title='Source code'>
            <Code className='h-4 w-4' />
          </ToggleGroupItem>
        </ToggleGroup>

        {onToggleFullscreen && (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className='h-4 w-4' />
            ) : (
              <Maximize2 className='h-4 w-4' />
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
