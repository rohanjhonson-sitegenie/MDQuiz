import { useMemo } from 'react'
import { startOfDay, isSameDay } from 'date-fns'
import { DEFAULT_VIEW_CONFIG } from '../constants/calendar.constants'
import type {
  CalendarEvent,
  EventPosition,
  EventPositionMap,
  ViewType,
  ViewConfig,
} from '../types/calendar.types'
import {
  getEventsForDate,
  calculateEventColumns,
  calculateTimeEventPosition,
  calculateMonthEventPosition,
} from '../utils/event-utils'

export function useEventPositioning<T extends CalendarEvent>(
  events: T[],
  viewType: ViewType,
  viewConfig: Partial<ViewConfig> = {}
): EventPositionMap<T> {
  const config = { ...DEFAULT_VIEW_CONFIG, ...viewConfig }

  const positionMap = useMemo(() => {
    const positions = new Map<T, EventPosition>()

    if (viewType === 'list') {
      // List view doesn't need positioning
      return positions
    }

    if (viewType === 'month') {
      // Group events by date for month view
      const eventsByDate = new Map<string, T[]>()

      events.forEach((event) => {
        const dateKey = startOfDay(event.start).toISOString()
        if (!eventsByDate.has(dateKey)) {
          eventsByDate.set(dateKey, [])
        }
        eventsByDate.get(dateKey)!.push(event)
      })

      // Calculate positions for each date's events
      eventsByDate.forEach((dateEvents) => {
        dateEvents.forEach((event, index) => {
          const position = calculateMonthEventPosition(index, dateEvents.length)
          if (position) {
            positions.set(event, position)
          }
        })
      })
    } else {
      // Day and week views need column-based positioning
      const eventColumns = calculateEventColumns(events)

      events.forEach((event) => {
        const columnInfo = eventColumns.get(event)
        if (!columnInfo) return

        const dayStart = startOfDay(event.start)
        const position = calculateTimeEventPosition(
          event,
          dayStart,
          config.minHour,
          config.maxHour,
          columnInfo.column,
          columnInfo.totalColumns
        )

        positions.set(event, position)
      })
    }

    return positions
  }, [events, viewType, config.minHour, config.maxHour])

  // Create the EventPositionMap interface implementation
  const map: EventPositionMap<T> = {
    get(event: T): EventPosition | undefined {
      return positionMap.get(event)
    },

    getEventsInCell(date: Date): T[] {
      return getEventsForDate(events, date)
    },

    getEventsInTimeSlot(date: Date, hour: number, minute: number): T[] {
      const slotStart = new Date(date)
      slotStart.setHours(hour, minute, 0, 0)

      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + config.slotDuration)

      return events.filter((event) => {
        // Check if event overlaps with this time slot
        return (
          isSameDay(event.start, date) &&
          event.start < slotEnd &&
          event.end > slotStart
        )
      })
    },
  }

  return map
}
