import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Book,
  Code,
  Palette,
  Users,
  Zap,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/docs/ux-guidelines/')({
  component: UXGuidelinesOverview,
})

function UXGuidelinesOverview() {
  const patterns = [
    {
      title: 'Navigation Patterns',
      description: 'Breadcrumbs, tabs, side navigation, and back links',
      icon: <Globe className='h-5 w-5' />,
      href: '/docs/ux-guidelines/navigation',
      patterns: ['Breadcrumb', 'Back Link', 'Tabs', 'Side Navigation'],
    },
    {
      title: 'Layout & Flows',
      description: 'Steppers, pagination, infinite scroll, and view options',
      icon: <Palette className='h-5 w-5' />,
      href: '/docs/ux-guidelines/layout-flows',
      patterns: ['Stepper', 'Pagination', 'Infinite Scroll', 'Card vs List'],
    },
    {
      title: 'Overlays',
      description: 'Modals, drawers, popovers, and tooltips',
      icon: <Book className='h-5 w-5' />,
      href: '/docs/ux-guidelines/overlays',
      patterns: ['Modal', 'Drawer', 'Popover', 'Tooltip'],
    },
    {
      title: 'Feedback',
      description: 'Toasts, snackbars, inline messages, and confirmations',
      icon: <Zap className='h-5 w-5' />,
      href: '/docs/ux-guidelines/feedback',
      patterns: ['Toast', 'Snackbar', 'Inline Message', 'Confirmation'],
    },
    {
      title: 'Forms & Validation',
      description: 'Form patterns, validation timing, and error handling',
      icon: <Code className='h-5 w-5' />,
      href: '/docs/ux-guidelines/forms',
      patterns: ['Inline Validation', 'Error Placement', 'Form Layout'],
    },
    {
      title: 'Accessibility',
      description:
        'Keyboard navigation, focus management, and responsive patterns',
      icon: <Users className='h-5 w-5' />,
      href: '/docs/ux-guidelines/accessibility',
      patterns: ['Keyboard Nav', 'Focus Management', 'Mobile Patterns'],
    },
  ]

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-4xl font-bold tracking-tight'>
          UX Interaction Guidelines
        </h1>
        <p className='text-muted-foreground mt-4 text-lg'>
          A comprehensive pattern library for building consistent, accessible,
          and delightful user experiences. These guidelines help you make
          informed decisions about UI patterns, interactions, and component
          usage.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Decision Guide</CardTitle>
          <CardDescription>
            Not sure which pattern to use? These common decisions will help you
            get started.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-2'>
            <h4 className='font-medium'>Navigation Choices</h4>
            <ul className='text-muted-foreground space-y-1 text-sm'>
              <li>• Breadcrumb vs Back Link → See Navigation</li>
              <li>• Tabs vs Side Nav → See Navigation</li>
            </ul>
          </div>
          <div className='space-y-2'>
            <h4 className='font-medium'>Feedback Choices</h4>
            <ul className='text-muted-foreground space-y-1 text-sm'>
              <li>• Toast vs Snackbar → See Feedback</li>
              <li>• Confirmation vs Undo → See Feedback</li>
            </ul>
          </div>
          <div className='space-y-2'>
            <h4 className='font-medium'>Layout Choices</h4>
            <ul className='text-muted-foreground space-y-1 text-sm'>
              <li>• Pagination vs Infinite Scroll → See Layout</li>
              <li>• Card View vs List View → See Layout</li>
            </ul>
          </div>
          <div className='space-y-2'>
            <h4 className='font-medium'>Overlay Choices</h4>
            <ul className='text-muted-foreground space-y-1 text-sm'>
              <li>• Modal vs Drawer → See Overlays</li>
              <li>• Popover vs Tooltip → See Overlays</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {patterns.map((pattern) => (
          <Card
            key={pattern.title}
            className='group transition-shadow hover:shadow-md'
          >
            <CardHeader>
              <div className='flex items-center gap-3'>
                <div className='bg-primary/10 text-primary rounded-lg p-2'>
                  {pattern.icon}
                </div>
                <CardTitle className='text-lg'>{pattern.title}</CardTitle>
              </div>
              <CardDescription>{pattern.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='mb-4 space-y-1'>
                <p className='text-muted-foreground text-sm font-medium'>
                  Includes:
                </p>
                <ul className='grid grid-cols-2 gap-1 text-sm'>
                  {pattern.patterns.map((p) => (
                    <li key={p} className='text-muted-foreground'>
                      • {p}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                asChild
                variant='ghost'
                className='group-hover:bg-accent w-full'
              >
                <Link to={pattern.href}>
                  <span>View Patterns</span>
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className='border-primary/20 bg-primary/5'>
        <CardHeader>
          <CardTitle>About These Guidelines</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <h4 className='font-medium'>Pattern Structure</h4>
            <p className='text-muted-foreground mt-1 text-sm'>
              Each pattern includes: when to use, when NOT to use, best
              practices, code examples, interaction flows, and accessibility
              considerations.
            </p>
          </div>
          <div>
            <h4 className='font-medium'>Decision Support</h4>
            <p className='text-muted-foreground mt-1 text-sm'>
              Interactive decision trees help you choose the right pattern for
              your use case. Look for the decision tree icon on pattern pages.
            </p>
          </div>
          <div>
            <h4 className='font-medium'>Code Examples</h4>
            <p className='text-muted-foreground mt-1 text-sm'>
              All patterns include working React code examples using our Shadcn
              UI components. Examples are interactive and can be copied directly
              into your project.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
