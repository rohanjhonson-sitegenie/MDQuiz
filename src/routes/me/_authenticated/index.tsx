import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/me/_authenticated/')({
  beforeLoad: () => {
    throw redirect({
      to: '/me/profile',
    })
  },
})
