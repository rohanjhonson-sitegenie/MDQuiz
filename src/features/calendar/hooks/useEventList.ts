import { useMemo } from 'react'
import { startOfDay, isWithinInterval } from 'date-fns'
import type {
  CalendarEvent,
  EventGroup,
  DateRange,
} from '../types/calendar.types'

interface UseEventListOptions {
  groupBy?: 'day' | 'none'
  sortOrder?: 'asc' | 'desc'
  filterRange?: DateRange
}

export function useEventList<T extends CalendarEvent>(
  events: T[],
  options: UseEventListOptions = {}
): {
  groups: EventGroup<T>[]
  flatEvents: T[]
} {
  const { groupBy = 'day', sortOrder = 'asc', filterRange } = options

  const filteredAndSortedEvents = useMemo(() => {
    // Filter events by range if provided
    let filtered = events
    if (filterRange) {
      filtered = events.filter(
        (event) =>
          isWithinInterval(event.start, {
            start: filterRange.start,
            end: filterRange.end,
          }) ||
          isWithinInterval(event.end, {
            start: filterRange.start,
            end: filterRange.end,
          })
      )
    }

    // Sort events
    return [...filtered].sort((a, b) => {
      const diff = a.start.getTime() - b.start.getTime()
      return sortOrder === 'asc' ? diff : -diff
    })
  }, [events, filterRange, sortOrder])

  const groups = useMemo(() => {
    if (groupBy === 'none') {
      return []
    }

    const groupMap = new Map<string, T[]>()

    filteredAndSortedEvents.forEach((event) => {
      const dayKey = startOfDay(event.start).toISOString()

      if (!groupMap.has(dayKey)) {
        groupMap.set(dayKey, [])
      }

      groupMap.get(dayKey)!.push(event)
    })

    // Convert map to array and sort by date
    const groupArray = Array.from(groupMap.entries()).map(
      ([dateStr, events]) => ({
        date: new Date(dateStr),
        events,
      })
    )

    groupArray.sort((a, b) => {
      const diff = a.date.getTime() - b.date.getTime()
      return sortOrder === 'asc' ? diff : -diff
    })

    return groupArray
  }, [filteredAndSortedEvents, groupBy, sortOrder])

  return {
    groups,
    flatEvents: filteredAndSortedEvents,
  }
}
