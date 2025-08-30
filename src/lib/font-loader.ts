// Dynamic font loader for theme-specific fonts
export interface ThemeFonts {
  googleFontsUrl: string
  fontFamilies: {
    sans: string
    display?: string
    mono?: string
  }
}

// Font configurations for each theme
const themeFontConfigs: Record<string, ThemeFonts> = {
  'caution-tape': {
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@100;200;300;400;500;600;700;800;900&display=swap',
    fontFamilies: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'Space Grotesk, Outfit, "Bebas Neue", sans-serif',
      mono: 'JetBrains Mono, "Fira Code", "Cascadia Code", "Roboto Mono", monospace',
    },
  },
  default: {
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Manrope:wght@200..800&display=swap',
    fontFamilies: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'Manrope, Inter, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    },
  },
  emerald: {
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
    fontFamilies: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
  },
  ocean: {
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Fira+Code:wght@400;500;600&display=swap',
    fontFamilies: {
      sans: 'Poppins, system-ui, sans-serif',
      mono: 'Fira Code, monospace',
    },
  },
}

let currentLoadedTheme: string | null = null
let currentFontLink: HTMLLinkElement | null = null

export function loadThemeFonts(themeName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // If the same theme is already loaded, resolve immediately
    if (currentLoadedTheme === themeName) {
      resolve()
      return
    }

    const fontConfig =
      themeFontConfigs[themeName] || themeFontConfigs['default']

    // Remove existing font link if any
    if (currentFontLink) {
      currentFontLink.remove()
      currentFontLink = null
    }

    // Create new font link
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = fontConfig.googleFontsUrl

    // Handle load and error events
    link.onload = () => {
      currentLoadedTheme = themeName
      currentFontLink = link

      // Apply font families to CSS custom properties
      const root = document.documentElement
      root.style.setProperty('--font-sans', fontConfig.fontFamilies.sans)
      if (fontConfig.fontFamilies.display) {
        root.style.setProperty(
          '--font-display',
          fontConfig.fontFamilies.display
        )
      }
      if (fontConfig.fontFamilies.mono) {
        root.style.setProperty('--font-mono', fontConfig.fontFamilies.mono)
      }

      resolve()
    }

    link.onerror = () => {
      reject(new Error(`Failed to load fonts for theme: ${themeName}`))
    }

    // Add to document head
    document.head.appendChild(link)
  })
}

export function getThemeFontConfig(themeName: string): ThemeFonts {
  return themeFontConfigs[themeName] || themeFontConfigs['default']
}

export function preloadThemeFonts(themeName: string): void {
  const fontConfig = themeFontConfigs[themeName] || themeFontConfigs['default']

  // Create preload link
  const preloadLink = document.createElement('link')
  preloadLink.rel = 'preload'
  preloadLink.as = 'style'
  preloadLink.href = fontConfig.googleFontsUrl

  document.head.appendChild(preloadLink)
}
