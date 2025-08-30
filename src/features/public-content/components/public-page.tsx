import { useEffect, useState } from 'react'
import { loadMDXContentViaHTTP } from '@/lib/content/http-content-loader'
import { useLocale } from '@/hooks/use-locale'
import { Footer, type FooterMDXData } from '@/components/layout/footer'
import { PublicNavbar } from '@/components/layout/public-navbar'
import { MarkdownContentWrapper } from '@/features/blog/components/markdown-content-wrapper'
import { useFooterContent } from '../hooks/use-footer-content'
import { usePublicNavigation } from '../hooks/use-public-navigation'

interface PublicPageProps {
  contentPath: string
  pageTitle: string
}

export default function PublicPage({
  contentPath,
  pageTitle,
}: PublicPageProps) {
  const { locale } = useLocale()
  const [content, setContent] = useState('')
  const [metadata, setMetadata] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)

  const navigation = usePublicNavigation()
  const { footerDirectives } = useFooterContent(locale)

  useEffect(() => {
    async function loadContent() {
      try {
        const legalResult = await loadMDXContentViaHTTP(
          `legal/${contentPath}`,
          locale
        )
        setContent(legalResult.content)
        setMetadata(legalResult.metadata)
      } catch {
        setContent('Content temporarily unavailable. Please try again later.')
        setMetadata({
          title: pageTitle,
          description: 'Legal content loading error',
        })
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [locale, contentPath, pageTitle])

  if (loading) {
    return (
      <div className='bg-background min-h-screen'>
        <PublicNavbar items={navigation} />
        <main className='container mx-auto px-4 py-12'>
          <div className='mx-auto max-w-7xl'>
            <div className='animate-pulse'>
              <div className='bg-muted mb-4 h-8 w-1/3 rounded'></div>
              <div className='space-y-2'>
                <div className='bg-muted h-4 rounded'></div>
                <div className='bg-muted h-4 w-5/6 rounded'></div>
                <div className='bg-muted h-4 w-4/6 rounded'></div>
              </div>
            </div>
          </div>
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
      <main className='container mx-auto px-4 py-12'>
        <article className='mx-auto max-w-7xl'>
          <header className='mb-8'>
            <h1 className='mb-4 text-4xl font-bold tracking-tight'>
              {(metadata.title as string) || pageTitle}
            </h1>
            {typeof metadata.description === 'string' && (
              <p className='text-muted-foreground text-xl'>
                {metadata.description}
              </p>
            )}
            {typeof metadata.lastUpdated === 'string' && (
              <p className='text-muted-foreground mt-4 text-sm'>
                Last updated:{' '}
                {new Date(metadata.lastUpdated).toLocaleDateString()}
              </p>
            )}
          </header>
          <div className='prose prose-gray dark:prose-invert max-w-none'>
            <MarkdownContentWrapper content={content} />
          </div>
        </article>
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
