import React, { Suspense, useState } from 'react'
import { IconLoader } from '@tabler/icons-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Lazy load heavy demo components
const BadgesInCards = React.lazy(() =>
  import('../examples/badges-in-cards').then((module) => ({
    default: module.BadgesInCards,
  }))
)
const BadgesInNav = React.lazy(() =>
  import('../examples/badges-in-nav').then((module) => ({
    default: module.BadgesInNav,
  }))
)
const BadgesInTable = React.lazy(() =>
  import('../examples/badges-in-table').then((module) => ({
    default: module.BadgesInTable,
  }))
)
const BadgeBasics = React.lazy(() =>
  import('../sections/badge-basics').then((module) => ({
    default: module.BadgeBasics,
  }))
)
const BadgeCompositions = React.lazy(() =>
  import('../sections/badge-compositions').then((module) => ({
    default: module.BadgeCompositions,
  }))
)
const NotificationBadgesDemo = React.lazy(() =>
  import('../sections/notification-badges-demo').then((module) => ({
    default: module.NotificationBadgesDemo,
  }))
)
const StatusBadgesDemo = React.lazy(() =>
  import('../sections/status-badges-demo').then((module) => ({
    default: module.StatusBadgesDemo,
  }))
)
const BadgePlayground = React.lazy(() =>
  import('./badge-playground').then((module) => ({
    default: module.BadgePlayground,
  }))
)
const BadgeVariantGrid = React.lazy(() =>
  import('./badge-variant-grid').then((module) => ({
    default: module.BadgeVariantGrid,
  }))
)

const LoadingFallback = () => (
  <div className='flex items-center justify-center p-8'>
    <IconLoader className='text-muted-foreground h-6 w-6 animate-spin' />
    <span className='text-muted-foreground ml-2 text-sm'>Loading demo...</span>
  </div>
)

export function BadgesDemo() {
  const [activeSection, setActiveSection] = useState('playground')

  return (
    <div className='container mx-auto py-8'>
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold'>Badge Design System</h1>
        <p className='text-muted-foreground'>
          A comprehensive badge system inspired by Dell Design System with
          semantic colors, multiple sizes, and emphasis levels.
        </p>
      </div>

      <Tabs
        value={activeSection}
        onValueChange={setActiveSection}
        className='space-y-4'
      >
        <TabsList className='grid w-full grid-cols-4 lg:grid-cols-8'>
          <TabsTrigger value='playground'>Playground</TabsTrigger>
          <TabsTrigger value='variants'>Variants</TabsTrigger>
          <TabsTrigger value='status'>Status</TabsTrigger>
          <TabsTrigger value='notifications'>Notifications</TabsTrigger>
          <TabsTrigger value='compositions'>Compositions</TabsTrigger>
          <TabsTrigger value='tables'>Tables</TabsTrigger>
          <TabsTrigger value='cards'>Cards</TabsTrigger>
          <TabsTrigger value='navigation'>Navigation</TabsTrigger>
        </TabsList>

        <TabsContent value='playground' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Interactive Playground</CardTitle>
              <CardDescription>
                Experiment with different badge configurations and see the code
                in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingFallback />}>
                <BadgePlayground />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='variants' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>All Variants</CardTitle>
              <CardDescription>
                Complete matrix of all badge variants, sizes, and emphasis
                levels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingFallback />}>
                <BadgeVariantGrid />
              </Suspense>
            </CardContent>
          </Card>
          <Suspense fallback={<LoadingFallback />}>
            <BadgeBasics />
          </Suspense>
        </TabsContent>

        <TabsContent value='status' className='space-y-4'>
          <Suspense fallback={<LoadingFallback />}>
            <StatusBadgesDemo />
          </Suspense>
        </TabsContent>

        <TabsContent value='notifications' className='space-y-4'>
          <Suspense fallback={<LoadingFallback />}>
            <NotificationBadgesDemo />
          </Suspense>
        </TabsContent>

        <TabsContent value='compositions' className='space-y-4'>
          <Suspense fallback={<LoadingFallback />}>
            <BadgeCompositions />
          </Suspense>
        </TabsContent>

        <TabsContent value='tables' className='space-y-4'>
          <Suspense fallback={<LoadingFallback />}>
            <BadgesInTable />
          </Suspense>
        </TabsContent>

        <TabsContent value='cards' className='space-y-4'>
          <Suspense fallback={<LoadingFallback />}>
            <BadgesInCards />
          </Suspense>
        </TabsContent>

        <TabsContent value='navigation' className='space-y-4'>
          <Suspense fallback={<LoadingFallback />}>
            <BadgesInNav />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
