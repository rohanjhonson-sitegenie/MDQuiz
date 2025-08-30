import { useDayView } from '../hooks/useDayView'
import { useEventPositioning } from '../hooks/useEventPositioning'
import type { CalendarEventExtended } from '../types/calendar.types'
import { formatTime } from '../utils/date-utils'
import { isAllDayEvent } from '../utils/event-helpers'
import { AllDayEventsSection } from './AllDayEventsSection'
import { CalendarEvent } from './CalendarEvent'

interface DayCalendarProps {
  currentDate: Date
  events?: CalendarEventExtended[]
}

export function DayCalendarView({
  currentDate,
  events = [],
}: DayCalendarProps) {
  const { date, timeSlots } = useDayView(currentDate, {
    minHour: 8,
    maxHour: 20,
    slotDuration: 30,
  })

  // Filter events for current day
  const dayEvents = events.filter((event) => {
    const eventDate = new Date(event.start)
    return eventDate.toDateString() === date.toDateString()
  })

  // Separate regular events (all-day events are handled by AllDayEventsSection)
  const regularEvents = dayEvents.filter((event) => !isAllDayEvent(event))

  // Only position regular events in the time grid
  const eventPositions = useEventPositioning(regularEvents, 'day')

  return (
    <div className='w-full'>
      {/* Calendar Grid */}
      <div className='border-border bg-background overflow-hidden rounded-lg border'>
        {/* All-day events section */}
        <AllDayEventsSection events={dayEvents} variant='day' />

        {/* Time grid */}
        <div>
          {timeSlots.map((slot, index) => {
            // Get events for this time slot
            const slotEvents = eventPositions.getEventsInTimeSlot(
              date,
              slot.hour,
              slot.minute
            )

            return (
              <div
                key={index}
                className='flex'
                style={{
                  borderBottom: '1px',
                  borderBottomStyle: slot.minute === 0 ? 'solid' : 'dashed',
                  borderBottomColor: 'var(--border)',
                  height: '32px',
                }}
              >
                {/* Time label */}
                <div className='text-muted-foreground w-20 flex-shrink-0 px-2 py-1 text-right text-xs font-medium'>
                  {slot.minute === 0 && formatTime(slot.time)}
                </div>

                {/* Event area */}
                <div className='relative flex-1'>
                  {/* Render events that start in this time slot */}
                  {slotEvents
                    .filter((event) => {
                      // Only render events that start in this specific time slot
                      const eventStartHour = event.start.getHours()
                      const eventStartMinute = event.start.getMinutes()
                      return (
                        eventStartHour === slot.hour &&
                        eventStartMinute >= slot.minute &&
                        eventStartMinute < slot.minute + 30
                      )
                    })
                    .map((event) => {
                      const position = eventPositions.get(event)
                      if (!position) return null

                      // Calculate positioning
                      const slotHeight = 32 // Height of each slot in pixels
                      const pixelsPerMinute = slotHeight / 30

                      // Calculate top position within the current slot
                      const minutesFromSlotStart =
                        event.start.getMinutes() - slot.minute
                      const topOffset = minutesFromSlotStart * pixelsPerMinute

                      // Calculate height based on duration
                      const durationMinutes =
                        (event.end.getTime() - event.start.getTime()) /
                        (1000 * 60)
                      const minutesToEndOfDay =
                        20 * 60 -
                        (event.start.getHours() * 60 + event.start.getMinutes())
                      const effectiveDuration = Math.min(
                        durationMinutes,
                        minutesToEndOfDay
                      )
                      const eventHeight =
                        effectiveDuration * pixelsPerMinute - 4 // 4px gap

                      // Calculate pixel gaps for equal spacing
                      const gapSize = 2 // 2px gap between events
                      const leftGap = (position.column ?? 0) * gapSize
                      const rightGap = gapSize
                      const totalGaps = leftGap + rightGap

                      return (
                        <CalendarEvent
                          key={event.id}
                          event={event}
                          variant='day'
                          className='absolute overflow-hidden'
                          style={{
                            top: `${topOffset}px`,
                            height: `${Math.max(eventHeight, 24)}px`, // Minimum height
                            left: `calc(${position.left}% + ${leftGap}px)`,
                            width: `calc(${position.width}% - ${totalGaps}px)`,
                            zIndex: position.zIndex,
                          }}
                        />
                      )
                    })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
