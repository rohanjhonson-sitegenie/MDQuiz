import { useEffect, useMemo } from 'react'
import {
  getNavbarThemeColors,
  getNavbarThemeMode,
  applyNavbarThemeToRoot,
} from '@/lib/themes'
import { useTheme } from '@/context/theme-context'

export function useNavbarTheme() {
  const { themeConfig, theme } = useTheme()

  const navbarMode = useMemo(() => {
    return getNavbarThemeMode(themeConfig)
  }, [themeConfig])

  const navbarColors = useMemo(() => {
    return getNavbarThemeColors(themeConfig)
  }, [themeConfig])

  // Apply navbar theme to root element when theme changes
  useEffect(() => {
    if (themeConfig.navbar?.reverseTheme || themeConfig.navbar?.customColors) {
      applyNavbarThemeToRoot(themeConfig)
    }
  }, [themeConfig, theme])

  const navbarStyles = useMemo(() => {
    // No need to return inline styles since we're applying to root
    return {}
  }, [])

  const navbarClasses = useMemo(() => {
    const classes: string[] = []

    if (themeConfig.navbar?.reverseTheme) {
      classes.push('navbar-reverse-theme')
      classes.push(navbarMode) // Add 'light' or 'dark' class for the navbar
    }

    return classes.join(' ')
  }, [navbarMode, themeConfig.navbar?.reverseTheme])

  return {
    navbarMode,
    navbarColors,
    navbarStyles,
    navbarClasses,
    isReversed: themeConfig.navbar?.reverseTheme || false,
  }
}
