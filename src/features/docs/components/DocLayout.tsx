import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DocLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    title: 'Getting Started',
    items: [{ title: 'UX Guidelines Overview', href: '/docs/ux-guidelines' }],
  },
  {
    title: 'Patterns',
    items: [
      { title: 'Navigation', href: '/docs/ux-guidelines/navigation' },
      { title: 'Layout & Flows', href: '/docs/ux-guidelines/layout-flows' },
      { title: 'Overlays', href: '/docs/ux-guidelines/overlays' },
      { title: 'Feedback', href: '/docs/ux-guidelines/feedback' },
      { title: 'Forms & Validation', href: '/docs/ux-guidelines/forms' },
      { title: 'Accessibility', href: '/docs/ux-guidelines/accessibility' },
    ],
  },
]

export function DocLayout({ children }: DocLayoutProps) {
  const location = useLocation()

  return (
    <div className='flex min-h-screen'>
      <aside className='hidden w-64 shrink-0 border-r md:block'>
        <ScrollArea className='h-full py-6'>
          <div className='px-4'>
            <h2 className='mb-4 text-lg font-semibold'>Documentation</h2>
            <nav className='space-y-6'>
              {navigation.map((section) => (
                <div key={section.title}>
                  <h3 className='text-muted-foreground mb-2 text-sm font-medium'>
                    {section.title}
                  </h3>
                  <ul className='space-y-1'>
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          className={cn(
                            'hover:bg-accent hover:text-accent-foreground block rounded-md px-3 py-2 text-sm transition-colors',
                            location.pathname === item.href &&
                              'bg-accent text-accent-foreground'
                          )}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </aside>
      <main className='flex-1'>
        <ScrollArea className='h-screen'>
          <div className='container mx-auto px-4 py-8 md:px-8'>{children}</div>
        </ScrollArea>
      </main>
    </div>
  )
}
