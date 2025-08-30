import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UserAuthForm } from './user-auth-form'
import { useEffect } from 'react'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Add blur class to overlay when modal opens
      const style = document.createElement('style')
      style.textContent = '[data-slot="dialog-overlay"] { backdrop-filter: blur(8px); }'
      style.id = 'sign-in-modal-blur'
      document.head.appendChild(style)

      return () => {
        // Remove blur style when modal closes
        const existingStyle = document.getElementById('sign-in-modal-blur')
        if (existingStyle) {
          existingStyle.remove()
        }
      }
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle className='text-lg tracking-tight'>Login</DialogTitle>
          <DialogDescription>
            Enter your email and password below to log into your account
          </DialogDescription>
        </DialogHeader>
        <UserAuthForm />
        <div className='px-8 text-center text-sm text-muted-foreground'>
          By clicking login, you agree to our{' '}
          <a
            href='/terms'
            className='hover:text-primary underline underline-offset-4'
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href='/privacy'
            className='hover:text-primary underline underline-offset-4'
          >
            Privacy Policy
          </a>
          .
        </div>
      </DialogContent>
    </Dialog>
  )
}