import { UserPlus, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface StepItem {
  step: string
  title: string
  description: string
  icon: typeof UserPlus
  color: string
}

interface HowItWorksProps {
  steps?: StepItem[]
  badge?: string
  heading?: string
  subheading?: string
  description?: string
}

export function HowItWorks({
  steps,
  badge,
  heading,
  subheading,
  description,
}: HowItWorksProps = {}) {
  const stepsData = steps || []

  return (
    <section id='how-it-works' className='container py-12 sm:py-16'>
      <div className='mx-auto max-w-[58rem] text-center'>
        <Badge variant='outline' className='mb-4'>
          {badge}
        </Badge>
        <h2 className='font-heading text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl'>
          {heading}
          <span className='from-primary to-primary/60 block bg-gradient-to-r bg-clip-text text-transparent'>
            {subheading}
          </span>
        </h2>
        <p className='text-muted-foreground mt-6 text-lg sm:text-xl'>
          {description}
        </p>
      </div>

      <div className='mx-auto mt-16 max-w-7xl'>
        <div className='relative'>
          {/* Connection lines for desktop */}
          <div className='via-border absolute top-24 right-1/4 left-1/4 hidden h-0.5 bg-gradient-to-r from-transparent to-transparent lg:block' />

          <div className='grid gap-8 md:grid-cols-3'>
            {stepsData.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={item.step}
                  className={cn(
                    'relative',
                    'animate-in fade-in-50 slide-in-from-bottom-5'
                  )}
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <Card className='group border-muted/50 bg-background/50 hover:border-primary/50 h-full overflow-hidden backdrop-blur transition-all hover:shadow-lg'>
                    <CardHeader className='pb-6'>
                      <div className='mb-4 flex items-start justify-between'>
                        <div
                          className={cn(
                            'inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
                            item.color
                          )}
                        >
                          <Icon className='h-6 w-6' />
                        </div>
                        <Badge
                          variant='secondary'
                          className='px-3 py-1 text-2xl font-bold'
                        >
                          {item.step}
                        </Badge>
                      </div>
                      <CardTitle className='text-xl font-semibold'>
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className='text-sm leading-relaxed'>
                        {item.description}
                      </CardDescription>
                    </CardContent>
                  </Card>

                  {/* Arrow indicator */}
                  {index < stepsData.length - 1 && (
                    <div className='text-muted-foreground/30 absolute top-1/2 -right-4 hidden -translate-y-1/2 lg:block'>
                      <ArrowRight className='h-8 w-8' />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
