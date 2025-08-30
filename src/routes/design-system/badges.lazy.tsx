import { createLazyFileRoute } from '@tanstack/react-router'
import { BadgesDemo } from '@/features/design-system/components/badges-demo'

export const Route = createLazyFileRoute('/design-system/badges')({
  component: BadgesDemo,
})
