export interface ThemeColors {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground?: string
  border: string
  input: string
  ring: string
  chart1: string
  chart2: string
  chart3: string
  chart4: string
  chart5: string
  sidebar?: string
  sidebarForeground?: string
  sidebarPrimary?: string
  sidebarPrimaryForeground?: string
  sidebarAccent?: string
  sidebarAccentForeground?: string
  sidebarBorder?: string
  sidebarRing?: string
}

export interface ThemePreset {
  name: string
  light: ThemeColors
  dark: ThemeColors
}

export type ThemePresetName =
  | 'default'
  | 'emerald'
  | 'crimson'
  | 'ocean'
  | 'sunset'
  | 'rainbow'
  | 'ct'

export interface NavbarThemeConfig {
  reverseTheme?: boolean // If true, navbar uses opposite theme (dark when app is light, light when app is dark)
  customColors?: Partial<ThemeColors> // Custom colors specifically for navbar
}

export interface ThemeConfig {
  preset: ThemePresetName
  defaultMode: 'light' | 'dark' | 'system'
  enableCustomOverrides: boolean
  customColors?: Partial<ThemeColors>
  navbar?: NavbarThemeConfig
}
