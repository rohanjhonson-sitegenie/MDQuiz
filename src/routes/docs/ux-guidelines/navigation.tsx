import { createFileRoute } from '@tanstack/react-router'
import { Home, ArrowLeft, AlertCircle, Check, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DecisionTree } from '@/features/docs/components/DecisionTree'
import { PatternExample } from '@/features/docs/components/PatternExample'

export const Route = createFileRoute('/docs/ux-guidelines/navigation')({
  component: NavigationPatterns,
})

function NavigationPatterns() {
  const navigationDecisionTree = [
    {
      id: 'start',
      question: 'What type of navigation do you need?',
      options: [
        { label: 'Show current location in hierarchy', nextId: 'hierarchy' },
        { label: 'Navigate between peer content', nextId: 'peer' },
        { label: 'Return to previous page', nextId: 'back' },
      ],
    },
    {
      id: 'hierarchy',
      question: 'How deep is your navigation hierarchy?',
      options: [
        {
          label: '2-5 levels deep',
          result: 'Use Breadcrumb navigation for clear hierarchy visualization',
        },
        {
          label: 'More than 5 levels',
          result:
            'Consider a combination of Breadcrumb (showing last 3-4 levels) with a "View all" option',
        },
        {
          label: 'Variable or unknown depth',
          result: 'Use collapsible Breadcrumb with smart truncation',
        },
      ],
    },
    {
      id: 'peer',
      question: 'How many navigation options do you have?',
      options: [
        { label: '2-7 options', nextId: 'peer-visibility' },
        {
          label: 'More than 7 options',
          result: 'Use Side Navigation with grouping and search functionality',
        },
      ],
    },
    {
      id: 'peer-visibility',
      question: 'Should all options be visible at once?',
      options: [
        {
          label: 'Yes, always visible',
          result: 'Use Tabs for immediate access to all options',
        },
        {
          label: 'Can be collapsed on mobile',
          result:
            'Use responsive Tabs that convert to dropdown on small screens',
        },
        {
          label: 'Progressive disclosure preferred',
          result: 'Use Side Navigation with collapsible sections',
        },
      ],
    },
    {
      id: 'back',
      question: 'Is this part of a linear flow?',
      options: [
        {
          label: 'Yes, step-by-step process',
          result:
            'Use Back Link with step indicator (e.g., "Back to Step 2: Details")',
        },
        {
          label: 'No, general navigation',
          result:
            'Use Back Link with contextual label (e.g., "Back to Dashboard")',
        },
      ],
    },
  ]

  const breadcrumbCode = `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/products">Products</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/products/electronics">Electronics</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Smartphones</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`

  const backLinkCode = `<Button variant="ghost" className="gap-2" onClick={() => router.back()}>
  <ArrowLeft className="h-4 w-4" />
  Back to Dashboard
</Button>`

  const tabsCode = `<Tabs defaultValue="overview" className="w-full">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="reports">Reports</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content</TabsContent>
  <TabsContent value="analytics">Analytics content</TabsContent>
  <TabsContent value="reports">Reports content</TabsContent>
  <TabsContent value="settings">Settings content</TabsContent>
</Tabs>`

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-4xl font-bold tracking-tight'>
          Navigation Patterns
        </h1>
        <p className='text-muted-foreground mt-4 text-lg'>
          Navigation patterns help users understand where they are, where they
          can go, and how to get back. Choose the right pattern based on your
          information architecture and user needs.
        </p>
      </div>

      <DecisionTree
        title='Navigation Pattern Selection'
        nodes={navigationDecisionTree}
        className='mb-8'
      />

      <div className='space-y-12'>
        {/* Breadcrumb Pattern */}
        <section id='breadcrumb'>
          <h2 className='mb-6 text-3xl font-semibold'>Breadcrumb Navigation</h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <div className='flex gap-2'>
                <Badge variant='outline'>Wayfinding</Badge>
                <Badge variant='outline'>Hierarchy</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Breadcrumbs show users their current location within a
                hierarchical structure and provide a path back to higher levels.
              </p>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-medium text-green-600 dark:text-green-400'>
                    ✓ When to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Hierarchical sites with 3+ levels</li>
                    <li>• E-commerce category navigation</li>
                    <li>• Documentation sites</li>
                    <li>• File/folder structures</li>
                    <li>• Multi-step processes (with modifications)</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-red-600 dark:text-red-400'>
                    ✗ When NOT to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Flat site structures</li>
                    <li>• Mobile-first applications (limited space)</li>
                    <li>• Single-level navigation</li>
                    <li>• As primary navigation</li>
                    <li>• Linear wizards (use steppers instead)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Basic Breadcrumb'
            description='Standard breadcrumb showing hierarchical navigation'
            code={breadcrumbCode}
          >
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href='#'>
                    <Home className='h-4 w-4' />
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href='#'>Products</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href='#'>Electronics</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Smartphones</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </PatternExample>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle className='text-lg'>Best Practices</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Start with Home or Root</p>
                  <p className='text-muted-foreground text-sm'>
                    Always begin with the highest level (Home icon or text)
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Current Page Not Clickable</p>
                  <p className='text-muted-foreground text-sm'>
                    The last item should be text only, not a link
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Use Consistent Separators</p>
                  <p className='text-muted-foreground text-sm'>
                    Stick with chevrons (›) or slashes (/) throughout
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Truncate Long Paths</p>
                  <p className='text-muted-foreground text-sm'>
                    Show first 2 and last 2 levels with "..." for very deep
                    hierarchies
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className='mt-6'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              <strong>Accessibility:</strong> Use proper ARIA labels, ensure
              keyboard navigation works, and mark the current page with
              aria-current="page". Screen readers should announce the full path.
            </AlertDescription>
          </Alert>
        </section>

        {/* Back Link Pattern */}
        <section id='back-link'>
          <h2 className='mb-6 text-3xl font-semibold'>Back Link</h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <div className='flex gap-2'>
                <Badge variant='outline'>Return Navigation</Badge>
                <Badge variant='outline'>Context-Aware</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Back links provide a clear way to return to the previous page or
                step, with explicit context about where the user will go.
              </p>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-medium text-green-600 dark:text-green-400'>
                    ✓ When to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Detail pages from lists</li>
                    <li>• Multi-step forms/wizards</li>
                    <li>• Modal-like full pages</li>
                    <li>• Deep-dive content pages</li>
                    <li>• Mobile navigation patterns</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-red-600 dark:text-red-400'>
                    ✗ When NOT to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Home or landing pages</li>
                    <li>• Multiple entry points exist</li>
                    <li>• Browser back works differently</li>
                    <li>• Complex navigation paths</li>
                    <li>• As sole navigation method</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Contextual Back Link'
            description='Back link with clear destination label'
            code={backLinkCode}
          >
            <div className='space-y-3'>
              <Button variant='ghost' className='gap-2'>
                <ArrowLeft className='h-4 w-4' />
                Back to Dashboard
              </Button>
              <Button variant='ghost' size='sm' className='gap-1.5'>
                <ArrowLeft className='h-3.5 w-3.5' />
                Back to Search Results
              </Button>
            </div>
          </PatternExample>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle className='text-lg'>Best Practices</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Use Descriptive Labels</p>
                  <p className='text-muted-foreground text-sm'>
                    "Back to [Context]" not just "Back"
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Position Consistently</p>
                  <p className='text-muted-foreground text-sm'>
                    Top-left is standard, before the page title
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <X className='mt-0.5 h-4 w-4 text-red-600' />
                <div>
                  <p className='font-medium'>Don't Rely on Browser Back</p>
                  <p className='text-muted-foreground text-sm'>
                    In SPAs, browser back might not match user expectations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tabs Pattern */}
        <section id='tabs'>
          <h2 className='mb-6 text-3xl font-semibold'>Tabs Navigation</h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <div className='flex gap-2'>
                <Badge variant='outline'>Content Organization</Badge>
                <Badge variant='outline'>Peer Navigation</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Tabs organize related content into distinct sections, allowing
                users to quickly switch between different views without leaving
                the page.
              </p>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-medium text-green-600 dark:text-green-400'>
                    ✓ When to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• 2-7 related content sections</li>
                    <li>• User needs quick comparison</li>
                    <li>• Content is mutually exclusive</li>
                    <li>• Reducing cognitive load</li>
                    <li>• Form sections (with validation)</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-red-600 dark:text-red-400'>
                    ✗ When NOT to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Sequential content/steps</li>
                    <li>• More than 7 tabs needed</li>
                    <li>• Tabs require scrolling</li>
                    <li>• On mobile (consider accordion)</li>
                    <li>• Comparing data (use toggle/filter)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Basic Tabs'
            description='Standard horizontal tabs for content organization'
            code={tabsCode}
          >
            <Tabs defaultValue='overview' className='w-[400px]'>
              <TabsList>
                <TabsTrigger value='overview'>Overview</TabsTrigger>
                <TabsTrigger value='analytics'>Analytics</TabsTrigger>
                <TabsTrigger value='reports'>Reports</TabsTrigger>
                <TabsTrigger value='settings'>Settings</TabsTrigger>
              </TabsList>
              <TabsContent value='overview' className='mt-4'>
                <p className='text-muted-foreground text-sm'>
                  Overview content goes here. This tab provides general
                  information.
                </p>
              </TabsContent>
              <TabsContent value='analytics' className='mt-4'>
                <p className='text-muted-foreground text-sm'>
                  Analytics data and charts would be displayed in this section.
                </p>
              </TabsContent>
              <TabsContent value='reports' className='mt-4'>
                <p className='text-muted-foreground text-sm'>
                  Generated reports and downloads available here.
                </p>
              </TabsContent>
              <TabsContent value='settings' className='mt-4'>
                <p className='text-muted-foreground text-sm'>
                  Configuration and preferences for this section.
                </p>
              </TabsContent>
            </Tabs>
          </PatternExample>

          <Alert className='mt-6'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              <strong>Accessibility:</strong> Use role="tablist", role="tab",
              and role="tabpanel". Support keyboard navigation with Arrow keys.
              Maintain focus management when switching tabs.
            </AlertDescription>
          </Alert>
        </section>

        {/* Side Navigation Pattern */}
        <section id='side-navigation'>
          <h2 className='mb-6 text-3xl font-semibold'>Side Navigation</h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <div className='flex gap-2'>
                <Badge variant='outline'>Primary Navigation</Badge>
                <Badge variant='outline'>Hierarchical</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Side navigation provides persistent access to main sections of
                an application, supporting both flat and nested information
                architectures.
              </p>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-medium text-green-600 dark:text-green-400'>
                    ✓ When to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Complex applications</li>
                    <li>• 5+ main sections</li>
                    <li>• Nested navigation needed</li>
                    <li>• Desktop-first applications</li>
                    <li>• Admin/dashboard interfaces</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-red-600 dark:text-red-400'>
                    ✗ When NOT to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Simple websites</li>
                    <li>• Mobile-first design</li>
                    <li>• Marketing pages</li>
                    <li>• Less than 5 sections</li>
                    <li>• Content-focused sites</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle className='text-lg'>
                Implementation Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Collapsible on Mobile</p>
                  <p className='text-muted-foreground text-sm'>
                    Transform to hamburger menu or bottom nav on small screens
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Clear Active States</p>
                  <p className='text-muted-foreground text-sm'>
                    Highlight current section with color, weight, or background
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Support Keyboard Navigation</p>
                  <p className='text-muted-foreground text-sm'>
                    Tab through items, Enter to select, Escape to close on
                    mobile
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
