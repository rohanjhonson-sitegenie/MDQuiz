import { cautionTapeTheme } from './presets/caution-tape'
import { crimsonTheme } from './presets/crimson'
import { defaultTheme } from './presets/default'
import { emeraldTheme } from './presets/emerald'
import { oceanTheme } from './presets/ocean'
import { rainbowTheme } from './presets/rainbow'
import { sunsetTheme } from './presets/sunset'
import { ThemeColors, ThemeConfig, ThemePreset, ThemePresetName } from './types'

const themeRegistry: Record<ThemePresetName, ThemePreset> = {
  default: defaultTheme,
  emerald: emeraldTheme,
  crimson: crimsonTheme,
  ocean: oceanTheme,
  sunset: sunsetTheme,
  rainbow: rainbowTheme,
  ct: cautionTapeTheme,
}

export function loadThemeFromEnv(): ThemeConfig {
  const preset =
    (import.meta.env.VITE_THEME_PRESET as ThemePresetName) || 'default'
  const defaultMode = import.meta.env.VITE_DEFAULT_MODE || 'system'
  const enableCustomOverrides =
    import.meta.env.VITE_ENABLE_CUSTOM_THEME === 'true'

  const customColors: Partial<ThemeColors> = {}

  if (enableCustomOverrides) {
    if (import.meta.env.VITE_PRIMARY_COLOR) {
      customColors.primary = import.meta.env.VITE_PRIMARY_COLOR
    }
    if (import.meta.env.VITE_SECONDARY_COLOR) {
      customColors.secondary = import.meta.env.VITE_SECONDARY_COLOR
    }
    if (import.meta.env.VITE_ACCENT_COLOR) {
      customColors.accent = import.meta.env.VITE_ACCENT_COLOR
    }
  }

  // Navbar configuration
  const navbarConfig = {
    reverseTheme: import.meta.env.VITE_NAVBAR_REVERSE_THEME === 'true',
    customColors: {} as Partial<ThemeColors>,
  }

  // Allow custom navbar colors if enabled
  if (enableCustomOverrides) {
    if (import.meta.env.VITE_NAVBAR_BACKGROUND_COLOR) {
      navbarConfig.customColors.background =
        import.meta.env.VITE_NAVBAR_BACKGROUND_COLOR
    }
    if (import.meta.env.VITE_NAVBAR_FOREGROUND_COLOR) {
      navbarConfig.customColors.foreground =
        import.meta.env.VITE_NAVBAR_FOREGROUND_COLOR
    }
    if (import.meta.env.VITE_NAVBAR_PRIMARY_COLOR) {
      navbarConfig.customColors.primary =
        import.meta.env.VITE_NAVBAR_PRIMARY_COLOR
    }
  }

  return {
    preset: themeRegistry[preset] ? preset : 'default',
    defaultMode: defaultMode as 'light' | 'dark' | 'system',
    enableCustomOverrides,
    customColors,
    navbar: navbarConfig,
  }
}

export function getThemePreset(name: ThemePresetName): ThemePreset {
  return themeRegistry[name] || themeRegistry.default
}

function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

export function applyThemeToRoot(config: ThemeConfig, mode: 'light' | 'dark') {
  const preset = getThemePreset(config.preset)
  const colors = { ...preset[mode], ...config.customColors }

  const root = document.documentElement

  Object.entries(colors).forEach(([key, value]) => {
    if (value) {
      root.style.setProperty(`--${kebabCase(key)}`, value)
    }
  })

  // Set sidebar colors to match the main colors if not specified
  if (!colors.sidebar) {
    root.style.setProperty('--sidebar', `var(--background)`)
    root.style.setProperty('--sidebar-foreground', `var(--foreground)`)
    root.style.setProperty('--sidebar-primary', `var(--primary)`)
    root.style.setProperty(
      '--sidebar-primary-foreground',
      `var(--primary-foreground)`
    )
    root.style.setProperty('--sidebar-accent', `var(--accent)`)
    root.style.setProperty(
      '--sidebar-accent-foreground',
      `var(--accent-foreground)`
    )
    root.style.setProperty('--sidebar-border', `var(--border)`)
    root.style.setProperty('--sidebar-ring', `var(--ring)`)
  }

  // Apply navbar theme colors
  applyNavbarThemeToRoot(config)
}

export function applyNavbarThemeToRoot(config: ThemeConfig) {
  const root = document.documentElement
  const navbarColors = getNavbarThemeColors(config)

  // Apply navbar-specific CSS variables
  root.style.setProperty('--navbar-background', navbarColors.background)
  root.style.setProperty('--navbar-foreground', navbarColors.foreground)
  root.style.setProperty('--navbar-muted', navbarColors.muted)
  root.style.setProperty(
    '--navbar-muted-foreground',
    navbarColors.mutedForeground
  )
  root.style.setProperty('--navbar-accent', navbarColors.accent)
  root.style.setProperty(
    '--navbar-accent-foreground',
    navbarColors.accentForeground
  )
  root.style.setProperty('--navbar-primary', navbarColors.primary)
  root.style.setProperty(
    '--navbar-primary-foreground',
    navbarColors.primaryForeground
  )
  root.style.setProperty('--navbar-border', navbarColors.border)
}

export function getCurrentThemeMode(): 'light' | 'dark' {
  const isDark = document.documentElement.classList.contains('dark')
  return isDark ? 'dark' : 'light'
}

export function getNavbarThemeMode(config: ThemeConfig): 'light' | 'dark' {
  const currentMode = getCurrentThemeMode()

  // If navbar reverse theme is enabled, return the opposite theme
  if (config.navbar?.reverseTheme) {
    return currentMode === 'light' ? 'dark' : 'light'
  }

  return currentMode
}

export function getNavbarThemeColors(config: ThemeConfig): ThemeColors {
  const navbarMode = getNavbarThemeMode(config)
  const preset = getThemePreset(config.preset)

  // Start with the preset colors for the navbar mode
  const baseColors = preset[navbarMode]

  // Apply any custom navbar colors
  const navbarColors = {
    ...baseColors,
    ...config.navbar?.customColors,
  }

  return navbarColors
}

export * from './types'
