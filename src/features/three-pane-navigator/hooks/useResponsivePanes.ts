import { useEffect, useCallback, useState } from 'react'
import { useThreePaneNavigatorStore } from '@/stores/threePaneNavigatorStore'
import { BREAKPOINTS } from '../constants/layout.constants'

export function useResponsivePanes() {
  const { activePane, setActivePane } = useThreePaneNavigatorStore()
  const [windowSize, setWindowSize] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1024 }
    }
    return { width: window.innerWidth }
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navigateBack = useCallback(() => {
    if (activePane === 'details') {
      setActivePane('courses')
    } else if (activePane === 'courses') {
      setActivePane('programs')
    }
  }, [activePane, setActivePane])

  const isMobile = windowSize.width < BREAKPOINTS.MOBILE
  const isTablet =
    windowSize.width >= BREAKPOINTS.MOBILE &&
    windowSize.width < BREAKPOINTS.TABLET
  const isDesktop = windowSize.width >= BREAKPOINTS.TABLET

  return {
    isMobile,
    isTablet,
    isDesktop,
    navigateBack,
    showBackButton: isMobile && activePane !== 'programs',
    showMobileNav: isMobile, // Always show nav on mobile for breadcrumbs
  }
}
