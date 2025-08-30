import { cn } from '@/lib/utils'
import { useEventPositioning } from '../hooks/useEventPositioning'
import { useWeekView } from '../hooks/useWeekView'
import type { CalendarEventExtended } from '../types/calendar.types'
import { formatTime, getDayName } from '../utils/date-utils'
import { isAllDayEvent } from '../utils/event-helpers'
import { AllDayEventsSection } from './AllDayEventsSection'
import { CalendarEvent } from './CalendarEvent'

interface WeekCalendarProps {
  currentDate: Date
  events?: CalendarEventExtended[]
}

export function WeekCalendarView({
  currentDate,
  events = [],
}: WeekCalendarProps) {
  const { days, timeSlots } = useWeekView(currentDate, {
    minHour: 8,
    maxHour: 20,
    slotDuration: 30,
  })

  // Separate regular events (all-day events are handled by AllDayEventsSection)
  const regularEvents = events.filter((event) => !isAllDayEvent(event))

  // Only position regular events in the time grid
  const eventPositions = useEventPositioning(regularEvents, 'week')

  return (
    <div className='w-full'>
      {/* Calendar Grid */}
      <div className='border-border overflow-hidden rounded-lg border'>
        <div
          className='bg-background grid'
          style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}
        >
          {/* Time column header */}
          <div className='border-border bg-muted/30 border-r border-b p-2'></div>

          {/* Day headers */}
          {days.map((day, index) => (
            <div
              key={index}
              className={cn(
                'border-border bg-muted/30 border-r border-b p-2 text-center',
                index === days.length - 1 && 'border-r-0'
              )}
            >
              <div className='text-foreground font-medium'>
                {getDayName(day.date, 'short')}
              </div>
              <div
                className={cn(
                  'text-sm',
                  day.isToday && 'text-primary font-semibold'
                )}
              >
                {day.date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* All-day events section */}
        <AllDayEventsSection events={events} variant='week' days={days} />

        {/* Time slots */}
        <div className='relative'>
          {timeSlots.map((slot, slotIndex) => (
            <div
              key={slotIndex}
              className='grid'
              style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}
            >
              {/* Time label */}
              <div
                className='border-border text-muted-foreground border-r border-solid px-2 py-1 text-right text-xs font-medium'
                style={{
                  borderBottom: '1px',
                  borderBottomStyle: slot.minute === 0 ? 'solid' : 'dashed',
                  borderBottomColor: 'var(--border)',
                }}
              >
                {slot.minute === 0 && formatTime(slot.time)}
              </div>

              {/* Day columns */}
              {days.map((day, dayIndex) => {
                const slotEvents = eventPositions.getEventsInTimeSlot(
                  day.date,
                  slot.hour,
                  slot.minute
                )

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      'border-border relative h-8 border-r border-solid',
                      dayIndex === days.length - 1 && 'border-r-0',
                      !slot.isBusinessHour && 'bg-muted/20'
                    )}
                    style={{
                      borderBottom: '1px',
                      borderBottomStyle: slot.minute === 0 ? 'solid' : 'dashed',
                      borderBottomColor: 'var(--border)',
                    }}
                  >
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

                        // Calculate positioning within the day column
                        const slotHeight = 30 // Height of each 30-minute slot in pixels
                        const pixelsPerMinute = slotHeight / 30

                        // Calculate top position within the current slot
                        const minutesFromSlotStart =
                          event.start.getMinutes() - slot.minute
                        const topOffset = minutesFromSlotStart * pixelsPerMinute

                        // Calculate height based on duration but cap it to not exceed visible area
                        const durationMinutes =
                          (event.end.getTime() - event.start.getTime()) /
                          (1000 * 60)
                        // Calculate how many minutes from event start to end of visible area (8pm = 20:00)
                        const minutesToEndOfDay =
                          20 * 60 -
                          (event.start.getHours() * 60 +
                            event.start.getMinutes())
                        const effectiveDuration = Math.min(
                          durationMinutes,
                          minutesToEndOfDay
                        )
                        const eventHeight =
                          effectiveDuration * pixelsPerMinute - 3 // 3px gap

                        // Calculate pixel gaps for equal spacing
                        const gapSize = 1 // 1px gap between events
                        const leftGap = (position.column ?? 0) * gapSize
                        const rightGap = gapSize
                        const totalGaps = leftGap + rightGap

                        return (
                          <CalendarEvent
                            key={event.id}
                            event={event}
                            variant='week'
                            className='absolute overflow-hidden'
                            style={{
                              top: `${topOffset}px`,
                              height: `${Math.max(eventHeight, 20)}px`, // Minimum height of 20px
                              left: `calc(${position.left}% + ${leftGap}px)`,
                              width: `calc(${position.width}% - ${totalGaps}px)`,
                              zIndex: position.zIndex,
                            }}
                          />
                        )
                      })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
