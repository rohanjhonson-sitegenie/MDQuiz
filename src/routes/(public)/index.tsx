import { createFileRoute } from '@tanstack/react-router'
import { EnhancedPublicPage } from '@/features/public-content'

export const Route = createFileRoute('/(public)/')({
  component: () => (
    <EnhancedPublicPage contentPath='landing/landing' enableDirectives={true} />
  ),
})
