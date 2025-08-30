import {
  format,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from 'date-fns'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { CalendarEvent } from '../types/calendar.types'
import { getEventTypeColor, type EventType } from '../utils/event-type-colors'
import { EventTypeLegend } from '../utils/event-type-legend'
import { CalendarTooltipContent } from './CalendarTooltip'

interface YearCalendarViewProps {
  currentDate: Date
  events: (CalendarEvent & {
    title: string
    color?: string
    description?: string
    type?: EventType
  })[]
}

// Helper function to check if an event is all-day
function isAllDayEvent(event: YearCalendarViewProps['events'][0]): boolean {
  const startHour = event.start.getHours()
  const startMinute = event.start.getMinutes()
  const endHour = event.end.getHours()
  const endMinute = event.end.getMinutes()

  // Check if event starts at midnight and ends at 11:59 PM or midnight next day
  return (
    startHour === 0 &&
    startMinute === 0 &&
    ((endHour === 23 && endMinute === 59) || (endHour === 0 && endMinute === 0))
  )
}

// Helper function to get all-day events for a specific date
function getEventsForDate(date: Date, events: YearCalendarViewProps['events']) {
  return events.filter((event) => {
    // Only include all-day events
    if (!isAllDayEvent(event)) return false
    // Create new date objects to avoid mutating
    const dateStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
      0
    )
    const dateEnd = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    )

    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    // Event overlaps with this day if:
    // 1. Event starts on this day
    // 2. Event ends on this day
    // 3. Event spans across this day
    return (
      (eventStart >= dateStart && eventStart <= dateEnd) ||
      (eventEnd >= dateStart && eventEnd <= dateEnd) ||
      (eventStart <= dateStart && eventEnd >= dateEnd)
    )
  })
}

// Get unique event types for a date
function getEventTypesForDate(
  date: Date,
  events: YearCalendarViewProps['events']
): EventType[] {
  const dayEvents = getEventsForDate(date, events)
  const types = new Set<EventType>()

  dayEvents.forEach((event) => {
    if (event.type) {
      types.add(event.type)
    }
  })

  return Array.from(types)
}

export function YearCalendarView({
  currentDate,
  events,
}: YearCalendarViewProps) {
  const year = currentDate.getFullYear()
  const yearStart = startOfYear(currentDate)
  const yearEnd = endOfYear(currentDate)
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })

  return (
    <TooltipProvider>
      <div className='w-full'>
        <div className='mb-6 text-center'>
          <h2 className='text-2xl font-bold'>{year}</h2>
          <p className='text-muted-foreground text-sm'>
            All-day events overview
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {months.map((month) => {
            const monthStart = startOfMonth(month)
            const monthEnd = endOfMonth(month)
            const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

            // Get the first day of the week for the month
            const firstDayOfWeek = monthStart.getDay()

            return (
              <div
                key={month.toISOString()}
                className='bg-card rounded-lg border p-3'
              >
                <h3 className='mb-2 text-center text-sm font-semibold'>
                  {format(month, 'MMMM')}
                </h3>

                {/* Weekday headers */}
                <div className='mb-1 grid grid-cols-7 gap-0.5'>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div
                      key={i}
                      className='text-muted-foreground text-center text-xs font-medium'
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className='grid grid-cols-7 gap-0.5'>
                  {/* Empty cells for alignment */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className='aspect-square' />
                  ))}

                  {/* Days of the month */}
                  {days.map((day) => {
                    const dayEvents = getEventsForDate(day, events)
                    const eventTypes = getEventTypesForDate(day, events)
                    const hasEvents = dayEvents.length > 0
                    const isCurrentDay = isToday(day)

                    const cellContent = (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          'relative flex aspect-square flex-col items-center justify-center rounded p-0.5 text-xs',
                          'hover:bg-accent hover:text-accent-foreground transition-colors',
                          isCurrentDay &&
                            'bg-primary text-primary-foreground font-bold',
                          !isSameMonth(day, month) &&
                            'text-muted-foreground opacity-50',
                          hasEvents && 'cursor-pointer'
                        )}
                      >
                        <span
                          className={cn(
                            'text-xs leading-none font-medium',
                            isCurrentDay && 'underline underline-offset-2'
                          )}
                        >
                          {format(day, 'd')}
                        </span>
                        {hasEvents && (
                          <div className='absolute right-0 bottom-0.5 left-0 flex justify-center gap-0.5 px-1'>
                            {eventTypes.length > 0
                              ? eventTypes.slice(0, 4).map((type, idx) => (
                                  <div
                                    key={`${day.toISOString()}-${type}-${idx}`}
                                    className='size-1 flex-shrink-0 rounded-full'
                                    style={{
                                      backgroundColor: getEventTypeColor(type),
                                    }}
                                  />
                                ))
                              : // Fallback: use event colors if no types
                                dayEvents.slice(0, 4).map((event, idx) => (
                                  <div
                                    key={`${day.toISOString()}-color-${idx}`}
                                    className='size-1 flex-shrink-0 rounded-full'
                                    style={{
                                      backgroundColor: event.color || '#6B7280',
                                    }}
                                  />
                                ))}
                            {Math.max(eventTypes.length, dayEvents.length) >
                              4 && (
                              <div className='bg-muted-foreground/60 size-1 flex-shrink-0 rounded-full' />
                            )}
                          </div>
                        )}
                      </div>
                    )

                    if (hasEvents) {
                      return (
                        <Tooltip key={day.toISOString()}>
                          <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
                          <CalendarTooltipContent>
                            <div className='space-y-1'>
                              <p className='text-sm font-semibold'>
                                {format(day, 'MMMM d, yyyy')}
                              </p>
                              {dayEvents.map((event) => (
                                <div
                                  key={event.id}
                                  className='flex items-center gap-1.5 text-xs'
                                >
                                  <span
                                    className='inline-block size-2 flex-shrink-0 rounded-full'
                                    style={{
                                      backgroundColor: event.type
                                        ? getEventTypeColor(event.type)
                                        : '#6B7280',
                                    }}
                                  />
                                  <span className='truncate'>
                                    {event.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CalendarTooltipContent>
                        </Tooltip>
                      )
                    }

                    return cellContent
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className='mt-6 space-y-2'>
          <p className='text-center text-sm font-medium'>Event Types</p>
          <EventTypeLegend />
        </div>
      </div>
    </TooltipProvider>
  )
}
