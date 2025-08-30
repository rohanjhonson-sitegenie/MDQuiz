import { createFileRoute } from '@tanstack/react-router'
import { PublicPage } from '@/features/public-content'

export const Route = createFileRoute('/(public)/legal/cookies')({
  component: () => (
    <PublicPage contentPath='cookies' pageTitle='Cookie Policy' />
  ),
})
