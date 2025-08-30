import { useEffect } from 'react'
import { useLocation } from '@tanstack/react-router'

export function ScrollRestoration() {
  const location = useLocation()

  useEffect(() => {
    // Instantly scroll to top when route changes
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  return null
}
