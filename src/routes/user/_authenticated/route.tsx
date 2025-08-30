import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '@/lib/auth-guards'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/user/_authenticated')({
  beforeLoad: requireRole(['user', 'admin']),
  component: AuthenticatedLayout,
})
