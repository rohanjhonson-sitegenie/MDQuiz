import { useMemo } from 'react'
import { DEFAULT_VIEW_CONFIG } from '../constants/calendar.constants'
import type {
  MonthViewReturn,
  ViewConfig,
  CalendarWeek,
} from '../types/calendar.types'
import {
  getMonthGrid,
  getVisibleDateRange,
  getWeekNumber,
} from '../utils/date-utils'

export function useMonthView(
  date: Date,
  config: Partial<ViewConfig> = {}
): MonthViewReturn {
  const viewConfig = useMemo(
    () => ({ ...DEFAULT_VIEW_CONFIG, ...config }),
    [config]
  )

  const weeks = useMemo(() => {
    const grid = getMonthGrid(date, viewConfig.weekStartsOn, true)

    return grid.map(
      (weekDays): CalendarWeek => ({
        weekNumber: getWeekNumber(weekDays[0].date),
        days: weekDays,
      })
    )
  }, [date, viewConfig.weekStartsOn])

  const visibleRange = useMemo(
    () => getVisibleDateRange(date, 'month', viewConfig.weekStartsOn),
    [date, viewConfig.weekStartsOn]
  )

  return {
    weeks,
    visibleRange,
  }
}
