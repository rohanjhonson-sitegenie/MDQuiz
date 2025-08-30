/**
 * Headless Calendar System
 *
 * A collection of composable hooks for building calendar interfaces.
 * This system is completely headless - it provides the logic and state management
 * without any UI components, allowing you to build custom calendar UIs.
 *
 * @example
 * ```tsx
 * import { useCalendarCore, useMonthView } from '@/features/calendar'
 *
 * function MyCalendar() {
 *   const { currentDate, next, previous } = useCalendarCore()
 *   const { weeks } = useMonthView(currentDate)
 *
 *   return (
 *     // Your custom UI here
 *   )
 * }
 * ```
 */

// Core hooks
export { useCalendarCore } from '../hooks/useCalendarCore'
export { useMonthView } from '../hooks/useMonthView'
export { useWeekView } from '../hooks/useWeekView'
export { useDayView } from '../hooks/useDayView'
export { useEventList } from '../hooks/useEventList'
export { useEventPositioning } from '../hooks/useEventPositioning'
export { useCalendarSelection } from '../hooks/useCalendarSelection'

// Types
export type {
  CalendarEvent,
  CalendarCell,
  CalendarWeek,
  TimeSlot,
  EventPosition,
  EventPositionMap,
  ViewType,
  ViewConfig,
  DateRange,
  SelectionState,
  NavigationState,
  EventGroup,
  CalendarCoreReturn,
  MonthViewReturn,
  WeekViewReturn,
  DayViewReturn,
} from '../types/calendar.types'

// Utilities (for advanced use cases)
export {
  isToday,
  isWeekend,
  isSameDayAs,
  getMonthGrid,
  getWeekDays,
  getVisibleDateRange,
  navigateDate,
  getWeekNumber,
  createTimeSlotDate,
  formatTime,
  isBusinessHour,
  getDayName,
  getMonthName,
} from '../utils/date-utils'

export {
  eventsOverlap,
  getEventsForDate,
  calculateEventColumns,
  calculateTimeEventPosition,
  calculateMonthEventPosition,
} from '../utils/event-utils'

export { eventTypeColors, getEventTypeColor } from '../utils/event-type-colors'
export type { EventType } from '../utils/event-type-colors'

// Constants
export {
  DAYS_IN_WEEK,
  WEEKS_TO_DISPLAY,
  DEFAULT_VIEW_CONFIG,
  HOUR_FORMAT_24,
  HOUR_FORMAT_12,
  DAY_INDICES,
  EVENT_SPACING,
  EVENT_MIN_HEIGHT,
  ALL_DAY_EVENT_HEIGHT,
  PIXELS_PER_HOUR,
  MIN_SLOT_HEIGHT,
} from '../constants/calendar.constants'

// Components
export { UnifiedCalendar } from '../components/UnifiedCalendar'
export { CalendarHeader } from '../components/CalendarHeader'
export { MonthCalendarView } from '../components/MonthCalendarView'
export { WeekCalendarView } from '../components/WeekCalendarView'
export { DayCalendarView } from '../components/DayCalendarView'
export { YearCalendarView } from '../components/YearCalendarView'
export type { CalendarView } from '../components/CalendarHeader'
