import { createFileRoute } from '@tanstack/react-router'
import {
  AlertCircle,
  Check,
  Keyboard,
  Smartphone,
  Monitor,
  Eye,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DecisionTree } from '@/features/docs/components/DecisionTree'
import { PatternExample } from '@/features/docs/components/PatternExample'

export const Route = createFileRoute('/docs/ux-guidelines/accessibility')({
  component: AccessibilityPatterns,
})

function AccessibilityPatterns() {
  const responsiveDecisionTree = [
    {
      id: 'start',
      question: 'What type of interface element are you designing?',
      options: [
        { label: 'Navigation or menu system', nextId: 'navigation-responsive' },
        {
          label: 'Content layout (text, images)',
          nextId: 'content-responsive',
        },
        {
          label: 'Interactive controls (forms, buttons)',
          nextId: 'controls-responsive',
        },
      ],
    },
    {
      id: 'navigation-responsive',
      question: 'How many navigation items?',
      options: [
        {
          label: '1-5 items',
          result: 'Use horizontal nav on all sizes, consider icons on mobile',
        },
        {
          label: '6-10 items',
          result: 'Use hamburger menu on mobile, horizontal on desktop',
        },
        {
          label: 'More than 10',
          result: 'Use hamburger on mobile/tablet, sidebar on desktop',
        },
      ],
    },
    {
      id: 'content-responsive',
      question: 'What is the primary content type?',
      options: [
        {
          label: 'Text-heavy (articles, docs)',
          result: 'Single column on mobile, max-width container on desktop',
        },
        {
          label: 'Media gallery',
          result: 'Grid that adapts from 1 column (mobile) to 3-4 (desktop)',
        },
        {
          label: 'Data tables',
          result: 'Horizontal scroll on mobile, or convert to card layout',
        },
      ],
    },
    {
      id: 'controls-responsive',
      question: 'What is the interaction method?',
      options: [
        {
          label: 'Touch targets',
          result: 'Minimum 44x44px on mobile, can be smaller on desktop',
        },
        {
          label: 'Text inputs',
          result: 'Full-width on mobile, fixed width on desktop',
        },
        {
          label: 'Button groups',
          result: 'Stack vertically on mobile, horizontal on desktop',
        },
      ],
    },
  ]

  const keyboardNavigationCode = `// Keyboard navigation for custom dropdown
const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const items = ['Profile', 'Settings', 'Logout'];

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          setIsOpen(true);
          setSelectedIndex(0);
        } else {
          selectItem(selectedIndex);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setSelectedIndex(0);
        } else {
          setSelectedIndex((prev) => 
            prev < items.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => prev > 0 ? prev - 1 : prev);
        break;
      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setSelectedIndex(-1);
        }
        break;
    }
  };

  return (
    <div className="relative">
      <button
        aria-haspopup="true"
        aria-expanded={isOpen}
        onKeyDown={handleKeyDown}
        onClick={() => setIsOpen(!isOpen)}
      >
        Menu
      </button>
      {isOpen && (
        <ul role="menu">
          {items.map((item, index) => (
            <li
              key={item}
              role="menuitem"
              tabIndex={-1}
              className={index === selectedIndex ? 'selected' : ''}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};`

  const focusManagementCode = `// Focus trap for modal dialogs
const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocus.current = document.activeElement;
      
      // Focus first focusable element
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.[0]?.focus();
    } else {
      // Restore focus
      previousFocus.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
    
    if (e.key === 'Tab') {
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusable?.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  return isOpen ? (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
      className="modal"
    >
      {children}
    </div>
  ) : null;
};`

  const responsivePatternCode = `// Responsive navigation pattern
const ResponsiveNav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-background border-b">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <a href="/" className="font-bold text-xl">Logo</a>
          <ul className="flex gap-4">
            <li><a href="/about" className="hover:text-primary">About</a></li>
            <li><a href="/products" className="hover:text-primary">Products</a></li>
            <li><a href="/contact" className="hover:text-primary">Contact</a></li>
          </ul>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <a href="/" className="font-bold text-xl">Logo</a>
          <button
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {isMobileMenuOpen && (
          <ul className="px-4 py-2 border-t">
            <li><a href="/about" className="block py-2">About</a></li>
            <li><a href="/products" className="block py-2">Products</a></li>
            <li><a href="/contact" className="block py-2">Contact</a></li>
          </ul>
        )}
      </div>
    </nav>
  );
};`

  const touchTargetCode = `// Touch-friendly button sizes
<div className="space-y-4">
  {/* Mobile-optimized button */}
  <Button className="w-full h-12 text-base md:w-auto md:h-10 md:text-sm">
    Primary Action
  </Button>
  
  {/* Touch-friendly icon button */}
  <Button
    size="icon"
    className="h-11 w-11 md:h-9 md:w-9"
    aria-label="Settings"
  >
    <Settings className="h-5 w-5 md:h-4 md:w-4" />
  </Button>
  
  {/* Properly spaced button group */}
  <div className="flex gap-3 md:gap-2">
    <Button variant="outline" className="min-h-[44px] md:min-h-[36px]">
      Cancel
    </Button>
    <Button className="min-h-[44px] md:min-h-[36px]">
      Confirm
    </Button>
  </div>
</div>`

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-4xl font-bold tracking-tight'>
          Responsive & Accessibility Patterns
        </h1>
        <p className='text-muted-foreground mt-4 text-lg'>
          Build interfaces that work for everyone, regardless of device,
          ability, or context. These patterns ensure your UI is perceivable,
          operable, understandable, and robust.
        </p>
      </div>

      <DecisionTree
        title='Responsive Design Decision'
        nodes={responsiveDecisionTree}
        className='mb-8'
      />

      <div className='space-y-12'>
        {/* Keyboard Navigation Pattern */}
        <section id='keyboard-navigation'>
          <h2 className='mb-6 text-3xl font-semibold'>Keyboard Navigation</h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Keyboard Support Requirements</CardTitle>
              <div className='flex gap-2'>
                <Badge variant='outline'>WCAG 2.1 AA</Badge>
                <Badge variant='outline'>Essential</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                All interactive elements must be keyboard accessible. Users
                should be able to navigate, activate, and interact with every
                feature using only a keyboard.
              </p>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-medium'>Standard Keys</h4>
                  <ul className='space-y-1 text-sm'>
                    <li>
                      <kbd className='bg-muted rounded px-1'>Tab</kbd> -
                      Navigate forward
                    </li>
                    <li>
                      <kbd className='bg-muted rounded px-1'>Shift+Tab</kbd> -
                      Navigate backward
                    </li>
                    <li>
                      <kbd className='bg-muted rounded px-1'>Enter</kbd> -
                      Activate buttons/links
                    </li>
                    <li>
                      <kbd className='bg-muted rounded px-1'>Space</kbd> -
                      Toggle checkboxes, buttons
                    </li>
                    <li>
                      <kbd className='bg-muted rounded px-1'>Escape</kbd> -
                      Close modals/menus
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium'>Arrow Key Navigation</h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Radio groups (up/down)</li>
                    <li>• Menus (up/down)</li>
                    <li>• Tabs (left/right)</li>
                    <li>• Grid/table cells (all directions)</li>
                    <li>• Sliders (left/right or up/down)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Accessible Dropdown Menu'
            description='Full keyboard support with arrow navigation'
            code={keyboardNavigationCode}
          >
            <div className='flex items-center justify-center'>
              <div className='bg-card rounded-lg border p-6 text-center'>
                <Keyboard className='text-muted-foreground mx-auto mb-3 h-8 w-8' />
                <p className='text-muted-foreground text-sm'>
                  Keyboard navigation example - see code for implementation
                </p>
              </div>
            </div>
          </PatternExample>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle className='text-lg'>
                Keyboard Navigation Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Visible Focus Indicators</p>
                  <p className='text-muted-foreground text-sm'>
                    Never remove outline, use :focus-visible for better UX
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Logical Tab Order</p>
                  <p className='text-muted-foreground text-sm'>
                    Follow visual flow, use tabindex sparingly
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Skip Links</p>
                  <p className='text-muted-foreground text-sm'>
                    Provide "Skip to main content" for screen reader users
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Focus Management Pattern */}
        <section id='focus-management'>
          <h2 className='mb-6 text-3xl font-semibold'>Focus Management</h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Focus Principles</CardTitle>
              <div className='flex gap-2'>
                <Badge variant='outline'>User Control</Badge>
                <Badge variant='outline'>Predictable</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Focus management ensures users always know where they are and
                maintains context during dynamic interactions.
              </p>

              <div className='space-y-3'>
                <div className='rounded-lg border p-3'>
                  <h4 className='mb-1 font-medium'>Focus Trapping</h4>
                  <p className='text-muted-foreground text-sm'>
                    Modals and drawers should trap focus within them
                  </p>
                </div>
                <div className='rounded-lg border p-3'>
                  <h4 className='mb-1 font-medium'>Focus Restoration</h4>
                  <p className='text-muted-foreground text-sm'>
                    Return focus to trigger element when closing overlays
                  </p>
                </div>
                <div className='rounded-lg border p-3'>
                  <h4 className='mb-1 font-medium'>Focus on Route Change</h4>
                  <p className='text-muted-foreground text-sm'>
                    Move focus to main content or h1 in SPAs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Modal with Focus Trap'
            description='Focus cycles within modal, restores on close'
            code={focusManagementCode}
          >
            <div className='flex items-center justify-center'>
              <div className='bg-card rounded-lg border p-6 text-center'>
                <Eye className='text-muted-foreground mx-auto mb-3 h-8 w-8' />
                <p className='text-muted-foreground text-sm'>
                  Focus management example - see code for implementation
                </p>
              </div>
            </div>
          </PatternExample>
        </section>

        {/* Responsive Patterns */}
        <section id='responsive-patterns'>
          <h2 className='mb-6 text-3xl font-semibold'>
            Responsive Design Patterns
          </h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Mobile-First Approach</CardTitle>
              <div className='flex gap-2'>
                <Badge variant='outline'>Progressive Enhancement</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Smartphone className='h-5 w-5' />
                    <h4 className='font-medium'>Mobile (&lt; 768px)</h4>
                  </div>
                  <ul className='space-y-1 text-sm'>
                    <li>• Single column layouts</li>
                    <li>• Full-width buttons</li>
                    <li>• Stacked navigation</li>
                    <li>• 44px touch targets</li>
                  </ul>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Monitor className='h-5 w-5' />
                    <h4 className='font-medium'>Tablet (768-1024px)</h4>
                  </div>
                  <ul className='space-y-1 text-sm'>
                    <li>• 2 column layouts</li>
                    <li>• Collapsible sidebars</li>
                    <li>• Mixed navigation</li>
                    <li>• Adaptive spacing</li>
                  </ul>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Monitor className='h-5 w-5' />
                    <h4 className='font-medium'>Desktop (&gt; 1024px)</h4>
                  </div>
                  <ul className='space-y-1 text-sm'>
                    <li>• Multi-column layouts</li>
                    <li>• Persistent sidebars</li>
                    <li>• Hover interactions</li>
                    <li>• Compact controls</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Responsive Navigation'
            description='Adapts from hamburger to horizontal nav'
            code={responsivePatternCode}
          >
            <div className='w-full'>
              <div className='rounded-lg border'>
                <div className='bg-muted/50 flex items-center justify-between p-3'>
                  <span className='font-semibold'>Logo</span>
                  <div className='hidden gap-4 md:flex'>
                    <span className='text-sm'>About</span>
                    <span className='text-sm'>Products</span>
                    <span className='text-sm'>Contact</span>
                  </div>
                  <button className='rounded p-1 md:hidden'>
                    <svg
                      className='h-5 w-5'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 6h16M4 12h16M4 18h16'
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </PatternExample>
        </section>

        {/* Touch Targets */}
        <section id='touch-targets'>
          <h2 className='mb-6 text-3xl font-semibold'>
            Touch Target Guidelines
          </h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Minimum Touch Target Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-3'>
                    <h4 className='font-medium'>Mobile Standards</h4>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-11 w-11 items-center justify-center rounded border-2 border-green-600 bg-green-50 text-xs dark:bg-green-950'>
                          44px
                        </div>
                        <div>
                          <p className='font-medium'>iOS Human Interface</p>
                          <p className='text-muted-foreground text-sm'>
                            44×44 px minimum
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-12 w-12 items-center justify-center rounded border-2 border-blue-600 bg-blue-50 text-xs dark:bg-blue-950'>
                          48px
                        </div>
                        <div>
                          <p className='font-medium'>Material Design</p>
                          <p className='text-muted-foreground text-sm'>
                            48×48 dp minimum
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <h4 className='font-medium'>Spacing Guidelines</h4>
                    <ul className='space-y-2 text-sm'>
                      <li className='flex gap-2'>
                        <Check className='h-4 w-4 text-green-600' />
                        <span>8px minimum between targets</span>
                      </li>
                      <li className='flex gap-2'>
                        <Check className='h-4 w-4 text-green-600' />
                        <span>Larger targets for primary actions</span>
                      </li>
                      <li className='flex gap-2'>
                        <Check className='h-4 w-4 text-green-600' />
                        <span>Consider thumb reach zones</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Touch-Friendly Buttons'
            description='Proper sizing and spacing for touch'
            code={touchTargetCode}
          >
            <div className='space-y-4'>
              <Button className='h-12 px-6 text-base'>
                Large Touch Target
              </Button>
              <div className='flex gap-3'>
                <Button variant='outline' className='min-h-[44px]'>
                  Cancel
                </Button>
                <Button className='min-h-[44px]'>Confirm</Button>
              </div>
            </div>
          </PatternExample>

          <Alert className='mt-6'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              <strong>Testing Tip:</strong> Test your interface with keyboard
              only, screen readers (NVDA/JAWS on Windows, VoiceOver on Mac/iOS),
              and on actual mobile devices. Automated testing can catch some
              issues but manual testing is essential.
            </AlertDescription>
          </Alert>
        </section>

        {/* ARIA Guidelines */}
        <section id='aria-guidelines'>
          <h2 className='mb-6 text-3xl font-semibold'>ARIA Best Practices</h2>

          <Card>
            <CardHeader>
              <CardTitle>ARIA Rules of Thumb</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950'>
                  <p className='font-medium'>Rule 1: Don't use ARIA</p>
                  <p className='text-muted-foreground text-sm'>
                    If you can use native HTML elements or attributes, do so
                  </p>
                </div>
                <div className='rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950'>
                  <p className='font-medium'>
                    Rule 2: Don't change native semantics
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    Unless you really have to (e.g., don't use role="button" on
                    a heading)
                  </p>
                </div>
                <div className='rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950'>
                  <p className='font-medium'>
                    Rule 3: Make it keyboard accessible
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    All interactive ARIA controls must be keyboard operable
                  </p>
                </div>
                <div className='rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950'>
                  <p className='font-medium'>
                    Rule 4: Don't hide focusable elements
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    Don't use role="presentation" or aria-hidden="true" on
                    focusable elements
                  </p>
                </div>
                <div className='rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950'>
                  <p className='font-medium'>
                    Rule 5: Use label for interactive elements
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    All interactive elements must have an accessible name
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
