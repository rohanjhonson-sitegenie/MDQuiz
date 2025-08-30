import { useState } from 'react'
import { Mail, Sparkles, Send } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NewsletterProps {
  title?: string
  description?: string
  badge?: string
  subscriberCount?: string
  developersText?: string
  placeholder?: string
  subscribing?: string
  subscribe?: string
  disclaimer?: string
  privacyPolicy?: string
  benefit1?: string
  benefit2?: string
  benefit3?: string
}

export function Newsletter({
  title,
  description,
  badge,
  subscriberCount,
  developersText,
  placeholder,
  subscribing,
  subscribe,
  disclaimer,
  privacyPolicy,
  benefit1,
  benefit2,
  benefit3,
}: NewsletterProps = {}) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false)
      setEmail('')
    }, 1000)
  }

  return (
    <section className='container py-12 sm:py-16'>
      <div className='mx-auto max-w-7xl'>
        <div className='from-muted/50 to-muted relative overflow-hidden rounded-3xl bg-gradient-to-b p-8 md:p-16 lg:p-20'>
          {/* Background decoration */}
          <div className='absolute inset-0 -z-10'>
            <div className='bg-primary/10 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-[128px]' />
            <div className='bg-primary/10 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-[128px]' />
          </div>

          <div className='relative mx-auto max-w-2xl space-y-8 text-center'>
            <div>
              <Badge variant='outline' className='mb-4'>
                <Mail className='mr-2 h-3.5 w-3.5' />
                {badge}
              </Badge>
              <h2 className='font-heading text-3xl font-bold sm:text-4xl md:text-5xl'>
                {title}
              </h2>
              <p className='text-muted-foreground mt-4 text-lg sm:text-xl'>
                {description}{' '}
                <span className='text-foreground font-semibold'>
                  {subscriberCount}
                </span>{' '}
                {developersText}.
              </p>
            </div>

            <form onSubmit={handleSubmit} className='mx-auto max-w-md'>
              <div className='flex flex-col gap-4 sm:flex-row sm:gap-2'>
                <div className='relative flex-1'>
                  <Mail className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                  <Input
                    type='email'
                    placeholder={placeholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='h-12 pl-10'
                    required
                  />
                </div>
                <Button
                  type='submit'
                  size='lg'
                  disabled={isSubmitting}
                  className='bg-primary hover:bg-primary/90 gap-2'
                >
                  {isSubmitting ? (
                    <>
                      <div className='border-primary-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent' />
                      {subscribing}
                    </>
                  ) : (
                    <>
                      {subscribe}
                      <Send className='h-4 w-4' />
                    </>
                  )}
                </Button>
              </div>
              <p className='text-muted-foreground mt-4 text-xs'>
                {disclaimer}{' '}
                <a
                  href='#'
                  className='hover:text-primary underline underline-offset-2'
                >
                  {privacyPolicy}
                </a>
                .
              </p>
            </form>

            {/* Benefits */}
            <div className='flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-4'>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <Sparkles className='text-primary h-4 w-4' />
                {benefit1}
              </div>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <Sparkles className='text-primary h-4 w-4' />
                {benefit2}
              </div>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <Sparkles className='text-primary h-4 w-4' />
                {benefit3}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
