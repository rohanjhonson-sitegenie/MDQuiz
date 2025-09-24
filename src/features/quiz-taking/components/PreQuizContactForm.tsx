import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, User, ArrowRight, Info } from 'lucide-react'

const contactFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactFormSchema>

interface PreQuizContactFormProps {
  isOpen: boolean
  isRequired: boolean
  quizTitle: string
  onSubmit: (data: { email: string; name?: string }) => void
  onSkip?: () => void
}

export function PreQuizContactForm({
  isOpen,
  isRequired,
  quizTitle,
  onSubmit,
  onSkip,
}: PreQuizContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  })

  const handleFormSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        email: data.email,
        name: data.name || undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkipClick = () => {
    if (!isRequired && onSkip) {
      onSkip()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={isRequired ? () => {} : undefined}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-xl'>Welcome to {quizTitle}</DialogTitle>
          <DialogDescription>
            {isRequired
              ? 'Please provide your contact information to start the quiz.'
              : 'Optionally provide your contact information, or skip to remain anonymous.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4 mt-4'>
          <div className='space-y-2'>
            <Label htmlFor='email' className='flex items-center gap-2'>
              <Mail className='w-4 h-4' />
              Email Address {isRequired && <span className='text-destructive'>*</span>}
            </Label>
            <Input
              id='email'
              type='email'
              placeholder='your.email@example.com'
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className='text-xs text-destructive'>{errors.email.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='name' className='flex items-center gap-2'>
              <User className='w-4 h-4' />
              Name <span className='text-muted-foreground text-xs'>(Optional)</span>
            </Label>
            <Input
              id='name'
              type='text'
              placeholder='Your name'
              {...register('name')}
            />
          </div>

          <Alert className='bg-muted/50 border-muted'>
            <Info className='h-4 w-4' />
            <AlertDescription className='text-xs'>
              Your contact information will be stored securely and used only for quiz response tracking.
            </AlertDescription>
          </Alert>

          <div className='flex gap-3 pt-2'>
            {!isRequired && (
              <Button
                type='button'
                variant='outline'
                onClick={handleSkipClick}
                className='flex-1'
                disabled={isSubmitting}
              >
                Skip & Stay Anonymous
              </Button>
            )}
            <Button
              type='submit'
              className={`${isRequired ? 'w-full' : 'flex-1'} gap-2`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Starting...' : 'Start Quiz'}
              <ArrowRight className='w-4 h-4' />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}