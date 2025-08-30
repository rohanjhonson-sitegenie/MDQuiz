import { useState, useCallback } from 'react'
import type { CalendarCoreReturn, ViewType } from '../types/calendar.types'
import { navigateDate } from '../utils/date-utils'

export function useCalendarCore(initialDate?: Date): CalendarCoreReturn {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date())
  const [viewType, setViewType] = useState<ViewType>('month')

  const next = useCallback(() => {
    setCurrentDate((prev) => navigateDate(prev, 'next', viewType))
  }, [viewType])

  const previous = useCallback(() => {
    setCurrentDate((prev) => navigateDate(prev, 'previous', viewType))
  }, [viewType])

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  return {
    currentDate,
    viewType,
    setViewType,
    next,
    previous,
    goToDate,
    goToToday,
  }
}
