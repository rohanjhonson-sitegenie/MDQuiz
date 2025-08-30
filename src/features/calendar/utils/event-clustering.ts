import type { CalendarEvent } from '../types/calendar.types'
import { eventsOverlap } from './event-utils'

export interface EventCluster<T extends CalendarEvent> {
  events: T[]
  maxConcurrentEvents: number
  columnAssignments: Map<T, number>
}

/**
 * Groups overlapping events into clusters where all events in a cluster
 * potentially overlap with at least one other event in the cluster.
 * This ensures consistent width allocation within each cluster.
 */
export function createEventClusters<T extends CalendarEvent>(
  events: T[]
): EventCluster<T>[] {
  if (events.length === 0) return []

  // Sort events by start time, then by duration (longer events first)
  const sortedEvents = [...events].sort((a, b) => {
    const startDiff = a.start.getTime() - b.start.getTime()
    if (startDiff !== 0) return startDiff

    const durationA = a.end.getTime() - a.start.getTime()
    const durationB = b.end.getTime() - b.start.getTime()
    return durationB - durationA
  })

  const clusters: EventCluster<T>[] = []
  const processedEvents = new Set<T>()

  // Build clusters of overlapping events
  sortedEvents.forEach((event) => {
    if (processedEvents.has(event)) return

    // Start a new cluster with this event
    const cluster = new Set<T>([event])
    processedEvents.add(event)

    // Find all events that overlap with any event in the cluster
    let clusterChanged = true
    while (clusterChanged) {
      clusterChanged = false

      sortedEvents.forEach((candidateEvent) => {
        if (processedEvents.has(candidateEvent)) return

        // Check if this event overlaps with any event in the current cluster
        const overlapsWithCluster = Array.from(cluster).some((clusterEvent) =>
          eventsOverlap(clusterEvent, candidateEvent)
        )

        if (overlapsWithCluster) {
          cluster.add(candidateEvent)
          processedEvents.add(candidateEvent)
          clusterChanged = true
        }
      })
    }

    // Convert the cluster set to an array and create the cluster object
    const clusterEvents = Array.from(cluster).sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    )

    // Assign columns within this cluster
    const columnAssignments = assignColumnsInCluster(clusterEvents)
    const maxColumns = Math.max(...Array.from(columnAssignments.values())) + 1

    clusters.push({
      events: clusterEvents,
      maxConcurrentEvents: maxColumns,
      columnAssignments,
    })
  })

  return clusters
}

/**
 * Assigns columns to events within a cluster using a greedy algorithm.
 * Events are placed in the first available column where they don't overlap.
 */
function assignColumnsInCluster<T extends CalendarEvent>(
  events: T[]
): Map<T, number> {
  const columnAssignments = new Map<T, number>()
  const columns: T[][] = []

  events.forEach((event) => {
    let placed = false

    // Try to place in existing column
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i]

      // Check if event overlaps with ANY event in this column
      const hasOverlap = column.some((e) => eventsOverlap(e, event))

      if (!hasOverlap) {
        column.push(event)
        columnAssignments.set(event, i)
        placed = true
        break
      }
    }

    // Create new column if needed
    if (!placed) {
      const newColumnIndex = columns.length
      columns.push([event])
      columnAssignments.set(event, newColumnIndex)
    }
  })

  return columnAssignments
}
