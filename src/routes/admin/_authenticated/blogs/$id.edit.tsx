import { createFileRoute } from '@tanstack/react-router'
import ContentEditor from '@/features/content-editor'

export const Route = createFileRoute('/admin/_authenticated/blogs/$id/edit')({
  component: ContentEditor,
})
