import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { ImageData } from '../types'

interface ImagePickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  layout?: 'landscape' | 'portrait' | 'fullscreen'
  children: React.ReactNode
  className?: string
}

interface InputPanelProps {
  children: React.ReactNode
  className?: string
}

interface PreviewPanelProps {
  children: React.ReactNode
  className?: string
}

export const ImagePickerDialog: React.FC<ImagePickerDialogProps> & {
  InputPanel: React.FC<InputPanelProps>
  PreviewPanel: React.FC<PreviewPanelProps>
} = ({
  open,
  onOpenChange,
  title = 'Select Image',
  layout = 'landscape',
  children,
  className,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex flex-col overflow-hidden p-0',
          layout === 'landscape' &&
            'aspect-[4/3] max-h-[1200px] w-[95vw] max-w-[1600px] min-w-[1000px]',
          layout === 'portrait' && 'max-h-[85vh] w-[90vw] max-w-[600px]',
          layout === 'fullscreen' && 'h-[90vh] w-[95vw] max-w-[1400px]',
          className
        )}
      >
        <DialogHeader className='shrink-0 border-b px-6 py-4'>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Select an image from your computer, enter a URL, or browse existing
            images
          </DialogDescription>
        </DialogHeader>
        <div
          className={cn(
            'flex min-h-0 flex-1 overflow-hidden',
            layout === 'portrait' && 'flex-col'
          )}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const InputPanel: React.FC<InputPanelProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'flex-[3] overflow-x-hidden overflow-y-auto border-r p-6',
        className
      )}
    >
      {children}
    </div>
  )
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ children, className }) => {
  return (
    <div className={cn('flex-[2] overflow-hidden p-6', className)}>
      {children}
    </div>
  )
}

ImagePickerDialog.InputPanel = InputPanel
ImagePickerDialog.PreviewPanel = PreviewPanel

// Simplified version for inline use
interface ImagePickerInlineProps {
  children: React.ReactNode
  className?: string
}

export const ImagePickerInline: React.FC<ImagePickerInlineProps> = ({
  children,
  className,
}) => {
  return <div className={cn('space-y-4', className)}>{children}</div>
}

// Context for sharing state between picker components
interface ImagePickerContextValue {
  selectedImage: ImageData | null
  setSelectedImage: (image: ImageData | null) => void
}

const ImagePickerContext = React.createContext<
  ImagePickerContextValue | undefined
>(undefined)

export const useImagePicker = () => {
  const context = React.useContext(ImagePickerContext)
  if (!context) {
    throw new Error('useImagePicker must be used within ImagePickerProvider')
  }
  return context
}

interface ImagePickerProviderProps {
  children: React.ReactNode
}

export const ImagePickerProvider: React.FC<ImagePickerProviderProps> = ({
  children,
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)

  return (
    <ImagePickerContext.Provider value={{ selectedImage, setSelectedImage }}>
      {children}
    </ImagePickerContext.Provider>
  )
}
