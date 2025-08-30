import type { CalendarEvent } from '../types/calendar.types'

/**
 * Check if an event is an all-day event
 * An event is considered all-day if it starts at midnight and ends at 11:59 PM or midnight the next day
 */
export function isAllDayEvent(event: CalendarEvent): boolean {
  const startHour = event.start.getHours()
  const startMinute = event.start.getMinutes()
  const endHour = event.end.getHours()
  const endMinute = event.end.getMinutes()

  return (
    startHour === 0 &&
    startMinute === 0 &&
    ((endHour === 23 && endMinute === 59) || (endHour === 0 && endMinute === 0))
  )
}

/**
 * Convert a hex color to a lighter version for backgrounds
 * @param color - Hex color string (e.g., '#3B82F6')
 * @param isDarkMode - Whether dark mode is active
 * @returns RGB color string (opaque)
 */
export function getLightColor(
  color: string,
  isDarkMode: boolean = false
): string {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  if (isDarkMode) {
    // In dark mode, create a very dark version with hint of the original color
    const factor = 0.15 // Much darker
    const baseGray = 30 // Base dark gray
    const darkR = Math.round(baseGray + (r - baseGray) * factor)
    const darkG = Math.round(baseGray + (g - baseGray) * factor)
    const darkB = Math.round(baseGray + (b - baseGray) * factor)
    return `rgb(${darkR}, ${darkG}, ${darkB})`
  } else {
    // In light mode, lighten the color
    const factor = 0.15
    const lightR = Math.round(r * factor + 255 * (1 - factor))
    const lightG = Math.round(g * factor + 255 * (1 - factor))
    const lightB = Math.round(b * factor + 255 * (1 - factor))
    return `rgb(${lightR}, ${lightG}, ${lightB})`
  }
}

/**
 * Get a color with proper contrast for text on light backgrounds
 * @param color - Hex color string
 * @param lightness - How light the background is (0-1)
 * @returns Hex color string
 */
export function getContrastColor(
  color: string,
  lightness: number = 0.9
): string {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Darken the color for better contrast on light backgrounds
  const factor = 1 - lightness
  const darkR = Math.round(r * factor)
  const darkG = Math.round(g * factor)
  const darkB = Math.round(b * factor)

  return `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`
}

/**
 * Default event color if none is provided
 */
export const DEFAULT_EVENT_COLOR = '#3B82F6'
