import { createFileRoute } from '@tanstack/react-router'
import { PublicPage } from '@/features/public-content'

export const Route = createFileRoute('/(public)/legal/terms')({
  component: () => (
    <PublicPage contentPath='terms' pageTitle='Terms of Service' />
  ),
})
