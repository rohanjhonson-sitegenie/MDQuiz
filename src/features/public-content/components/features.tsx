import { Code2, Palette, Zap, Shield, Globe, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface FeatureItem {
  title: string
  description: string
  icon: 'Code2' | 'Palette' | 'Zap' | 'Shield' | 'Globe' | 'Sparkles'
  gradient: string
}

interface FeaturesProps {
  badge?: string
  heading?: string
  description?: string
  features?: FeatureItem[]
}

export function Features({
  badge,
  heading,
  description,
  features,
}: FeaturesProps = {}) {
  const iconMap = {
    Code2,
    Palette,
    Zap,
    Shield,
    Globe,
    Sparkles,
  } as const

  // Convert MDX features to component format
  const processedFeatures =
    features?.map((feature) => ({
      ...feature,
      icon: iconMap[feature.icon as keyof typeof iconMap] || Code2,
    })) || []

  return (
    <section id='features' className='container py-12 sm:py-16'>
      <div className='mx-auto max-w-[58rem] text-center'>
        {badge && (
          <Badge variant='outline' className='mb-4'>
            {badge}
          </Badge>
        )}
        <h2 className='font-heading text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl'>
          <span className='from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent'>
            {heading}
          </span>
        </h2>
        <p className='text-muted-foreground mt-6 text-lg sm:text-xl'>
          {description}
        </p>
      </div>

      <div className='mx-auto mt-16 max-w-7xl'>
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {processedFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className={cn(
                  'group border-muted/50 bg-background/50 hover:border-primary/50 relative overflow-hidden backdrop-blur transition-all hover:shadow-lg',
                  'animate-in fade-in-50 slide-in-from-bottom-5'
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both',
                }}
              >
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-10',
                    feature.gradient
                  )}
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                  }}
                />
                <CardHeader>
                  <div
                    className={cn(
                      'inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br text-white',
                      feature.gradient
                    )}
                  >
                    <Icon className='h-6 w-6' />
                  </div>
                  <CardTitle className='mt-4 text-xl font-semibold'>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-sm leading-relaxed'>
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
