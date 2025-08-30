import { Link } from '@tanstack/react-router'
import { ArrowRight, GitBranch, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface HeroProps {
  title?: string
  subtitle?: string
  description?: string
  highlights?: string[]
  badge?: {
    text: string
    icon?: string
  }
  primaryButton?: {
    text: string
    href: string
  }
  secondaryButton?: {
    text: string
    href: string
    external?: boolean
  }
}

export function Hero({
  title,
  subtitle,
  description,
  highlights,
  badge,
  primaryButton,
  secondaryButton,
}: HeroProps = {}) {
  return (
    <section className='relative container overflow-hidden'>
      <div className='bg-background absolute inset-0 -z-10 h-full w-full'>
        <div className='absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:4rem_4rem]'></div>
      </div>

      <div className='absolute inset-x-0 top-0 -z-10 h-96 overflow-hidden'>
        <div className='from-primary/30 to-accent/30 absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 animate-pulse rounded-full bg-gradient-to-r blur-[100px]'></div>
      </div>

      <div className='mx-auto flex max-w-[64rem] flex-col items-center gap-4 pt-12 pb-4 text-center'>
        <Badge
          variant='outline'
          className='hero-animate-1 mb-4 px-4 py-1.5 text-sm font-medium'
        >
          <Sparkles className='text-primary mr-2 h-3.5 w-3.5' />
          <span className='from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent'>
            {badge?.text}
          </span>
        </Badge>

        <h1 className='font-heading hero-animate-2 text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl'>
          {title}
          <br className='hidden sm:inline' />
          <span className='from-primary via-primary/80 to-primary/60 bg-gradient-to-r bg-clip-text text-transparent'>
            {subtitle}
          </span>
        </h1>

        <p className='text-muted-foreground hero-animate-3 max-w-[42rem] leading-normal sm:text-xl sm:leading-8'>
          {description}
          {highlights?.map((highlight, index) => (
            <span key={highlight} className='text-foreground font-medium'>
              {index === 0 ? ' ' : ', '}
              {highlight}
            </span>
          ))}
          .
        </p>

        <div className='hero-animate-4 flex flex-col gap-4 sm:flex-row'>
          <Button size='lg' className='group gap-2' asChild>
            <Link to={primaryButton?.href || '/auth/sign-up'}>
              {primaryButton?.text}
              <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
            </Link>
          </Button>
          <Button
            size='lg'
            variant='outline'
            className='border-primary/20 hover:border-primary/40 gap-2'
            asChild
          >
            {(secondaryButton?.external ?? true) ? (
              <a
                href={secondaryButton?.href || 'https://github.com'}
                target='_blank'
                rel='noopener noreferrer'
              >
                <GitBranch className='h-4 w-4' />
                {secondaryButton?.text}
              </a>
            ) : (
              <Link to={secondaryButton?.href || '#'}>
                <GitBranch className='h-4 w-4' />
                {secondaryButton?.text}
              </Link>
            )}
          </Button>
        </div>
      </div>
    </section>
  )
}
