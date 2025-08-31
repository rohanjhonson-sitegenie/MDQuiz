import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '@/lib/auth-guards'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/admin/_authenticated')({
  beforeLoad: requireRole(['superadmin', 'admin']),
  component: AuthenticatedLayout,
})
