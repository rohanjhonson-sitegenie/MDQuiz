import React, { Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { IconLoader } from '@tabler/icons-react'
import { requireRole } from '@/lib/auth-guards'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

const Settings = React.lazy(() => import('@/features/settings'))

const SettingsWithSuspense = () => (
  <Suspense
    fallback={
      <div className='flex items-center justify-center p-8'>
        <IconLoader className='text-muted-foreground h-6 w-6 animate-spin' />
        <span className='text-muted-foreground ml-2 text-sm'>
          Loading settings...
        </span>
      </div>
    }
  >
    <Settings />
  </Suspense>
)

export const Route = createFileRoute('/me/_authenticated')({
  beforeLoad: requireRole([
    'superadmin',
    'admin',
    'student',
    'parent',
    'teacher',
  ]),
  component: () => (
    <AuthenticatedLayout>
      <SettingsWithSuspense />
    </AuthenticatedLayout>
  ),
})
