import { useState } from 'react'
import { Check, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface PricingPlan {
  name: string
  price: string
  originalPrice: string | null
  description: string
  features: { text: string; included: boolean }[]
  cta: string
  variant: 'outline' | 'default'
  highlighted: boolean
}

interface PricingProps {
  badge?: string
  heading?: string
  description?: string
  plans?: PricingPlan[]
  monthText?: string
  yearText?: string
}

export function Pricing({
  badge,
  heading,
  description,
  plans,
  monthText,
  yearText,
}: PricingProps = {}) {
  const [billing, _setBilling] = useState<'monthly' | 'yearly'>('monthly')

  const plansData = plans || []

  return (
    <section id='pricing' className='container py-12 sm:py-16'>
      <div className='mx-auto max-w-[58rem] text-center'>
        <Badge variant='outline' className='mb-4'>
          <Sparkles className='mr-2 h-3.5 w-3.5' />
          {badge}
        </Badge>
        <h2 className='font-heading text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl'>
          {heading}
        </h2>
        <p className='text-muted-foreground mt-6 text-lg sm:text-xl'>
          {description}
        </p>
      </div>

      <div className='mx-auto mt-16 max-w-7xl'>
        <div className='grid gap-8 lg:grid-cols-3'>
          {plansData.map((plan, index) => (
            <Card
              key={plan.name}
              className={cn(
                'relative flex flex-col overflow-hidden transition-all hover:shadow-lg',
                plan.highlighted &&
                  'border-primary scale-105 shadow-xl lg:scale-110',
                'animate-in fade-in-50 slide-in-from-bottom-5'
              )}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both',
              }}
            >
              {plan.highlighted && (
                <div className='from-primary via-primary/80 to-primary absolute inset-x-0 top-0 h-1 bg-gradient-to-r' />
              )}
              <CardHeader className='pb-8'>
                <CardTitle className='text-2xl'>{plan.name}</CardTitle>
                <CardDescription className='mt-2'>
                  {plan.description}
                </CardDescription>
                <div className='mt-6'>
                  {plan.originalPrice && (
                    <span className='text-muted-foreground text-2xl line-through'>
                      {plan.originalPrice}
                    </span>
                  )}
                  <div className='flex items-baseline gap-1'>
                    <span className='text-5xl font-bold tracking-tight'>
                      {plan.price}
                    </span>
                    {plan.price !== 'Custom' && (
                      <span className='text-muted-foreground'>
                        /{billing === 'monthly' ? monthText : yearText}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className='flex-1'>
                <ul className='space-y-3'>
                  {plan.features.map((feature, i) => (
                    <li key={i} className='flex items-start gap-3'>
                      {feature.included ? (
                        <Check className='text-primary h-5 w-5 shrink-0' />
                      ) : (
                        <X className='text-muted-foreground/50 h-5 w-5 shrink-0' />
                      )}
                      <span
                        className={cn(
                          'text-sm',
                          !feature.included && 'text-muted-foreground/50'
                        )}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className='pt-4'>
                <Button className='w-full' variant={plan.variant} size='lg'>
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
