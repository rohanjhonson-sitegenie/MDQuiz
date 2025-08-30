import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday as isTodayFns,
  isWeekend as isWeekendFns,
  addMonths,
  addWeeks,
  addDays,
  addYears,
  subMonths,
  subWeeks,
  subDays,
  subYears,
  getWeek,
  setHours,
  setMinutes,
  startOfDay,
  endOfDay,
  format,
} from 'date-fns'
import { DAYS_IN_WEEK, WEEKS_TO_DISPLAY } from '../constants/calendar.constants'
import type { CalendarCell, DateRange } from '../types/calendar.types'

export function isToday(date: Date): boolean {
  return isTodayFns(date)
}

export function isWeekend(date: Date): boolean {
  return isWeekendFns(date)
}

export function isSameDayAs(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2)
}

export function getMonthGrid(
  date: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0,
  forceSixWeeks = true
): CalendarCell[][] {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  const startDate = startOfWeek(start, { weekStartsOn })
  let endDate = endOfWeek(end, { weekStartsOn })

  // Ensure we always show 6 weeks if requested
  if (forceSixWeeks) {
    const totalDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    }).length
    const weeksShown = Math.ceil(totalDays / DAYS_IN_WEEK)

    if (weeksShown < WEEKS_TO_DISPLAY) {
      endDate = addDays(endDate, (WEEKS_TO_DISPLAY - weeksShown) * DAYS_IN_WEEK)
    }
  }

  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const weeks: CalendarCell[][] = []

  for (let i = 0; i < days.length; i += DAYS_IN_WEEK) {
    const week = days.slice(i, i + DAYS_IN_WEEK).map((day) => ({
      date: day,
      isToday: isToday(day),
      isWeekend: isWeekend(day),
      isCurrentMonth: isSameMonth(day, date),
      isSelected: false,
    }))
    weeks.push(week)
  }

  return weeks
}

export function getWeekDays(
  date: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0
): CalendarCell[] {
  const start = startOfWeek(date, { weekStartsOn })
  const end = endOfWeek(date, { weekStartsOn })

  return eachDayOfInterval({ start, end }).map((day) => ({
    date: day,
    isToday: isToday(day),
    isWeekend: isWeekend(day),
    isCurrentMonth: true, // Week view doesn't care about month boundaries
    isSelected: false,
  }))
}

export function getVisibleDateRange(
  date: Date,
  viewType: 'month' | 'week' | 'day',
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0
): DateRange {
  switch (viewType) {
    case 'month': {
      const start = startOfWeek(startOfMonth(date), { weekStartsOn })
      const end = endOfWeek(endOfMonth(date), { weekStartsOn })
      // Ensure 6 weeks
      const totalDays = eachDayOfInterval({ start, end }).length
      const weeksShown = Math.ceil(totalDays / DAYS_IN_WEEK)
      if (weeksShown < WEEKS_TO_DISPLAY) {
        return {
          start,
          end: addDays(end, (WEEKS_TO_DISPLAY - weeksShown) * DAYS_IN_WEEK),
        }
      }
      return { start, end }
    }
    case 'week':
      return {
        start: startOfWeek(date, { weekStartsOn }),
        end: endOfWeek(date, { weekStartsOn }),
      }
    case 'day':
      return {
        start: startOfDay(date),
        end: endOfDay(date),
      }
  }
}

export function navigateDate(
  currentDate: Date,
  direction: 'next' | 'previous',
  viewType: 'month' | 'week' | 'day' | 'list' | 'year'
): Date {
  const isNext = direction === 'next'

  switch (viewType) {
    case 'year':
      return isNext ? addYears(currentDate, 1) : subYears(currentDate, 1)
    case 'month':
      return isNext ? addMonths(currentDate, 1) : subMonths(currentDate, 1)
    case 'week':
      return isNext ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1)
    case 'day':
    case 'list': // List view navigates by day
      return isNext ? addDays(currentDate, 1) : subDays(currentDate, 1)
  }
}

export function getWeekNumber(date: Date): number {
  return getWeek(date)
}

export function createTimeSlotDate(
  baseDate: Date,
  hour: number,
  minute: number
): Date {
  return setMinutes(setHours(startOfDay(baseDate), hour), minute)
}

export function formatTime(date: Date, use24Hour = true): string {
  return format(date, use24Hour ? 'HH:mm' : 'h:mm a')
}

export function isBusinessHour(
  hour: number,
  businessHours?: { start: number; end: number }
): boolean {
  if (!businessHours) return true
  return hour >= businessHours.start && hour < businessHours.end
}

export function getDayName(
  date: Date,
  format: 'short' | 'long' = 'short'
): string {
  return new Intl.DateTimeFormat('en-US', { weekday: format }).format(date)
}

export function getMonthName(
  date: Date,
  format: 'short' | 'long' = 'long'
): string {
  return new Intl.DateTimeFormat('en-US', { month: format }).format(date)
}
