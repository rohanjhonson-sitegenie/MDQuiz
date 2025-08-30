import { useEffect, useState } from 'react'
import { loadMDXContentViaHTTP } from '@/lib/content/http-content-loader'
import { useLocale } from '@/hooks/use-locale'
import { EnhancedMarkdownContent } from '@/components/enhanced-markdown-content'
import { Footer, type FooterMDXData } from '@/components/layout/footer'
import { PublicNavbar } from '@/components/layout/public-navbar'
import { useFooterContent } from '../hooks/use-footer-content'
import { usePublicNavigation } from '../hooks/use-public-navigation'

interface DirectiveElement {
  type: string
  props: Record<string, unknown>
}

interface EnhancedPublicPageProps {
  contentPath: string
  enableDirectives?: boolean
}

export default function EnhancedPublicPage({
  contentPath,
  enableDirectives = true,
}: EnhancedPublicPageProps) {
  const { locale } = useLocale()
  const [content, setContent] = useState('')
  const [directives, setDirectives] = useState<
    Record<string, DirectiveElement>
  >({})
  const [loading, setLoading] = useState(true)

  const navigation = usePublicNavigation()
  const { footerDirectives } = useFooterContent(locale)

  useEffect(() => {
    async function loadContent() {
      try {
        const landingResult = await loadMDXContentViaHTTP(contentPath, locale)
        setContent(landingResult.content)

        if (enableDirectives) {
          setDirectives(
            (landingResult.directives as Record<string, DirectiveElement>) || {}
          )
        }
      } catch {
        setContent('Content temporarily unavailable. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [locale, contentPath, enableDirectives])

  if (loading) {
    return (
      <div className='bg-background min-h-screen'>
        <PublicNavbar items={navigation} />
        <main className='flex min-h-[50vh] items-center justify-center'>
          <div>Loading...</div>
        </main>
        <Footer
          footerData={
            (footerDirectives.footer as { props?: unknown })
              ?.props as FooterMDXData
          }
        />
      </div>
    )
  }

  return (
    <div className='bg-background min-h-screen'>
      <PublicNavbar items={navigation} />
      <main>
        <EnhancedMarkdownContent content={content} directives={directives} />
      </main>
      <Footer
        footerData={
          (footerDirectives.footer as { props?: unknown })
            ?.props as FooterMDXData
        }
      />
    </div>
  )
}
