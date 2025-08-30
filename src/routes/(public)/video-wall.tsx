import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { NavigationItem } from '@/types/navigation'
import { loadMDXContentViaHTTP } from '@/lib/content/http-content-loader'
import { useLocale } from '@/hooks/use-locale'
import { Footer, type FooterMDXData } from '@/components/layout/footer'
import { PublicNavbar } from '@/components/layout/public-navbar'
import {
  VideoWallProvider,
  VideoPlaylistGrid,
  VideoPlayer,
} from '@/features/video-wall'

export const Route = createFileRoute('/(public)/video-wall')({
  component: VideoWallPage,
})

interface DirectiveElement {
  type: string
  props: Record<string, unknown>
}

function VideoWallPage() {
  const { locale } = useLocale()
  const [footerDirectives, setFooterDirectives] = useState<
    Record<string, DirectiveElement>
  >({})

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
    <div className='bg-background min-h-screen'>
      <PublicNavbar items={navigation} />

      <VideoWallProvider>
        <main className='container mx-auto px-4 py-8'>
          <div className='mb-8'>
            <h1 className='mb-2 text-4xl font-bold'>Video Gallery</h1>
            <p className='text-muted-foreground'>
              Explore our curated collection of educational videos
            </p>
          </div>

          <div className='space-y-12'>
            <VideoPlaylistGrid
              playlistId='PLA1coXKXcYsc3J6X8kG5owWmSIhCP0jsq'
              title='Robot Reveal'
              columns={3}
            />

            <VideoPlaylistGrid
              playlistId='PLA1coXKXcYsddDAACz0URiYf4SkonYsrq'
              title='BattleBots'
              columns={3}
            />
          </div>

          <VideoPlayer />
        </main>
      </VideoWallProvider>

      <Footer
        footerData={footerDirectives.footer?.props as unknown as FooterMDXData}
      />
    </div>
  )
}
