import { createFileRoute } from '@tanstack/react-router'
import { PublicPage } from '@/features/public-content'

export const Route = createFileRoute('/(public)/legal/privacy')({
  component: () => (
    <PublicPage contentPath='privacy' pageTitle='Privacy Policy' />
  ),
})
