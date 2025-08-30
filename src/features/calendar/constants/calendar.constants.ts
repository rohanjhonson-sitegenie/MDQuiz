export const DAYS_IN_WEEK = 7
export const WEEKS_TO_DISPLAY = 6 // Standard calendar shows 6 weeks

export const DEFAULT_VIEW_CONFIG = {
  weekStartsOn: 0 as const, // Sunday
  showWeekNumbers: false,
  showWeekends: true,
  minHour: 0,
  maxHour: 24,
  slotDuration: 30, // 30 minutes
  businessHours: {
    start: 9,
    end: 17,
  },
}

export const HOUR_FORMAT_24 = 'HH:mm'
export const HOUR_FORMAT_12 = 'h:mm a'

// Day indices
export const DAY_INDICES = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const

// For event positioning
export const EVENT_SPACING = 2 // percentage
export const EVENT_MIN_HEIGHT = 20 // pixels
export const ALL_DAY_EVENT_HEIGHT = 24 // pixels

// Time slot heights
export const PIXELS_PER_HOUR = 60
export const MIN_SLOT_HEIGHT = 20
