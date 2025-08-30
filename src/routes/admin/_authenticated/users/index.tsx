import React, { Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { IconLoader } from '@tabler/icons-react'

const Users = React.lazy(() => import('@/features/users'))

const UsersWithSuspense = () => (
  <Suspense
    fallback={
      <div className='flex items-center justify-center p-8'>
        <IconLoader className='text-muted-foreground h-6 w-6 animate-spin' />
        <span className='text-muted-foreground ml-2 text-sm'>
          Loading users...
        </span>
      </div>
    }
  >
    <Users />
  </Suspense>
)

export const Route = createFileRoute('/admin/_authenticated/users/')({
  component: UsersWithSuspense,
})
