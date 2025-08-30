import { createLazyFileRoute } from '@tanstack/react-router'
import ThreePaneNavigator from '@/features/three-pane-navigator'

export const Route = createLazyFileRoute(
  '/admin/_authenticated/demos/three-pane-navigator'
)({
  component: ThreePaneNavigator,
})
