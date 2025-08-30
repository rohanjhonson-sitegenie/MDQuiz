import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, Check, Eye } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DecisionTree } from '@/features/docs/components/DecisionTree'
import { PatternExample } from '@/features/docs/components/PatternExample'

export const Route = createFileRoute('/docs/ux-guidelines/forms')({
  component: FormsValidationPatterns,
})

function FormsValidationPatterns() {
  const validationDecisionTree = [
    {
      id: 'start',
      question: 'When should validation occur?',
      options: [
        { label: 'As user types (real-time)', nextId: 'realtime-validation' },
        {
          label: 'When user leaves field (on blur)',
          nextId: 'blur-validation',
        },
        { label: 'When form is submitted', nextId: 'submit-validation' },
      ],
    },
    {
      id: 'realtime-validation',
      question: 'What type of validation?',
      options: [
        {
          label: 'Format validation (email, phone)',
          result: 'Use debounced real-time validation after 500ms pause',
        },
        {
          label: 'Availability check (username)',
          result: 'Use debounced async validation with loading state',
        },
        {
          label: 'Password strength',
          result: 'Use immediate feedback with visual strength indicator',
        },
      ],
    },
    {
      id: 'blur-validation',
      question: 'Is the field required?',
      options: [
        {
          label: 'Yes, required field',
          result: 'Validate on blur, show error if empty or invalid',
        },
        {
          label: 'Optional but has format rules',
          result: 'Only validate on blur if user entered something',
        },
      ],
    },
    {
      id: 'submit-validation',
      question: 'How complex is the form?',
      options: [
        {
          label: 'Simple (< 5 fields)',
          result: 'Validate all on submit, scroll to first error',
        },
        {
          label: 'Complex or multi-step',
          result:
            'Validate each section before proceeding, summary on final submit',
        },
      ],
    },
  ]

  const inlineValidationCode = `// Inline validation with React Hook Form
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    {...register('email', {
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+[.][A-Z]{2,}$/i,
        message: 'Invalid email address'
      }
    })}
    aria-invalid={errors.email ? 'true' : 'false'}
    aria-describedby={errors.email ? 'email-error' : undefined}
  />
  {errors.email && (
    <p id="email-error" className="text-sm text-destructive">
      {errors.email.message}
    </p>
  )}
</div>`

  const passwordStrengthCode = `// Password with strength indicator
const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);

const getStrength = (pass) => {
  let strength = 0;
  if (pass.length > 7) strength++;
  if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
  if (pass.match(/[0-9]/)) strength++;
  if (pass.match(/[^a-zA-Z0-9]/)) strength++;
  return strength;
};

<div className="space-y-2">
  <Label htmlFor="password">Password</Label>
  <div className="relative">
    <Input
      id="password"
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute right-0 top-0"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <EyeOff /> : <Eye />}
    </Button>
  </div>
  <div className="h-2 w-full bg-muted rounded">
    <div 
      className={\`h-full rounded transition-all \${
        getStrength(password) === 0 ? 'w-0' :
        getStrength(password) === 1 ? 'w-1/4 bg-red-500' :
        getStrength(password) === 2 ? 'w-2/4 bg-yellow-500' :
        getStrength(password) === 3 ? 'w-3/4 bg-blue-500' :
        'w-full bg-green-500'
      }\`}
    />
  </div>
</div>`

  const formLayoutCode = `// Accessible form layout
<form onSubmit={handleSubmit} noValidate>
  <fieldset>
    <legend className="text-lg font-medium mb-4">Account Information</legend>
    
    <div className="grid gap-4">
      {/* Group related fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" required />
        </div>
      </div>
      
      {/* Single field with help text */}
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" required />
        <p className="text-sm text-muted-foreground">
          We'll never share your email
        </p>
      </div>
    </div>
  </fieldset>
  
  <div className="mt-6 flex gap-4">
    <Button type="submit">Submit</Button>
    <Button type="button" variant="outline">Cancel</Button>
  </div>
</form>`

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-4xl font-bold tracking-tight'>
          Forms & Validation Patterns
        </h1>
        <p className='text-muted-foreground mt-4 text-lg'>
          Form patterns guide users through data entry with clear validation,
          helpful error messages, and accessible design. The goal is to prevent
          errors and make correction easy.
        </p>
      </div>

      <DecisionTree
        title='Validation Timing Decision'
        nodes={validationDecisionTree}
        className='mb-8'
      />

      <div className='space-y-12'>
        {/* Form Layout Pattern */}
        <section id='form-layout'>
          <h2 className='mb-6 text-3xl font-semibold'>
            Form Layout & Structure
          </h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Layout Principles</CardTitle>
              <div className='flex gap-2'>
                <Badge variant='outline'>Accessibility First</Badge>
                <Badge variant='outline'>Mobile Responsive</Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-medium'>Single Column</h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Best for mobile and simple forms</li>
                    <li>• Easier to scan and complete</li>
                    <li>• Natural reading flow</li>
                    <li>• Lower error rates</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium'>Multi-Column</h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Only for related fields (first/last name)</li>
                    <li>• Desktop only, stack on mobile</li>
                    <li>• Maintain logical grouping</li>
                    <li>• Consider tab order</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Accessible Form Structure'
            description='Proper labeling, grouping, and help text'
            code={formLayoutCode}
          >
            <form
              className='w-full max-w-md space-y-4'
              onSubmit={(e) => e.preventDefault()}
            >
              <fieldset className='space-y-4 rounded-lg border p-4'>
                <legend className='px-2 text-sm font-medium'>
                  Account Information
                </legend>

                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='demo-first'>First Name *</Label>
                    <Input id='demo-first' placeholder='John' />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='demo-last'>Last Name *</Label>
                    <Input id='demo-last' placeholder='Doe' />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='demo-email'>Email *</Label>
                  <Input
                    id='demo-email'
                    type='email'
                    placeholder='john@example.com'
                  />
                  <p className='text-muted-foreground text-sm'>
                    We'll never share your email
                  </p>
                </div>
              </fieldset>

              <div className='flex gap-4'>
                <Button type='submit'>Submit</Button>
                <Button type='button' variant='outline'>
                  Cancel
                </Button>
              </div>
            </form>
          </PatternExample>

          <Card className='mt-6'>
            <CardHeader>
              <CardTitle className='text-lg'>
                Form Design Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Mark Required Fields</p>
                  <p className='text-muted-foreground text-sm'>
                    Use asterisk (*) or "required" text, explain at form start
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Group Related Fields</p>
                  <p className='text-muted-foreground text-sm'>
                    Use fieldset/legend for logical sections
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Check className='mt-0.5 h-4 w-4 text-green-600' />
                <div>
                  <p className='font-medium'>Provide Help Text</p>
                  <p className='text-muted-foreground text-sm'>
                    Clarify format requirements before user enters data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Inline Validation Pattern */}
        <section id='inline-validation'>
          <h2 className='mb-6 text-3xl font-semibold'>Inline Validation</h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Validation Timing</CardTitle>
              <CardDescription>
                When and how to show validation feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-3'>
                  <div className='space-y-2'>
                    <h4 className='font-medium text-green-600'>Real-time</h4>
                    <ul className='space-y-1 text-sm'>
                      <li>• Password strength</li>
                      <li>• Character counters</li>
                      <li>• Format preview</li>
                    </ul>
                  </div>
                  <div className='space-y-2'>
                    <h4 className='font-medium text-blue-600'>On Blur</h4>
                    <ul className='space-y-1 text-sm'>
                      <li>• Email validation</li>
                      <li>• Required fields</li>
                      <li>• Most text inputs</li>
                    </ul>
                  </div>
                  <div className='space-y-2'>
                    <h4 className='font-medium text-orange-600'>On Submit</h4>
                    <ul className='space-y-1 text-sm'>
                      <li>• Final validation</li>
                      <li>• Server-side checks</li>
                      <li>• Complex rules</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Email Field with Validation'
            description='Shows error on blur if invalid format'
            code={inlineValidationCode}
          >
            <div className='w-full max-w-sm space-y-2'>
              <Label htmlFor='email-demo'>Email</Label>
              <Input
                id='email-demo'
                type='email'
                placeholder='user@example.com'
                className='border-destructive'
                aria-invalid='true'
                aria-describedby='email-error-demo'
              />
              <p
                id='email-error-demo'
                className='text-destructive flex items-center gap-1 text-sm'
              >
                <AlertCircle className='h-3 w-3' />
                Please enter a valid email address
              </p>
            </div>
          </PatternExample>
        </section>

        {/* Password Field Pattern */}
        <section id='password-validation'>
          <h2 className='mb-6 text-3xl font-semibold'>
            Password Field Patterns
          </h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Password Best Practices</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <h4 className='mb-2 font-medium text-green-600 dark:text-green-400'>
                    ✓ Do
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Show/hide password toggle</li>
                    <li>• Real-time strength indicator</li>
                    <li>• Clear requirements upfront</li>
                    <li>• Allow paste functionality</li>
                    <li>• Support password managers</li>
                  </ul>
                </div>
                <div>
                  <h4 className='mb-2 font-medium text-red-600 dark:text-red-400'>
                    ✗ Don't
                  </h4>
                  <ul className='space-y-1 text-sm'>
                    <li>• Disable paste</li>
                    <li>• Hide requirements until error</li>
                    <li>• Use confusing rules</li>
                    <li>• Require confirmation for new passwords</li>
                    <li>• Show password by default</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <PatternExample
            title='Password with Strength Indicator'
            description='Real-time feedback on password strength'
            code={passwordStrengthCode}
          >
            <div className='w-full max-w-sm space-y-2'>
              <Label htmlFor='password-demo'>Password</Label>
              <div className='relative'>
                <Input
                  id='password-demo'
                  type='password'
                  placeholder='Enter password'
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='absolute top-0 right-0 h-full px-3'
                >
                  <Eye className='h-4 w-4' />
                </Button>
              </div>
              <div className='bg-muted h-2 w-full rounded'>
                <div className='h-full w-3/4 rounded bg-blue-500 transition-all' />
              </div>
              <p className='text-muted-foreground text-sm'>Strong password</p>
            </div>
          </PatternExample>
        </section>

        {/* Error Message Patterns */}
        <section id='error-messages'>
          <h2 className='mb-6 text-3xl font-semibold'>
            Error Message Guidelines
          </h2>

          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Writing Effective Error Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-3'>
                    <h4 className='font-medium'>Good Error Messages</h4>
                    <div className='space-y-2 text-sm'>
                      <div className='rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950'>
                        <p className='font-medium'>
                          ✓ "Please enter a valid email address"
                        </p>
                        <p className='text-muted-foreground'>
                          Clear and actionable
                        </p>
                      </div>
                      <div className='rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950'>
                        <p className='font-medium'>
                          ✓ "Password must be at least 8 characters"
                        </p>
                        <p className='text-muted-foreground'>
                          Specific requirement
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <h4 className='font-medium'>Poor Error Messages</h4>
                    <div className='space-y-2 text-sm'>
                      <div className='rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950'>
                        <p className='font-medium'>✗ "Invalid input"</p>
                        <p className='text-muted-foreground'>Too vague</p>
                      </div>
                      <div className='rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950'>
                        <p className='font-medium'>✗ "Error: 422"</p>
                        <p className='text-muted-foreground'>
                          Technical jargon
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Error Placement</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex gap-2'>
                <Badge className='mt-0.5'>1</Badge>
                <div>
                  <p className='font-medium'>Inline with field</p>
                  <p className='text-muted-foreground text-sm'>
                    Place error message directly below the field
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Badge className='mt-0.5'>2</Badge>
                <div>
                  <p className='font-medium'>Summary at top</p>
                  <p className='text-muted-foreground text-sm'>
                    List all errors at form top with links to fields
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Badge className='mt-0.5'>3</Badge>
                <div>
                  <p className='font-medium'>Visual indicators</p>
                  <p className='text-muted-foreground text-sm'>
                    Red border, error icon, proper ARIA attributes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className='mt-6'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              <strong>Accessibility:</strong> Use aria-invalid="true" for
              invalid fields, aria-describedby to link errors, and ensure error
              messages are announced by screen readers. Never rely on color
              alone to indicate errors.
            </AlertDescription>
          </Alert>
        </section>
      </div>
    </div>
  )
}
