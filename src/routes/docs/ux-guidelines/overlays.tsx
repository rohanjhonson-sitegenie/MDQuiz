import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, Check, X, Info, HelpCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DecisionTree } from '@/features/docs/components/DecisionTree'
import { PatternExample } from '@/features/docs/components/PatternExample'

export const Route = createFileRoute('/docs/ux-guidelines/overlays')({
  component: OverlayPatterns,
})

function OverlayPatterns() {
  const overlayDecisionTree = [
    {
      id: 'start',
      question: 'What is the primary purpose of the overlay?',
      options: [
        {
          label: 'Display brief information on hover/focus',
          nextId: 'brief-info',
        },
        { label: 'Show interactive content or forms', nextId: 'interactive' },
        { label: 'Require user decision or action', nextId: 'user-action' },
      ],
    },
    {
      id: 'brief-info',
      question: 'How much information needs to be shown?',
      options: [
        {
          label: 'Short label or hint (1-2 words)',
          result: 'Use Tooltip for concise helper text',
        },
        {
          label: 'Paragraph or formatted content',
          result: 'Use Popover with click trigger for richer content',
        },
        {
          label: 'Just an icon explanation',
          result: 'Use Tooltip with icon button trigger',
        },
      ],
    },
    {
      id: 'interactive',
      question: 'How much screen space is needed?',
      options: [
        {
          label: 'Small form or options (< 400px)',
          nextId: 'small-interactive',
        },
        { label: 'Large content or multi-step', nextId: 'large-interactive' },
        {
          label: 'Full-height navigation or filters',
          result: 'Use Sheet/Drawer sliding from side',
        },
      ],
    },
    {
      id: 'small-interactive',
      question: 'Should the user see the page behind?',
      options: [
        {
          label: 'Yes, context is important',
          result: 'Use Popover for inline interactions',
        },
        {
          label: 'No, focus on the task',
          result: 'Use Modal Dialog with backdrop',
        },
      ],
    },
    {
      id: 'large-interactive',
      question: 'Is this a primary workflow or secondary?',
      options: [
        {
          label: 'Primary (main user task)',
          result: 'Use full-screen Modal or page navigation',
        },
        {
          label: 'Secondary (settings, filters)',
          result: 'Use Sheet/Drawer to maintain context',
        },
      ],
    },
    {
      id: 'user-action',
      question: 'Is the action destructive or critical?',
      options: [
        {
          label: 'Yes, needs confirmation',
          result: 'Use Modal Dialog with clear actions and consequences',
        },
        {
          label: 'No, informational only',
          result: 'Use Popover or inline messaging instead',
        },
      ],
    },
  ]

  const modalCode = `<Dialog>
  <DialogTrigger asChild>
    <Button>Delete Account</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your
        account and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete Account</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`

  const drawerCode = `<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open Filters</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Filter Results</SheetTitle>
      <SheetDescription>
        Narrow down your search results using the filters below.
      </SheetDescription>
    </SheetHeader>
    <div className="py-4">
      {/* Filter content */}
      <div className="space-y-4">
        <div>
          <Label>Category</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
          </Select>
        </div>
        <div>
          <Label>Price Range</Label>
          <Slider />
        </div>
      </div>
    </div>
  </SheetContent>
</Sheet>`

  const popoverCode = `<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" size="icon">
      <Settings className="h-4 w-4" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Dimensions</h4>
        <p className="text-sm text-muted-foreground">
          Set the dimensions for the layer.
        </p>
      </div>
      <div className="grid gap-2">
        <Input placeholder="Width" />
        <Input placeholder="Height" />
      </div>
    </div>
  </PopoverContent>
</Popover>`

  const tooltipCode = `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline" size="icon">
        <HelpCircle className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Click to learn more</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-4xl font-bold tracking-tight'>Overlay Patterns</h1>
        <p className='text-muted-foreground mt-4 text-lg'>
          Overlays temporarily cover page content to focus user attention.
          Choose the right overlay pattern based on content complexity, user
          task, and interaction requirements.
        </p>
      </div>

      <DecisionTree
        title='Overlay Pattern Selection'
        nodes={overlayDecisionTree}
        className='mb-8'
      />

      <div className='space-y-12'>
        {/* Modal Pattern */}
        <section id='modal'>
          <h2 className='mb-6 text-3xl font-semibold'>Modal Dialog</h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <div className='flex gap-2'>
                <Badge variant='outline'>Focus Required</Badge>
                <Badge variant='outline'>Blocking Interaction</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Modals demand immediate attention by blocking interaction with
                the rest of the page. Use them for critical decisions or focused
                workflows.
              </p>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-medium text-green-600 dark:text-green-400'>
                    ✓ When to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Confirmations for destructive actions</li>
                    <li>• Complex forms requiring focus</li>
                    <li>• Terms acceptance or legal content</li>
                    <li>• Error states requiring resolution</li>
                    <li>• Media viewers (images, videos)</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-red-600 dark:text-red-400'>
                    ✗ When NOT to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Non-critical information</li>
                    <li>• Frequently accessed tools</li>
                    <li>• Mobile-first interfaces</li>
                    <li>• Marketing/promotional content</li>
                    <li>• Success messages (use toast)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Confirmation Modal'
            description='Critical action requiring user confirmation'
            code={modalCode}
          >
            <Dialog>
              <DialogTrigger asChild>
                <Button variant='destructive'>Delete Account</Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant='outline'>Cancel</Button>
                  <Button variant='destructive'>Delete Account</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PatternExample>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle className='text-lg'>Modal Best Practices</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Include Close Options</p>
                  <p className='text-muted-foreground text-sm'>
                    X button, Cancel button, and Escape key should all close
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Focus Management</p>
                  <p className='text-muted-foreground text-sm'>
                    Focus should move to modal and return to trigger on close
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <X className='mt-0.5 h-4 w-4 text-red-600' />
                <div>
                  <p className='font-medium'>Avoid Modal Stacking</p>
                  <p className='text-muted-foreground text-sm'>
                    Never open a modal from another modal
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Drawer/Sheet Pattern */}
        <section id='drawer'>
          <h2 className='mb-6 text-3xl font-semibold'>Drawer / Sheet</h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <div className='flex gap-2'>
                <Badge variant='outline'>Contextual</Badge>
                <Badge variant='outline'>Mobile-Friendly</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Drawers slide in from the edge of the screen, maintaining some
                context of the underlying page while providing focused
                interaction space.
              </p>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-medium text-green-600 dark:text-green-400'>
                    ✓ When to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Navigation menus on mobile</li>
                    <li>• Filter and sort controls</li>
                    <li>• Settings panels</li>
                    <li>• Shopping carts</li>
                    <li>• Chat interfaces</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-red-600 dark:text-red-400'>
                    ✗ When NOT to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Critical alerts or errors</li>
                    <li>• Simple confirmations</li>
                    <li>• Content requiring full width</li>
                    <li>• Multi-step processes</li>
                    <li>• Desktop-primary interfaces</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Filter Drawer'
            description='Side drawer for filtering options'
            code={drawerCode}
          >
            <Sheet>
              <SheetTrigger asChild>
                <Button variant='outline'>Open Filters</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Results</SheetTitle>
                  <SheetDescription>
                    Narrow down your search results using the filters below.
                  </SheetDescription>
                </SheetHeader>
                <div className='py-4'>
                  <div className='space-y-4'>
                    <div>
                      <label className='text-sm font-medium'>Category</label>
                      <div className='bg-background mt-2 h-10 rounded-md border' />
                    </div>
                    <div>
                      <label className='text-sm font-medium'>Price Range</label>
                      <div className='bg-background mt-2 h-10 rounded-md border' />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </PatternExample>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle className='text-lg'>Drawer Positioning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 text-sm'>
                <div className='flex gap-3'>
                  <Badge variant='outline'>Left</Badge>
                  <span>Navigation menus, app sidebars</span>
                </div>
                <div className='flex gap-3'>
                  <Badge variant='outline'>Right</Badge>
                  <span>Settings, filters, shopping carts</span>
                </div>
                <div className='flex gap-3'>
                  <Badge variant='outline'>Bottom</Badge>
                  <span>Mobile actions, share sheets, partial content</span>
                </div>
                <div className='flex gap-3'>
                  <Badge variant='outline'>Top</Badge>
                  <span>Notifications (rarely used)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Popover Pattern */}
        <section id='popover'>
          <h2 className='mb-6 text-3xl font-semibold'>Popover</h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <div className='flex gap-2'>
                <Badge variant='outline'>Non-Blocking</Badge>
                <Badge variant='outline'>Contextual</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Popovers display rich content in a floating panel anchored to a
                trigger element, without blocking the rest of the interface.
              </p>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-medium text-green-600 dark:text-green-400'>
                    ✓ When to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Inline editing forms</li>
                    <li>• Extended information</li>
                    <li>• Quick actions menus</li>
                    <li>• Color/emoji pickers</li>
                    <li>• Mini previews</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-red-600 dark:text-red-400'>
                    ✗ When NOT to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Simple text hints (use tooltip)</li>
                    <li>• Critical actions</li>
                    <li>• Large content areas</li>
                    <li>• Mobile interfaces</li>
                    <li>• Error messages</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Settings Popover'
            description='Inline settings with immediate apply'
            code={popoverCode}
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button variant='outline'>
                  <Info className='mr-2 h-4 w-4' />
                  View Details
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-80'>
                <div className='grid gap-4'>
                  <div className='space-y-2'>
                    <h4 className='leading-none font-medium'>Dimensions</h4>
                    <p className='text-muted-foreground text-sm'>
                      Set the dimensions for the layer.
                    </p>
                  </div>
                  <div className='grid gap-2'>
                    <div className='bg-background h-8 rounded border' />
                    <div className='bg-background h-8 rounded border' />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </PatternExample>
        </section>

        {/* Tooltip Pattern */}
        <section id='tooltip'>
          <h2 className='mb-6 text-3xl font-semibold'>Tooltip</h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <div className='flex gap-2'>
                <Badge variant='outline'>Minimal</Badge>
                <Badge variant='outline'>Hover/Focus</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Tooltips provide brief, contextual information on hover or
                focus, perfect for labels, hints, and clarifications.
              </p>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-medium text-green-600 dark:text-green-400'>
                    ✓ When to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Icon button labels</li>
                    <li>• Truncated text expansion</li>
                    <li>• Keyboard shortcuts</li>
                    <li>• Form field hints</li>
                    <li>• Status explanations</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-red-600 dark:text-red-400'>
                    ✗ When NOT to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Essential information</li>
                    <li>• Interactive content</li>
                    <li>• Long explanations</li>
                    <li>• Touch-only interfaces</li>
                    <li>• Error messages</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Icon Button Tooltip'
            description='Label for icon-only buttons'
            code={tooltipCode}
          >
            <TooltipProvider>
              <div className='flex gap-2'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant='outline' size='icon'>
                      <HelpCircle className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get help</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant='outline' size='icon'>
                      <Info className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More information</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </PatternExample>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle className='text-lg'>Tooltip Guidelines</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Keep It Brief</p>
                  <p className='text-muted-foreground text-sm'>
                    Maximum 1-2 short sentences
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Delay Before Showing</p>
                  <p className='text-muted-foreground text-sm'>
                    Use 500-700ms delay to prevent accidental triggers
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Position Intelligently</p>
                  <p className='text-muted-foreground text-sm'>
                    Auto-adjust position to stay within viewport
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className='mt-6'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              <strong>Accessibility:</strong> All overlays must trap focus
              appropriately, support keyboard navigation (Escape to close), and
              announce their presence to screen readers. Use appropriate ARIA
              attributes like role="dialog" and aria-modal="true".
            </AlertDescription>
          </Alert>
        </section>
      </div>
    </div>
  )
}
