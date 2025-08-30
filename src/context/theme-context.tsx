import { createContext, useContext, useEffect, useState } from 'react'
import { loadThemeFonts } from '@/lib/font-loader'
import { applyThemeToRoot, loadThemeFromEnv, ThemeConfig } from '@/lib/themes'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  themeConfig?: ThemeConfig
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  themeConfig: ThemeConfig
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  themeConfig: loadThemeFromEnv(),
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  themeConfig = loadThemeFromEnv(),
  ...props
}: ThemeProviderProps) {
  const [theme, _setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = async (theme: Theme) => {
      root.classList.remove('light', 'dark') // Remove existing theme classes
      const systemTheme = mediaQuery.matches ? 'dark' : 'light'
      const effectiveTheme = theme === 'system' ? systemTheme : theme
      root.classList.add(effectiveTheme) // Add the new theme class

      // Set the data-theme attribute for theme-specific styling
      root.setAttribute('data-theme', themeConfig.preset)

      // Apply the theme colors from the preset
      applyThemeToRoot(themeConfig, effectiveTheme)

      // Load theme-specific fonts
      try {
        await loadThemeFonts(themeConfig.preset)
      } catch (_error) {
        // Silently handle font loading errors
      }
    }

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    applyTheme(theme)

    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, themeConfig])

  const setTheme = (theme: Theme) => {
    localStorage.setItem(storageKey, theme)
    _setTheme(theme)
  }

  const value = {
    theme,
    setTheme,
    themeConfig,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
