import type { NavigationItem } from '@/types/navigation'
import { useLocale } from '@/hooks/use-locale'

export function usePublicNavigation(): NavigationItem[] {
  const { t } = useLocale()

  return [
    { name: t('nav.features'), href: '#features', isHashLink: true },
    { name: t('nav.services'), href: '#services', isHashLink: true },
    { name: t('nav.pricing'), href: '#pricing', isHashLink: true },
    { name: t('nav.about'), href: '#about', isHashLink: true },
    { name: t('nav.faq'), href: '#faq', isHashLink: true },
    { name: t('nav.blogs'), href: '/blogs' },
    { name: t('nav.badges'), href: '/design-system/badges' },
    { name: t('nav.videoWall'), href: '/video-wall-cinematic' },
  ]
}
