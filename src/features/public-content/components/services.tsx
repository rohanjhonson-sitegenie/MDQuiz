import {
  Users,
  BarChart3,
  Workflow,
  Rocket,
  Shield,
  HeartHandshake,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ServiceItem {
  title: string
  description: string
  icon:
    | 'Users'
    | 'BarChart3'
    | 'Workflow'
    | 'Rocket'
    | 'Shield'
    | 'HeartHandshake'
  features: string[]
  highlighted?: boolean
}

interface ServicesProps {
  badge?: string
  heading?: string
  description?: string
  services?: ServiceItem[]
}

export function Services({
  badge,
  heading,
  description,
  services,
}: ServicesProps = {}) {
  const iconMap = {
    Users,
    BarChart3,
    Workflow,
    Rocket,
    Shield,
    HeartHandshake,
  } as const

  // Convert MDX services to component format
  const processedServices =
    services?.map((service) => ({
      ...service,
      icon: iconMap[service.icon as keyof typeof iconMap] || Users,
    })) || []

  return (
    <section id='services' className='container py-12 sm:py-16'>
      <div className='mx-auto max-w-[58rem] text-center'>
        <Badge variant='outline' className='mb-4'>
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
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {processedServices.map((service, index) => {
            const Icon = service.icon
            return (
              <Card
                key={service.title}
                className={cn(
                  'group relative overflow-hidden transition-all hover:shadow-xl',
                  service.highlighted &&
                    'border-primary scale-105 shadow-lg lg:scale-110',
                  'animate-in fade-in-50 slide-in-from-bottom-5'
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both',
                }}
              >
                <CardHeader>
                  <div className='bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg transition-colors'>
                    <Icon className='h-6 w-6' />
                  </div>
                  <CardTitle className='text-xl font-semibold'>
                    {service.title}
                  </CardTitle>
                  <CardDescription className='mt-2'>
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <ul className='text-muted-foreground space-y-2 text-sm'>
                    {service.features.map((feature) => (
                      <li key={feature} className='flex items-center'>
                        <div className='bg-primary mr-2 h-1 w-1 rounded-full' />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
