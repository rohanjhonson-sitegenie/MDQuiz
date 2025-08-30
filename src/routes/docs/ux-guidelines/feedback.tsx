import { createFileRoute } from '@tanstack/react-router'
import {
  AlertCircle,
  Check,
  X,
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DecisionTree } from '@/features/docs/components/DecisionTree'
import { PatternExample } from '@/features/docs/components/PatternExample'

export const Route = createFileRoute('/docs/ux-guidelines/feedback')({
  component: FeedbackPatterns,
})

function FeedbackPatterns() {
  const feedbackDecisionTree = [
    {
      id: 'start',
      question: 'What type of feedback are you providing?',
      options: [
        {
          label: 'Action confirmation or status update',
          nextId: 'action-feedback',
        },
        { label: 'Error or warning message', nextId: 'error-handling' },
        {
          label: 'System or background process update',
          nextId: 'system-feedback',
        },
      ],
    },
    {
      id: 'action-feedback',
      question: 'How important is this feedback?',
      options: [
        {
          label: 'Critical - User must acknowledge',
          nextId: 'critical-action',
        },
        {
          label: 'Important - Should be noticed',
          result: 'Use Toast notification in top-right corner',
        },
        {
          label: 'Minor - Nice to know',
          result: 'Use subtle inline feedback or status change',
        },
      ],
    },
    {
      id: 'critical-action',
      question: 'Can the action be undone?',
      options: [
        {
          label: 'Yes, reversible action',
          result: 'Use Toast with Undo button for quick reversal',
        },
        {
          label: 'No, permanent action',
          result:
            'Use Modal confirmation BEFORE action, then Toast for completion',
        },
      ],
    },
    {
      id: 'error-handling',
      question: 'Where did the error occur?',
      options: [
        {
          label: 'Form field or specific input',
          result: 'Use Inline validation message below the field',
        },
        {
          label: 'Page or section level',
          result: 'Use Alert banner at top of affected area',
        },
        {
          label: 'System-wide or critical',
          result: 'Use Modal dialog to ensure user sees error',
        },
      ],
    },
    {
      id: 'system-feedback',
      question: 'Does it require user action?',
      options: [
        {
          label: 'Yes, user must do something',
          result: 'Use persistent Alert or Snackbar with action button',
        },
        {
          label: 'No, just informational',
          result: 'Use auto-dismissing Toast (3-5 seconds)',
        },
      ],
    },
  ]

  const toastCode = `// Success Toast
toast.success('Changes saved successfully');

// Error Toast
toast.error('Failed to save changes');

// Toast with Action
toast('Message sent', {
  action: {
    label: 'Undo',
    onClick: () => handleUndo(),
  },
});

// Custom Toast
toast.custom((t) => (
  <div className="flex items-center gap-2">
    <CheckCircle2 className="h-4 w-4 text-green-600" />
    <span>Upload complete!</span>
  </div>
));`

  const inlineAlertCode = `// Inline Alert Component
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>

// Inline Success Message
<div className="flex items-center gap-2 text-sm text-green-600">
  <CheckCircle2 className="h-4 w-4" />
  <span>Email verified successfully</span>
</div>`

  const snackbarCode = `// Snackbar with Action (Material Design pattern)
<div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto">
  <div className="flex items-center justify-between gap-4 rounded-md bg-gray-900 px-4 py-3 text-white shadow-lg">
    <span>Item moved to trash</span>
    <Button 
      variant="ghost" 
      size="sm"
      className="text-white hover:text-gray-200"
    >
      Undo
    </Button>
  </div>
</div>`

  const confirmationPatternCode = `// Optimistic Update with Undo
const handleDelete = async (itemId) => {
  // Immediately update UI
  removeItemFromUI(itemId);
  
  // Show toast with undo
  toast('Item deleted', {
    action: {
      label: 'Undo',
      onClick: () => {
        restoreItemInUI(itemId);
        cancelDelete(itemId);
      },
    },
  });
  
  // Perform actual deletion after delay
  setTimeout(() => {
    performActualDelete(itemId);
  }, 5000);
};`

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-4xl font-bold tracking-tight'>Feedback Patterns</h1>
        <p className='text-muted-foreground mt-4 text-lg'>
          Feedback patterns communicate system status, confirm user actions, and
          guide error recovery. Choose patterns that match the urgency and
          context of the message.
        </p>
      </div>

      <DecisionTree
        title='Feedback Pattern Selection'
        nodes={feedbackDecisionTree}
        className='mb-8'
      />

      <div className='space-y-12'>
        {/* Toast Pattern */}
        <section id='toast'>
          <h2 className='mb-6 text-3xl font-semibold'>Toast Notifications</h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <div className='flex gap-2'>
                <Badge variant='outline'>Non-Blocking</Badge>
                <Badge variant='outline'>Temporary</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Toasts provide brief, non-intrusive feedback about an action or
                system event. They appear temporarily and don't require user
                interaction.
              </p>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-medium text-green-600 dark:text-green-400'>
                    ✓ When to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Action confirmations (saved, sent, deleted)</li>
                    <li>• Background process updates</li>
                    <li>• Non-critical errors</li>
                    <li>• Quick status updates</li>
                    <li>• Actions with undo option</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-red-600 dark:text-red-400'>
                    ✗ When NOT to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Critical errors requiring action</li>
                    <li>• Complex information</li>
                    <li>• Form validation errors</li>
                    <li>• First-time tutorials</li>
                    <li>• Legal/compliance messages</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Toast Variations'
            description='Different toast types for various feedback'
            code={toastCode}
          >
            <div className='flex flex-wrap gap-2'>
              <Button
                variant='outline'
                onClick={() => toast.success('Changes saved successfully')}
              >
                Success Toast
              </Button>
              <Button
                variant='outline'
                onClick={() => toast.error('Failed to save changes')}
              >
                Error Toast
              </Button>
              <Button
                variant='outline'
                onClick={() =>
                  toast('File deleted', {
                    action: {
                      label: 'Undo',
                      onClick: () => toast.success('Action undone'),
                    },
                  })
                }
              >
                With Undo
              </Button>
            </div>
          </PatternExample>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle className='text-lg'>Toast Best Practices</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Position Consistently</p>
                  <p className='text-muted-foreground text-sm'>
                    Top-right for desktop, bottom for mobile
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Auto-Dismiss Timing</p>
                  <p className='text-muted-foreground text-sm'>
                    3-5 seconds for simple messages, longer for actions
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Stack Multiple Toasts</p>
                  <p className='text-muted-foreground text-sm'>
                    Show max 3-5 at once, queue others
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Snackbar Pattern */}
        <section id='snackbar'>
          <h2 className='mb-6 text-3xl font-semibold'>Snackbar</h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <div className='flex gap-2'>
                <Badge variant='outline'>Material Design</Badge>
                <Badge variant='outline'>Action-Oriented</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Snackbars are similar to toasts but follow Material Design
                guidelines, appearing at the bottom of the screen with optional
                actions.
              </p>

              <div className='space-y-3'>
                <h4 className='font-medium'>Snackbar vs Toast</h4>
                <div className='grid gap-2 text-sm'>
                  <div className='flex gap-2'>
                    <span className='font-medium'>Position:</span>
                    <span>Snackbar (bottom), Toast (top-right)</span>
                  </div>
                  <div className='flex gap-2'>
                    <span className='font-medium'>Actions:</span>
                    <span>Snackbar (1 action max), Toast (flexible)</span>
                  </div>
                  <div className='flex gap-2'>
                    <span className='font-medium'>Mobile:</span>
                    <span>Snackbar (full-width), Toast (centered)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Snackbar with Action'
            description='Bottom-positioned feedback with undo action'
            code={snackbarCode}
          >
            <div className='bg-muted/20 relative h-32 w-full rounded-lg border'>
              <div className='absolute right-4 bottom-4 left-4'>
                <div className='flex items-center justify-between gap-4 rounded-md bg-gray-900 px-4 py-3 text-white shadow-lg dark:bg-gray-100 dark:text-gray-900'>
                  <span className='text-sm'>Item moved to trash</span>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-auto px-2 py-1 text-white hover:bg-white/20 dark:text-gray-900 dark:hover:bg-gray-900/20'
                  >
                    Undo
                  </Button>
                </div>
              </div>
            </div>
          </PatternExample>
        </section>

        {/* Inline Messages Pattern */}
        <section id='inline-messages'>
          <h2 className='mb-6 text-3xl font-semibold'>Inline Messages</h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <div className='flex gap-2'>
                <Badge variant='outline'>Contextual</Badge>
                <Badge variant='outline'>Persistent</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                Inline messages appear within the content flow, providing
                feedback exactly where it's relevant. They remain visible until
                the condition changes.
              </p>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-medium text-green-600 dark:text-green-400'>
                    ✓ When to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Form validation errors</li>
                    <li>• Section-specific warnings</li>
                    <li>• Empty states</li>
                    <li>• Feature announcements</li>
                    <li>• Contextual help</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-red-600 dark:text-red-400'>
                    ✗ When NOT to Use
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Temporary confirmations</li>
                    <li>• System-wide messages</li>
                    <li>• Actions requiring response</li>
                    <li>• Progress indicators</li>
                    <li>• Mobile (space constraints)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Alert Variations'
            description='Different alert styles for various message types'
            code={inlineAlertCode}
          >
            <div className='space-y-3'>
              <Alert>
                <Info className='h-4 w-4' />
                <AlertDescription>
                  This is an informational message with default styling.
                </AlertDescription>
              </Alert>

              <Alert className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'>
                <CheckCircle2 className='h-4 w-4 text-green-600' />
                <AlertDescription className='text-green-800 dark:text-green-200'>
                  Success! Your changes have been saved.
                </AlertDescription>
              </Alert>

              <Alert className='border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'>
                <AlertTriangle className='h-4 w-4 text-yellow-600' />
                <AlertDescription className='text-yellow-800 dark:text-yellow-200'>
                  Warning: This action may affect other users.
                </AlertDescription>
              </Alert>

              <Alert variant='destructive'>
                <XCircle className='h-4 w-4' />
                <AlertDescription>
                  Error: Unable to process your request.
                </AlertDescription>
              </Alert>
            </div>
          </PatternExample>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle className='text-lg'>
                Inline Message Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Place Near Related Content</p>
                  <p className='text-muted-foreground text-sm'>
                    Position messages close to what they reference
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Use Appropriate Severity</p>
                  <p className='text-muted-foreground text-sm'>
                    Match visual weight to message importance
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <X className='mt-0.5 h-4 w-4 text-red-600' />
                <div>
                  <p className='font-medium'>Don't Overuse</p>
                  <p className='text-muted-foreground text-sm'>
                    Too many alerts cause banner blindness
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Confirmation vs Undo Pattern */}
        <section id='confirmation-undo'>
          <h2 className='mb-6 text-3xl font-semibold'>Confirmation vs Undo</h2>

          <div className='grid gap-6 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Confirmation Pattern</CardTitle>
                <Badge variant='outline'>Preventive</Badge>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-sm'>
                  Ask for confirmation before performing the action.
                </p>
                <div>
                  <h4 className='mb-2 font-medium text-green-600 dark:text-green-400'>
                    ✓ Best For
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Destructive actions (delete, remove)</li>
                    <li>• High-cost operations</li>
                    <li>• Irreversible changes</li>
                    <li>• Actions affecting others</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-orange-600 dark:text-orange-400'>
                    ⚠ Drawbacks
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Interrupts workflow</li>
                    <li>• Can become habit (blindly confirm)</li>
                    <li>• Adds friction</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Undo Pattern</CardTitle>
                <Badge variant='outline'>Optimistic</Badge>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-sm'>
                  Perform action immediately, offer reversal option.
                </p>
                <div>
                  <h4 className='mb-2 font-medium text-green-600 dark:text-green-400'>
                    ✓ Best For
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Reversible actions</li>
                    <li>• Frequent operations</li>
                    <li>• Power user workflows</li>
                    <li>• Batch operations</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-orange-600 dark:text-orange-400'>
                    ⚠ Drawbacks
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Requires undo infrastructure</li>
                    <li>• Time limit for undo</li>
                    <li>• Not suitable for all actions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <PatternExample
            title='Optimistic Update with Undo'
            description='Immediate action with reversal option'
            code={confirmationPatternCode}
            className='mt-6'
          >
            <Button
              onClick={() => {
                toast('Email moved to trash', {
                  action: {
                    label: 'Undo',
                    onClick: () => toast.success('Email restored'),
                  },
                  duration: 5000,
                })
              }}
            >
              Delete Email (with Undo)
            </Button>
          </PatternExample>

          <Alert className='mt-6'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              <strong>Accessibility:</strong> Ensure all feedback is announced
              to screen readers using ARIA live regions. Critical messages
              should use role="alert". Provide sufficient time for users to read
              and act on temporary messages.
            </AlertDescription>
          </Alert>
        </section>
      </div>
    </div>
  )
}
