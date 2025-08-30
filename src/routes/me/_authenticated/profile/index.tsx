import React, { Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { IconLoader } from '@tabler/icons-react'

const SettingsProfile = React.lazy(() => import('@/features/settings/profile'))

const SettingsProfileWithSuspense = () => (
  <Suspense
    fallback={
      <div className='flex items-center justify-center p-4'>
        <IconLoader className='text-muted-foreground h-4 w-4 animate-spin' />
        <span className='text-muted-foreground ml-2 text-xs'>
          Loading profile...
        </span>
      </div>
    }
  >
    <SettingsProfile />
  </Suspense>
)

export const Route = createFileRoute('/me/_authenticated/profile/')({
  component: SettingsProfileWithSuspense,
})
