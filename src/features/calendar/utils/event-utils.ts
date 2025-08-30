import {
  isSameDay,
  differenceInMinutes,
  startOfDay,
  isWithinInterval,
} from 'date-fns'
import { EVENT_SPACING } from '../constants/calendar.constants'
import type { CalendarEvent, EventPosition } from '../types/calendar.types'
import { createEventClusters } from './event-clustering'

// Check if two events overlap in time
export function eventsOverlap(
  event1: CalendarEvent,
  event2: CalendarEvent
): boolean {
  return (
    (event1.start < event2.end && event1.end > event2.start) ||
    (event2.start < event1.end && event2.end > event1.start)
  )
}

// Get events that occur on a specific date
export function getEventsForDate<T extends CalendarEvent>(
  events: T[],
  date: Date
): T[] {
  return events.filter((event) => {
    // Check if event starts, ends, or spans across this date
    const dayStart = startOfDay(date)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    return (
      isSameDay(event.start, date) ||
      isSameDay(event.end, date) ||
      isWithinInterval(date, { start: event.start, end: event.end })
    )
  })
}

// Calculate event columns to prevent overlaps (for day/week views)
export function calculateEventColumns<T extends CalendarEvent>(
  events: T[]
): Map<T, { column: number; totalColumns: number }> {
  const result = new Map<T, { column: number; totalColumns: number }>()

  if (events.length === 0) return result

  // Create clusters of overlapping events
  const clusters = createEventClusters(events)

  // Process each cluster independently
  clusters.forEach((cluster) => {
    // All events in a cluster get the same totalColumns value
    cluster.events.forEach((event) => {
      const column = cluster.columnAssignments.get(event) ?? 0
      result.set(event, {
        column,
        totalColumns: cluster.maxConcurrentEvents,
      })
    })
  })

  return result
}

// Calculate event position for time-based views (day/week)
export function calculateTimeEventPosition(
  event: CalendarEvent,
  dayStart: Date,
  minHour: number,
  maxHour: number,
  column: number = 0,
  totalColumns: number = 1
): EventPosition {
  const startMinutes = differenceInMinutes(event.start, dayStart)
  const durationMinutes = differenceInMinutes(event.end, event.start)

  const totalMinutes = (maxHour - minHour) * 60
  const offsetMinutes = minHour * 60

  const top = ((startMinutes - offsetMinutes) / totalMinutes) * 100
  const height = (durationMinutes / totalMinutes) * 100

  // Calculate width and left position based on columns
  // Use equal width for all columns
  const columnWidth = 100 / totalColumns
  const left = column * columnWidth

  return {
    top: Math.max(0, top),
    height: Math.max(1, height), // Minimum 1% height
    left,
    width: columnWidth,
    column,
    zIndex: column + 1,
  }
}

// Calculate event position for month view
export function calculateMonthEventPosition(
  eventIndex: number,
  _totalEvents: number,
  maxEventsPerCell: number = 3
): EventPosition | null {
  if (eventIndex >= maxEventsPerCell) {
    return null // Don't show, will be in "+X more" indicator
  }

  const eventHeight = 20 // pixels
  const eventSpacing = 2 // pixels
  const top = eventIndex * (eventHeight + eventSpacing) + 25 // offset for date number

  return {
    top,
    left: EVENT_SPACING,
    width: 100 - EVENT_SPACING * 2,
    height: eventHeight,
    zIndex: 1,
  }
}
