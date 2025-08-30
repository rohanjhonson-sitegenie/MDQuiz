import { useMemo } from 'react'
import { DEFAULT_VIEW_CONFIG } from '../constants/calendar.constants'
import type {
  WeekViewReturn,
  ViewConfig,
  TimeSlot,
} from '../types/calendar.types'
import {
  getWeekDays,
  getVisibleDateRange,
  createTimeSlotDate,
  isBusinessHour,
} from '../utils/date-utils'

export function useWeekView(
  date: Date,
  config: Partial<ViewConfig> = {}
): WeekViewReturn {
  const viewConfig = useMemo(
    () => ({ ...DEFAULT_VIEW_CONFIG, ...config }),
    [config]
  )

  const days = useMemo(
    () => getWeekDays(date, viewConfig.weekStartsOn),
    [date, viewConfig.weekStartsOn]
  )

  const timeSlots = useMemo(() => {
    const slots: TimeSlot[] = []
    const { minHour, maxHour, slotDuration, businessHours } = viewConfig

    // Calculate number of slots per hour
    const slotsPerHour = 60 / slotDuration

    for (let hour = minHour; hour < maxHour; hour++) {
      for (let slotIndex = 0; slotIndex < slotsPerHour; slotIndex++) {
        const minute = slotIndex * slotDuration
        const time = createTimeSlotDate(date, hour, minute)

        slots.push({
          time,
          hour,
          minute,
          isBusinessHour: isBusinessHour(hour, businessHours),
        })
      }
    }

    return slots
  }, [date, viewConfig])

  const visibleRange = useMemo(
    () => getVisibleDateRange(date, 'week', viewConfig.weekStartsOn),
    [date, viewConfig.weekStartsOn]
  )

  return {
    days,
    timeSlots,
    visibleRange,
  }
}
