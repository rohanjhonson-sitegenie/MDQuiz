export interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  glow: string
}

export const videoColorPalettes: ColorPalette[] = [
  // Orange/Amber - Warm robotics
  {
    primary: 'from-orange-500 to-amber-500',
    secondary: 'from-amber-400 to-yellow-500',
    accent: 'from-orange-600 to-amber-600',
    glow: 'from-orange-500/30',
  },
  // Blue/Cyan - Tech/AI
  {
    primary: 'from-blue-500 to-cyan-500',
    secondary: 'from-cyan-400 to-sky-500',
    accent: 'from-blue-600 to-cyan-600',
    glow: 'from-blue-500/30',
  },
  // Purple/Pink - Innovation
  {
    primary: 'from-purple-500 to-pink-500',
    secondary: 'from-pink-400 to-rose-500',
    accent: 'from-purple-600 to-pink-600',
    glow: 'from-purple-500/30',
  },
  // Green/Emerald - Growth/Success
  {
    primary: 'from-green-500 to-emerald-500',
    secondary: 'from-emerald-400 to-teal-500',
    accent: 'from-green-600 to-emerald-600',
    glow: 'from-green-500/30',
  },
  // Red/Rose - Competition/Battle
  {
    primary: 'from-red-500 to-rose-500',
    secondary: 'from-rose-400 to-pink-500',
    accent: 'from-red-600 to-rose-600',
    glow: 'from-red-500/30',
  },
  // Indigo/Violet - Deep tech
  {
    primary: 'from-indigo-500 to-violet-500',
    secondary: 'from-violet-400 to-purple-500',
    accent: 'from-indigo-600 to-violet-600',
    glow: 'from-indigo-500/30',
  },
  // Teal/Cyan - Modern
  {
    primary: 'from-teal-500 to-cyan-500',
    secondary: 'from-cyan-400 to-sky-500',
    accent: 'from-teal-600 to-cyan-600',
    glow: 'from-teal-500/30',
  },
  // Yellow/Orange - Energy
  {
    primary: 'from-yellow-500 to-orange-500',
    secondary: 'from-orange-400 to-amber-500',
    accent: 'from-yellow-600 to-orange-600',
    glow: 'from-yellow-500/30',
  },
]

export function getColorPalette(index: number): ColorPalette {
  return videoColorPalettes[index % videoColorPalettes.length]
}
