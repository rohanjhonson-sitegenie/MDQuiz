// Minimal event interface that consumers must implement
export interface CalendarEvent {
  id: string | number
  start: Date
  end: Date
}

// Extended event interface with common properties
export interface CalendarEventExtended extends CalendarEvent {
  title: string
  color?: string
  description?: string
  type?: string
  isAllDay?: boolean
}

// Grid cell representation
export interface CalendarCell {
  date: Date
  isToday: boolean
  isWeekend: boolean
  isCurrentMonth: boolean
  isSelected: boolean
}

// Week representation
export interface CalendarWeek {
  weekNumber: number
  days: CalendarCell[]
}

// Time slot for day/week views
export interface TimeSlot {
  time: Date
  hour: number
  minute: number
  isBusinessHour: boolean
}

// Event positioning data for layout
export interface EventPosition {
  top: number // percentage
  left: number // percentage
  width: number // percentage
  height: number // percentage
  column?: number // for overlapping events
  columnSpan?: number
  zIndex?: number // stacking order
}

// View types
export type ViewType = 'month' | 'week' | 'day' | 'list' | 'year'

// View configuration
export interface ViewConfig {
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
  showWeekNumbers: boolean
  showWeekends: boolean
  minHour: number // 0-23
  maxHour: number // 0-23
  slotDuration: number // minutes (15, 30, 60)
  businessHours?: {
    start: number // hour (0-23)
    end: number // hour (0-23)
  }
}

// Date range
export interface DateRange {
  start: Date
  end: Date
}

// Selection state
export interface SelectionState {
  selectedDate: Date | null
  selectedRange: DateRange | null
  selectionMode: 'single' | 'range' | 'multiple'
  selectedDates: Date[] // for multiple selection
}

// Navigation state
export interface NavigationState {
  currentDate: Date
  viewType: ViewType
}

// Event group for list view
export interface EventGroup<T extends CalendarEvent = CalendarEvent> {
  date: Date
  events: T[]
}

// Hook return types
export interface CalendarCoreReturn {
  currentDate: Date
  viewType: ViewType
  setViewType: (view: ViewType) => void
  next: () => void
  previous: () => void
  goToDate: (date: Date) => void
  goToToday: () => void
}

export interface MonthViewReturn {
  weeks: CalendarWeek[]
  visibleRange: DateRange
}

export interface WeekViewReturn {
  days: CalendarCell[]
  timeSlots: TimeSlot[]
  visibleRange: DateRange
}

export interface DayViewReturn {
  date: Date
  timeSlots: TimeSlot[]
  isToday: boolean
}

export interface EventPositionMap<T extends CalendarEvent = CalendarEvent> {
  get(event: T): EventPosition | undefined
  getEventsInCell(date: Date): T[]
  getEventsInTimeSlot(date: Date, hour: number, minute: number): T[]
}
