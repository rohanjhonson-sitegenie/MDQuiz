import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface StatItem {
  value: number
  suffix: string
  label: string
  gradient: string
}

interface StatisticsProps {
  stats?: StatItem[]
  heading?: string
  subheading?: string
}

function CountUp({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      setCount(Math.floor(progress * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return count
}

export function Statistics({
  stats,
  heading,
  subheading,
}: StatisticsProps = {}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('statistics')
    if (element) observer.observe(element)

    return () => {
      if (element) observer.unobserve(element)
    }
  }, [])

  const statsData = stats || []

  return (
    <section id='statistics' className='container py-12 sm:py-16'>
      <div className='mx-auto max-w-7xl'>
        <div className='bg-muted/50 rounded-3xl p-8 md:p-12'>
          <div className='mx-auto mb-12 max-w-[58rem] text-center'>
            <h2 className='font-heading text-2xl font-bold sm:text-3xl md:text-4xl'>
              {heading}
              <span className='from-primary to-primary/60 block bg-gradient-to-r bg-clip-text text-transparent'>
                {subheading}
              </span>
            </h2>
          </div>

          <div className='grid grid-cols-2 gap-8 md:grid-cols-4'>
            {statsData.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  'group bg-background/50 relative flex flex-col items-center justify-center rounded-2xl border p-8 transition-all hover:shadow-lg',
                  'animate-in fade-in-50 slide-in-from-bottom-5'
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both',
                }}
              >
                <div
                  className={cn(
                    'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-10',
                    stat.gradient
                  )}
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                  }}
                />
                <div className='relative'>
                  <div className='text-2xl font-bold sm:text-3xl md:text-4xl'>
                    {isVisible && (
                      <>
                        <CountUp end={stat.value} />
                        <span
                          className={cn(
                            'bg-gradient-to-r bg-clip-text text-transparent',
                            stat.gradient
                          )}
                        >
                          {stat.suffix}
                        </span>
                      </>
                    )}
                  </div>
                  <p className='text-muted-foreground mt-2 text-sm font-medium'>
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
