import { ThemePreset } from '../types'

export const cautionTapeTheme: ThemePreset = {
  name: 'ct',
  light: {
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.15 0.02 0)',
    card: 'oklch(1 0 0)',
    cardForeground: 'oklch(0.15 0.02 0)',
    popover: 'oklch(1 0 0)',
    popoverForeground: 'oklch(0.15 0.02 0)',
    primary: 'oklch(0.72 0.22 45)', // Vibrant safety orange
    primaryForeground: 'oklch(1 0 0)',
    secondary: 'oklch(0.968 0.007 45)', // Light gray with subtle orange tint
    secondaryForeground: 'oklch(0.15 0.02 0)',
    muted: 'oklch(0.97 0.01 45)', // Very subtle orange tint
    mutedForeground: 'oklch(0.5 0.02 0)',
    accent: 'oklch(0.97 0.03 45)', // Much more subtle orange for hover
    accentForeground: 'oklch(0.15 0.02 0)',
    destructive: 'oklch(0.6 0.25 29)', // Red-orange for errors
    border: 'oklch(0.92 0.03 45)',
    input: 'oklch(0.92 0.03 45)',
    ring: 'oklch(0.72 0.22 45)',
    chart1: 'oklch(0.72 0.22 45)', // Orange
    chart2: 'oklch(0.83 0.22 95.5)', // Yellow
    chart3: 'oklch(0.25 0.03 0)', // Black
    chart4: 'oklch(0.6 0.15 150)', // Teal
    chart5: 'oklch(0.55 0.18 360)', // Red
    // Sidebar colors
    sidebar: 'oklch(0.98 0.02 45)', // Very light orange tint
    sidebarForeground: 'oklch(0.15 0.02 0)',
    sidebarPrimary: 'oklch(0.72 0.22 45)', // Orange
    sidebarPrimaryForeground: 'oklch(1 0 0)',
    sidebarAccent: 'oklch(0.97 0.03 45)', // Very subtle orange for hover
    sidebarAccentForeground: 'oklch(0.15 0.02 0)',
    sidebarBorder: 'oklch(0.92 0.03 45)',
    sidebarRing: 'oklch(0.72 0.22 45)',
  },
  dark: {
    background: 'oklch(0.12 0.01 0)',
    foreground: 'oklch(0.95 0 0)',
    card: 'oklch(0.16 0.01 0)',
    cardForeground: 'oklch(0.95 0 0)',
    popover: 'oklch(0.18 0.01 0)',
    popoverForeground: 'oklch(0.95 0 0)',
    primary: 'oklch(0.68 0.20 45)', // Safety orange for dark mode
    primaryForeground: 'oklch(0.12 0.01 0)',
    secondary: 'oklch(0.279 0.041 45)', // Dark gray with subtle orange tint
    secondaryForeground: 'oklch(0.95 0 0)',
    muted: 'oklch(0.25 0.01 45)', // Very subtle orange tint
    mutedForeground: 'oklch(0.65 0 0)',
    accent: 'oklch(0.25 0.03 45)', // Much more subtle orange for hover in dark mode
    accentForeground: 'oklch(0.95 0 0)',
    destructive: 'oklch(0.65 0.22 29)', // Red-orange for errors
    border: 'oklch(1 0 0 / 15%)',
    input: 'oklch(1 0 0 / 20%)',
    ring: 'oklch(0.68 0.20 45)',
    chart1: 'oklch(0.68 0.20 45)', // Orange
    chart2: 'oklch(0.75 0.20 95.5)', // Yellow
    chart3: 'oklch(0.85 0.05 0)', // Light gray
    chart4: 'oklch(0.65 0.15 150)', // Teal
    chart5: 'oklch(0.6 0.2 360)', // Red
    // Sidebar colors for dark mode
    sidebar: 'oklch(0.14 0.02 45)', // Very dark with orange tint
    sidebarForeground: 'oklch(0.95 0 0)',
    sidebarPrimary: 'oklch(0.68 0.20 45)', // Orange
    sidebarPrimaryForeground: 'oklch(0.12 0.01 0)',
    sidebarAccent: 'oklch(0.25 0.03 45)', // Very subtle orange for hover in dark mode
    sidebarAccentForeground: 'oklch(0.95 0 0)',
    sidebarBorder: 'oklch(1 0 0 / 15%)',
    sidebarRing: 'oklch(0.68 0.20 45)',
  },
}
