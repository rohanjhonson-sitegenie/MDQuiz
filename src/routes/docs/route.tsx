import { Outlet, createFileRoute } from '@tanstack/react-router'
import { DocLayout } from '@/features/docs/components/DocLayout'

export const Route = createFileRoute('/docs')({
  component: DocsLayout,
})

function DocsLayout() {
  return (
    <DocLayout>
      <Outlet />
    </DocLayout>
  )
}
