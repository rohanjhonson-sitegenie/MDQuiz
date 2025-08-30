import React from 'react'
import { storageConfig } from '@/config/storage.config'
import { MDXEditor } from './mdx-editor'
import type { ChangeContext } from './mdx-editor/types'

interface ContentEditorProps {
  value: string
  onChange: (value: string, context?: ChangeContext) => void
  onImageUpload?: (file: File) => Promise<string>
}

export const ContentEditor = React.memo(function ContentEditor({
  value,
  onChange,
  onImageUpload,
}: ContentEditorProps) {
  return (
    <MDXEditor
      value={value}
      onChange={onChange}
      onImageUpload={onImageUpload}
      imageBaseUrl={storageConfig.bunny.cdnUrl}
      className='min-h-[500px] w-full'
      placeholder='Start writing your content...'
    />
  )
})
