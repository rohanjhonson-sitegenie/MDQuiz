import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, Check, ChevronRight, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { DecisionTree } from '@/features/docs/components/DecisionTree'
import { PatternExample } from '@/features/docs/components/PatternExample'

export const Route = createFileRoute('/docs/ux-guidelines/layout-flows')({
  component: LayoutFlowsPatterns,
})

function LayoutFlowsPatterns() {
  const layoutDecisionTree = [
    {
      id: 'start',
      question: 'What type of content are you displaying?',
      options: [
        { label: 'Multi-step process or form', nextId: 'multi-step' },
        {
          label: 'List of items (products, articles, etc.)',
          nextId: 'list-display',
        },
        { label: 'Large dataset or search results', nextId: 'data-loading' },
      ],
    },
    {
      id: 'multi-step',
      question: 'Are all steps required or can users skip?',
      options: [
        {
          label: 'All steps required in order',
          result: 'Use a Linear Stepper with disabled future steps',
        },
        {
          label: 'Users can jump between steps',
          result: 'Use a Non-linear Stepper with clickable steps',
        },
        {
          label: 'Mix of required and optional',
          result:
            'Use Stepper with visual indicators for required vs optional steps',
        },
      ],
    },
    {
      id: 'list-display',
      question: 'How much information per item?',
      options: [
        { label: 'Minimal (title, 1-2 details)', nextId: 'minimal-view' },
        {
          label: 'Rich content (image, multiple details)',
          nextId: 'rich-view',
        },
        {
          label: 'Variable based on user preference',
          result: 'Provide view toggle between Card and List views',
        },
      ],
    },
    {
      id: 'minimal-view',
      question: 'How many items typically shown?',
      options: [
        {
          label: 'Less than 20 items',
          result: 'Use simple List View with hover states',
        },
        {
          label: 'Potentially hundreds',
          result: 'Use List View with virtualization for performance',
        },
      ],
    },
    {
      id: 'rich-view',
      question: 'Is visual browsing important?',
      options: [
        {
          label: 'Yes, images are key',
          result: 'Use Card View with prominent images',
        },
        {
          label: 'No, text content matters more',
          result: 'Use List View with optional thumbnails',
        },
      ],
    },
    {
      id: 'data-loading',
      question: 'How do users typically browse?',
      options: [
        { label: 'Exploring/discovering content', nextId: 'explore-pattern' },
        {
          label: 'Looking for specific items',
          result: 'Use Pagination with search and filters',
        },
        {
          label: 'Continuous browsing (social feeds)',
          result: 'Use Infinite Scroll with loading indicators',
        },
      ],
    },
    {
      id: 'explore-pattern',
      question: 'Do users need to return to specific positions?',
      options: [
        {
          label: 'Yes, they reference back',
          result: 'Use Pagination to maintain position context',
        },
        {
          label: 'No, always moving forward',
          result: 'Use Infinite Scroll for seamless exploration',
        },
      ],
    },
  ]

  const stepperCode = `// Linear Stepper Component
const steps = [
  { label: 'Account Details', completed: true },
  { label: 'Personal Information', active: true },
  { label: 'Payment Method', disabled: true },
  { label: 'Review & Submit', disabled: true }
];

<div className="flex items-center justify-between">
  {steps.map((step, index) => (
    <div key={index} className="flex items-center">
      <div className={\`
        \${step.completed ? 'bg-primary text-primary-foreground' : ''}
        \${step.active ? 'border-primary text-primary' : ''}
        \${step.disabled ? 'bg-muted text-muted-foreground' : ''}
        rounded-full w-8 h-8 flex items-center justify-center border-2
      \`}>
        {step.completed ? '✓' : index + 1}
      </div>
      <span className="ml-2 text-sm">{step.label}</span>
      {index < steps.length - 1 && (
        <ChevronRight className="mx-2 text-muted-foreground" />
      )}
    </div>
  ))}
</div>`

  const paginationCode = `<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">10</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>`

  const infiniteScrollCode = `// Infinite Scroll with Intersection Observer
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = 
  useInfiniteQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

const observer = useIntersectionObserver({
  threshold: 0.1,
  onIntersect: () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  },
});

return (
  <div>
    {data.pages.map((page) => (
      page.items.map((item) => <ItemCard key={item.id} {...item} />)
    ))}
    <div ref={observer.ref} className="h-10">
      {isFetchingNextPage && <Loader2 className="animate-spin" />}
    </div>
  </div>
);`

  const cardListToggleCode = `// View Toggle Component
const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

<ToggleGroup type="single" value={viewMode} onValueChange={setViewMode}>
  <ToggleGroupItem value="card" aria-label="Card view">
    <Grid3x3 className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="list" aria-label="List view">
    <List className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>

{viewMode === 'card' ? (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {items.map(item => <ItemCard key={item.id} {...item} />)}
  </div>
) : (
  <div className="space-y-2">
    {items.map(item => <ItemListRow key={item.id} {...item} />)}
  </div>
)}`

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-4xl font-bold tracking-tight'>
          Layout & Flow Patterns
        </h1>
        <p className='text-muted-foreground mt-4 text-lg'>
          Layout patterns determine how users progress through content and
          interact with lists of information. Choose patterns that match user
          mental models and task requirements.
        </p>
      </div>

      <DecisionTree
        title='Layout Pattern Selection'
        nodes={layoutDecisionTree}
        className='mb-8'
      />

      <div className='space-y-12'>
        {/* Stepper Pattern */}
        <section id='stepper'>
          <h2 className='mb-6 text-3xl font-semibold'>Stepper</h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <div className='flex gap-2'>
                <Badge variant='outline'>Multi-step Process</Badge>
                <Badge variant='outline'>Progress Indicator</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Steppers guide users through multi-step workflows by breaking
                complex tasks into manageable chunks and showing progress.
              </p>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-medium text-green-600 dark:text-green-400'>
                    ✓ When to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Forms with 3+ logical sections</li>
                    <li>• Onboarding flows</li>
                    <li>• Checkout processes</li>
                    <li>• Configuration wizards</li>
                    <li>• Task completion workflows</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-red-600 dark:text-red-400'>
                    ✗ When NOT to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Simple forms (use sections)</li>
                    <li>• Non-linear processes</li>
                    <li>• Optional/skippable content</li>
                    <li>• Mobile screens (limited space)</li>
                    <li>• Frequently repeated tasks</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Linear Process Stepper'
            description='Step-by-step progression with validation'
            code={stepperCode}
          >
            <div className='w-full'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <div className='bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full'>
                    ✓
                  </div>
                  <span className='ml-2 text-sm font-medium'>
                    Account Details
                  </span>
                </div>
                <ChevronRight className='text-muted-foreground mx-2 h-4 w-4' />
                <div className='flex items-center'>
                  <div className='border-primary text-primary flex h-8 w-8 items-center justify-center rounded-full border-2'>
                    2
                  </div>
                  <span className='ml-2 text-sm font-medium'>
                    Personal Info
                  </span>
                </div>
                <ChevronRight className='text-muted-foreground mx-2 h-4 w-4' />
                <div className='flex items-center'>
                  <div className='bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full'>
                    3
                  </div>
                  <span className='text-muted-foreground ml-2 text-sm'>
                    Payment
                  </span>
                </div>
              </div>
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
                  <p className='font-medium'>Show Clear Progress</p>
                  <p className='text-muted-foreground text-sm'>
                    Users should always know where they are and what's left
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Allow Backward Navigation</p>
                  <p className='text-muted-foreground text-sm'>
                    Users can go back to previous steps to make changes
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Save Progress Automatically</p>
                  <p className='text-muted-foreground text-sm'>
                    Don't lose user data when navigating between steps
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Pagination vs Infinite Scroll */}
        <section id='pagination-infinite'>
          <h2 className='mb-6 text-3xl font-semibold'>
            Pagination vs Infinite Scroll
          </h2>

          <div className='grid gap-6 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Pagination</CardTitle>
                <Badge variant='outline'>Controlled Navigation</Badge>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h4 className='mb-2 font-medium text-green-600 dark:text-green-400'>
                    ✓ Best For
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Search results</li>
                    <li>• E-commerce catalogs</li>
                    <li>• Tables and data grids</li>
                    <li>• When users need to reference pages</li>
                    <li>• SEO-important content</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-orange-600 dark:text-orange-400'>
                    ⚡ Advantages
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Clear sense of content scope</li>
                    <li>• Easy to bookmark/share pages</li>
                    <li>• Better for performance</li>
                    <li>• Supports browser back/forward</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Infinite Scroll</CardTitle>
                <Badge variant='outline'>Continuous Flow</Badge>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h4 className='mb-2 font-medium text-green-600 dark:text-green-400'>
                    ✓ Best For
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Social media feeds</li>
                    <li>• Image galleries</li>
                    <li>• Discovery/exploration</li>
                    <li>• Mobile-first interfaces</li>
                    <li>• Entertainment content</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-orange-600 dark:text-orange-400'>
                    ⚡ Advantages
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Engaging, addictive experience</li>
                    <li>• No interruption to browsing</li>
                    <li>• Great for touch devices</li>
                    <li>• Reduces decision fatigue</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <PatternExample
            title='Pagination Example'
            description='Standard pagination with page numbers'
            code={paginationCode}
            className='mt-6'
          >
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href='#' />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href='#'>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href='#' isActive>
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href='#'>3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href='#'>10</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href='#' />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </PatternExample>

          <PatternExample
            title='Infinite Scroll Loading'
            description='Loading indicator for continuous content'
            code={infiniteScrollCode}
            className='mt-6'
          >
            <div className='w-full space-y-4'>
              <div className='bg-muted h-20 rounded-lg' />
              <div className='bg-muted h-20 rounded-lg' />
              <div className='flex items-center justify-center py-4'>
                <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
                <span className='text-muted-foreground ml-2 text-sm'>
                  Loading more...
                </span>
              </div>
            </div>
          </PatternExample>

          <Alert className='mt-6'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              <strong>Performance Note:</strong> Infinite scroll can cause
              memory issues with very large datasets. Consider virtual scrolling
              or hybrid approaches (load more button after X items).
            </AlertDescription>
          </Alert>
        </section>

        {/* Card vs List View */}
        <section id='card-list'>
          <h2 className='mb-6 text-3xl font-semibold'>Card vs List View</h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>View Mode Comparison</CardTitle>
              <CardDescription>
                Different view modes serve different user needs and content
                types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-6 md:grid-cols-2'>
                <div>
                  <h4 className='mb-3 font-medium'>Card View</h4>
                  <div className='space-y-4'>
                    <div className='rounded-lg border p-4'>
                      <div className='bg-muted mb-2 h-32 rounded' />
                      <h5 className='font-medium'>Visual Browsing</h5>
                      <p className='text-muted-foreground mt-1 text-sm'>
                        Best when images help users make decisions
                      </p>
                    </div>
                    <ul className='space-y-1 text-sm'>
                      <li className='flex gap-2'>
                        <Check className='h-4 w-4 text-green-600' />
                        <span>Product catalogs</span>
                      </li>
                      <li className='flex gap-2'>
                        <Check className='h-4 w-4 text-green-600' />
                        <span>Media galleries</span>
                      </li>
                      <li className='flex gap-2'>
                        <Check className='h-4 w-4 text-green-600' />
                        <span>Dashboard widgets</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className='mb-3 font-medium'>List View</h4>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-3 rounded-lg border p-3'>
                        <div className='bg-muted h-10 w-10 rounded' />
                        <div className='flex-1'>
                          <p className='font-medium'>Efficient Scanning</p>
                          <p className='text-muted-foreground text-sm'>
                            Compact, scannable
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-3 rounded-lg border p-3'>
                        <div className='bg-muted h-10 w-10 rounded' />
                        <div className='flex-1'>
                          <p className='font-medium'>More Items Visible</p>
                          <p className='text-muted-foreground text-sm'>
                            Higher density
                          </p>
                        </div>
                      </div>
                    </div>
                    <ul className='space-y-1 text-sm'>
                      <li className='flex gap-2'>
                        <Check className='h-4 w-4 text-green-600' />
                        <span>Email/message lists</span>
                      </li>
                      <li className='flex gap-2'>
                        <Check className='h-4 w-4 text-green-600' />
                        <span>File browsers</span>
                      </li>
                      <li className='flex gap-2'>
                        <Check className='h-4 w-4 text-green-600' />
                        <span>Search results</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='View Mode Toggle'
            description='Let users choose their preferred view'
            code={cardListToggleCode}
          >
            <div className='w-full'>
              <div className='mb-4 flex justify-end'>
                <div className='inline-flex rounded-lg border p-1'>
                  <Button variant='ghost' size='sm' className='rounded-md px-3'>
                    <svg
                      className='h-4 w-4'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <rect x='3' y='3' width='7' height='7' strokeWidth='2' />
                      <rect x='14' y='3' width='7' height='7' strokeWidth='2' />
                      <rect x='3' y='14' width='7' height='7' strokeWidth='2' />
                      <rect
                        x='14'
                        y='14'
                        width='7'
                        height='7'
                        strokeWidth='2'
                      />
                    </svg>
                  </Button>
                  <Button
                    variant='secondary'
                    size='sm'
                    className='rounded-md px-3'
                  >
                    <svg
                      className='h-4 w-4'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <line x1='3' y1='6' x2='21' y2='6' strokeWidth='2' />
                      <line x1='3' y1='12' x2='21' y2='12' strokeWidth='2' />
                      <line x1='3' y1='18' x2='21' y2='18' strokeWidth='2' />
                    </svg>
                  </Button>
                </div>
              </div>
              <p className='text-muted-foreground text-center text-sm'>
                Toggle implementation shown above
              </p>
            </div>
          </PatternExample>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle className='text-lg'>Implementation Tips</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Remember User Preference</p>
                  <p className='text-muted-foreground text-sm'>
                    Store view preference in localStorage or user settings
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Responsive Defaults</p>
                  <p className='text-muted-foreground text-sm'>
                    Consider defaulting to list view on mobile devices
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Maintain Scroll Position</p>
                  <p className='text-muted-foreground text-sm'>
                    When switching views, keep the user at the same content
                    position
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className='mt-6'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              <strong>Accessibility:</strong> Ensure view toggle buttons have
              proper ARIA labels. Both views should be fully keyboard navigable
              and work with screen readers.
            </AlertDescription>
          </Alert>
        </section>
      </div>
    </div>
  )
}
