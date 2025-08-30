import { Target, Users, Zap, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface ValueItem {
  icon: 'Target' | 'Users' | 'Zap' | 'Heart'
  title: string
  description: string
}

interface AboutProps {
  badge?: string
  heading?: string
  description?: string
  stats?: Array<{
    value: string
    label: string
  }>
  values?: ValueItem[]
}

export function About({
  badge,
  heading,
  description,
  stats,
  values,
}: AboutProps = {}) {
  const iconMap = {
    Target,
    Users,
    Zap,
    Heart,
  } as const

  // Convert MDX values to component format
  const processedValues =
    values?.map((value) => ({
      ...value,
      icon: iconMap[value.icon as keyof typeof iconMap] || Target,
    })) || []

  return (
    <section id='about' className='container py-12 sm:py-16'>
      <div className='mx-auto max-w-7xl'>
        <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-16'>
          {/* Text Content */}
          <div className='space-y-8'>
            <div>
              <Badge variant='outline' className='mb-4'>
                {badge}
              </Badge>
              <h2 className='font-heading text-3xl font-bold sm:text-4xl md:text-5xl'>
                {heading}
              </h2>
            </div>

            <div className='text-muted-foreground space-y-4'>
              <p className='text-lg leading-relaxed'>{description}</p>
            </div>
          </div>

          {/* Values Grid */}
          <div className='grid gap-4 sm:grid-cols-2'>
            {processedValues.map((value, index) => {
              const Icon = value.icon
              return (
                <Card
                  key={value.title}
                  className={cn(
                    'group border-muted/50 bg-background/50 hover:border-primary/50 p-6 backdrop-blur transition-all hover:shadow-lg',
                    'animate-in fade-in-50 slide-in-from-bottom-5'
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <Icon className='text-primary mb-4 h-10 w-10' />
                  <h3 className='mb-2 font-semibold'>{value.title}</h3>
                  <p className='text-muted-foreground text-sm'>
                    {value.description}
                  </p>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div className='mt-16 grid grid-cols-2 gap-8 text-center sm:grid-cols-4'>
          {stats?.map((stat, index) => (
            <div key={index}>
              <div className='text-primary text-4xl font-bold'>
                {stat.value}
              </div>
              <p className='text-muted-foreground mt-2 text-sm'>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
