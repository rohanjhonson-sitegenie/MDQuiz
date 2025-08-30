import { createFileRoute } from '@tanstack/react-router'
import UserDashboard from '@/features/user-dashboard'

export const Route = createFileRoute('/user/_authenticated/')({
  component: UserDashboard,
})
