import { createFileRoute } from '@tanstack/react-router'
import Kanban from '@/features/kanban'

export const Route = createFileRoute('/admin/_authenticated/kanban/')({
  component: Kanban,
})
