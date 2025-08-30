import { useEffect, useState } from 'react'
import { loadMDXContentViaHTTP } from '@/lib/content/http-content-loader'

interface FooterContentReturn {
  footerDirectives: Record<string, unknown>
  loading: boolean
}

export function useFooterContent(locale: string): FooterContentReturn {
  const [footerDirectives, setFooterDirectives] = useState<
    Record<string, unknown>
  >({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFooterContent() {
      try {
        const footerResult = await loadMDXContentViaHTTP(
          'shared/footer',
          locale
        )
        setFooterDirectives(
          (footerResult.directives as Record<string, unknown>) || {}
        )
      } catch {
        // Silent error handling - use empty directives
        setFooterDirectives({})
      } finally {
        setLoading(false)
      }
    }

    loadFooterContent()
  }, [locale])

  return { footerDirectives, loading }
}
