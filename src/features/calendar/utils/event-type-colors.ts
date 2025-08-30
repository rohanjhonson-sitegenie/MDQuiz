// Map event types to their corresponding colors with fallbacks
export const eventTypeColors = {
  class: '#3B82F6', // Blue
  meeting: '#6B7280', // Gray
  appointment: '#2563EB', // Primary Blue
  deadline: '#EF4444', // Red
  tournament: '#F59E0B', // Amber/Yellow
  holiday: '#10B981', // Green
  personal: '#8B5CF6', // Purple
  scrimmage: '#06B6D4', // Cyan
} as const

// CSS variable version (for future use when CSS vars are working)
export const eventTypeColorsCSS = {
  class: 'hsl(var(--informative))',
  meeting: 'hsl(var(--neutral))',
  appointment: 'hsl(var(--brand))',
  deadline: 'hsl(var(--error))',
  tournament: 'hsl(var(--warning))',
  holiday: 'hsl(var(--success))',
  personal: 'hsl(var(--secondary))',
  scrimmage: 'hsl(var(--informative))',
} as const

export type EventType = keyof typeof eventTypeColors

export function getEventTypeColor(type: EventType): string {
  return eventTypeColors[type] || '#6B7280' // Gray fallback
}
