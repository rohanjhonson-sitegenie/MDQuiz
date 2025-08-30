import React from 'react'
import { cn } from '@/lib/utils'
import type { CalendarEventExtended } from '../types/calendar.types'
import { isAllDayEvent } from '../utils/event-helpers'
import { CalendarEvent } from './CalendarEvent'

export interface AllDayEventsSectionProps {
  events: CalendarEventExtended[]
  variant?: 'day' | 'week'
  days?: Array<{ date: Date }> // For week view
  className?: string
  onEventClick?: (event: CalendarEventExtended) => void
}

export const AllDayEventsSection = React.memo(function AllDayEventsSection({
  events,
  variant = 'day',
  days,
  className,
  onEventClick,
}: AllDayEventsSectionProps) {
  const allDayEvents = events.filter(
    (event) => event.isAllDay ?? isAllDayEvent(event)
  )

  if (allDayEvents.length === 0) {
    return null
  }

  if (variant === 'day') {
    return (
      <div className={cn('border-border bg-muted/30 border-b', className)}>
        <div className='flex'>
          <div className='text-muted-foreground flex w-20 flex-shrink-0 items-center justify-end px-2 py-2 text-xs font-medium'>
            All Day
          </div>
          <div className='flex-1 space-y-2 p-2'>
            {allDayEvents.map((event) => (
              <CalendarEvent
                key={event.id}
                event={event}
                variant='allDay'
                onClick={onEventClick}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Week view variant
  return (
    <div
      className={cn('border-border bg-muted/30 grid border-b', className)}
      style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}
    >
      <div className='border-border text-muted-foreground flex items-center justify-end border-r p-1 pr-2 text-xs font-medium'>
        All Day
      </div>
      {(days || Array.from({ length: 7 })).map((day, dayIndex) => {
        const dayEvents = days
          ? allDayEvents.filter((event) => {
              const eventDate = new Date(event.start)
              return (
                eventDate.toDateString() ===
                (day as { date: Date }).date.toDateString()
              )
            })
          : allDayEvents.filter((event) => {
              const eventDay = event.start.getDay()
              return eventDay === dayIndex
            })

        return (
          <div
            key={dayIndex}
            className={cn(
              'border-r px-1 py-0.5',
              dayIndex === 6 && 'border-r-0'
            )}
          >
            <div className='space-y-1'>
              {dayEvents.map((event) => (
                <CalendarEvent
                  key={event.id}
                  event={event}
                  variant='allDay'
                  onClick={onEventClick}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
})
