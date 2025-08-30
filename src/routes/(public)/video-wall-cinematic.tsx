import { useEffect, useState, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { NavigationItem } from '@/types/navigation'
import { loadMDXContentViaHTTP } from '@/lib/content/http-content-loader'
import { useLocale } from '@/hooks/use-locale'
import { Footer, type FooterMDXData } from '@/components/layout/footer'
import { PublicNavbar } from '@/components/layout/public-navbar'
import { VideoWallProvider } from '@/features/video-wall'
import { CinematicVideoGrid } from '@/features/video-wall/components/CinematicVideoGrid'
import { CinematicVideoPlayer } from '@/features/video-wall/components/CinematicVideoPlayer'
import { useVideoWall } from '@/features/video-wall/hooks'

export const Route = createFileRoute('/(public)/video-wall-cinematic')({
  component: CinematicVideoWallPage,
})

function CinematicVideoWallPage() {
  return (
    <VideoWallProvider>
      <CinematicVideoWallContent />
    </VideoWallProvider>
  )
}

interface DirectiveElement {
  type: string
  props: Record<string, unknown>
}

function CinematicVideoWallContent() {
  const { locale } = useLocale()
  const [scrollY, setScrollY] = useState(0)
  const savedScrollPosition = useRef(0)
  const { isPlayerOpen } = useVideoWall()
  const [footerDirectives, setFooterDirectives] = useState<
    Record<string, DirectiveElement>
  >({})

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function loadFooterContent() {
      try {
        const footerResult = await loadMDXContentViaHTTP(
          'shared/footer',
          locale
        )
        setFooterDirectives(
          (footerResult.directives as Record<string, DirectiveElement>) || {}
        )
      } catch {
        // Silent error handling
      }
    }

    loadFooterContent()
  }, [locale])

  // Handle scroll position preservation when player opens/closes
  useEffect(() => {
    if (isPlayerOpen) {
      // Save current scroll position when player opens
      const currentScrollY =
        window.pageYOffset || document.documentElement.scrollTop
      savedScrollPosition.current = currentScrollY

      // Apply styles to prevent scrolling and maintain position
      document.body.style.position = 'fixed'
      document.body.style.top = `-${currentScrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else if (savedScrollPosition.current > 0) {
      // Only restore if we have a saved position

      // Temporarily disable smooth scrolling to prevent animation during restoration
      const originalScrollBehavior =
        document.documentElement.style.scrollBehavior
      document.documentElement.style.scrollBehavior = 'auto'

      // Restore scroll position when player closes
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''

      // Use multiple approaches to ensure scroll restoration works
      const scrollPosition = savedScrollPosition.current

      // Immediate scroll with no animation
      window.scrollTo({ top: scrollPosition, behavior: 'auto' })

      // Backup with requestAnimationFrame
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollPosition, behavior: 'auto' })

        // Final backup with setTimeout
        setTimeout(() => {
          window.scrollTo({ top: scrollPosition, behavior: 'auto' })

          // Restore original scroll behavior after restoration is complete
          document.documentElement.style.scrollBehavior = originalScrollBehavior
        }, 10)
      })
    }

    // Cleanup function
    return () => {
      if (!isPlayerOpen) {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
      }
    }
  }, [isPlayerOpen])

  const navigation: NavigationItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/#features', isHashLink: true },
    { name: 'Services', href: '/#services', isHashLink: true },
    { name: 'Pricing', href: '/#pricing', isHashLink: true },
    { name: 'About', href: '/#about', isHashLink: true },
    { name: 'FAQ', href: '/#faq', isHashLink: true },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Video Wall', href: '/video-wall' },
  ]

  return (
    <div className='bg-background text-foreground min-h-screen overflow-x-hidden'>
      {/* Ambient Background */}
      <div className='fixed inset-0 z-0'>
        {/* Gradient Orbs */}
        <div className='absolute top-0 -left-40 h-96 w-96 animate-pulse rounded-full bg-purple-700 opacity-20 blur-[128px] filter dark:opacity-20' />
        <div
          className='absolute -right-40 bottom-0 h-96 w-96 animate-pulse rounded-full bg-blue-700 opacity-20 blur-[128px] filter dark:opacity-20'
          style={{ animationDelay: '2s' }}
        />
        <div className='absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-10 blur-[200px] filter dark:opacity-10' />

        {/* Noise Texture */}
        <div
          className='absolute inset-0 opacity-[0.015] dark:opacity-[0.015]'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Navbar with blur backdrop - Fixed/Sticky */}
      {!isPlayerOpen && (
        <div className='bg-background/80 dark:bg-background/80 border-border/10 fixed top-0 right-0 left-0 z-40 border-b backdrop-blur-xl'>
          <PublicNavbar items={navigation} />
        </div>
      )}

      <main className='relative z-10 pt-16'>
        {/* Hero Section */}
        <section className='relative flex min-h-[50vh] items-center justify-center px-4 py-20'>
          <div
            className='mx-auto max-w-4xl space-y-6 text-center'
            style={{
              transform: `translateY(${scrollY * 0.3}px)`,
              opacity: Math.max(0, 1 - scrollY / 500),
            }}
          >
            <h1 className='from-foreground via-foreground/90 to-foreground/80 animate-gradient bg-gradient-to-r bg-clip-text text-6xl font-bold text-transparent md:text-8xl'>
              Video Gallery
            </h1>
            <p className='text-muted-foreground text-xl font-light tracking-wide md:text-2xl'>
              Immerse yourself in our cinematic collection
            </p>

            {/* Scroll Indicator */}
            <div className='absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce'>
              <div className='border-border/30 flex h-[50px] w-[30px] items-start justify-center rounded-full border-2 p-2'>
                <div className='bg-muted-foreground/60 animate-scroll h-3 w-1 rounded-full' />
              </div>
            </div>
          </div>
        </section>

        {/* Video Collections */}
        <div className='relative space-y-32 pb-20'>
          <CinematicVideoGrid
            playlistId='PLA1coXKXcYsc3J6X8kG5owWmSIhCP0jsq'
            title='Robot Reveal'
            subtitle='Witness the future of robotics'
          />

          <CinematicVideoGrid
            playlistId='PLA1coXKXcYsddDAACz0URiYf4SkonYsrq'
            title='BattleBots'
            subtitle='Epic mechanical warfare'
          />
        </div>

        <CinematicVideoPlayer />
      </main>

      {!isPlayerOpen && (
        <div className='bg-background/50 dark:bg-background/50 border-border/10 relative z-20 border-t backdrop-blur-xl'>
          <Footer
            footerData={
              footerDirectives.footer?.props as unknown as FooterMDXData
            }
          />
        </div>
      )}

      <style>{`
        @keyframes gradient {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @keyframes scroll {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }

        .animate-gradient {
          animation: gradient 3s ease-in-out infinite;
        }

        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
