import { useState } from 'react'
import { format } from 'date-fns'
import { useCalendarCore } from '../hooks/useCalendarCore'
import { useEventList } from '../hooks/useEventList'
import type { CalendarEventExtended } from '../types/calendar.types'
import { CalendarEvent } from './CalendarEvent'
import { CalendarHeader, type CalendarView } from './CalendarHeader'
import { DayCalendarView } from './DayCalendarView'
import { MonthCalendarView } from './MonthCalendarView'
import { WeekCalendarView } from './WeekCalendarView'
import { YearCalendarView } from './YearCalendarView'

interface UnifiedCalendarProps {
  events?: CalendarEventExtended[]
  onDateSelect?: (date: Date) => void
}

export function UnifiedCalendar({
  events = [],
  onDateSelect,
}: UnifiedCalendarProps) {
  const { currentDate, next, previous, goToToday, setViewType } =
    useCalendarCore()
  const [view, setView] = useState<CalendarView>('month')

  // Filter events for the current month
  const monthEvents = events.filter((event) => {
    const eventMonth = event.start.getMonth()
    const eventYear = event.start.getFullYear()
    return (
      eventMonth === currentDate.getMonth() &&
      eventYear === currentDate.getFullYear()
    )
  })

  const { groups: eventGroups } = useEventList(monthEvents, {
    groupBy: 'day',
    sortOrder: 'asc',
  })

  // Sync the view type with the calendar core
  const handleViewChange = (newView: CalendarView) => {
    setView(newView)
    // Update the viewType in useCalendarCore for proper navigation
    if (newView === 'day' || newView === 'week' || newView === 'month') {
      setViewType(newView)
    } else if (newView === 'agenda') {
      setViewType('month') // Agenda uses month navigation
    } else if (newView === 'year') {
      setViewType('year')
    }
  }

  const renderCalendarView = () => {
    switch (view) {
      case 'day':
        return <DayCalendarView currentDate={currentDate} events={events} />
      case 'week':
        return <WeekCalendarView currentDate={currentDate} events={events} />
      case 'month':
        return (
          <MonthCalendarView
            currentDate={currentDate}
            events={events}
            onDateSelect={onDateSelect}
          />
        )
      case 'agenda':
        // List view showing all events for the current month
        return (
          <div className='space-y-4'>
            {eventGroups.length === 0 ? (
              <div className='text-muted-foreground py-8 text-center'>
                No events scheduled for {format(currentDate, 'MMMM yyyy')}
              </div>
            ) : (
              <>
                <div className='mb-4'>
                  <h3 className='text-lg font-semibold'>
                    {format(currentDate, 'MMMM yyyy')}
                  </h3>
                  <p className='text-muted-foreground text-sm'>
                    {monthEvents.length} event
                    {monthEvents.length !== 1 ? 's' : ''} scheduled
                  </p>
                </div>
                {eventGroups.map((group) => (
                  <div key={group.date.toISOString()} className='space-y-2'>
                    <h4 className='text-muted-foreground bg-background sticky top-0 py-1 text-sm font-medium'>
                      {format(group.date, 'EEEE, MMMM d')}
                    </h4>
                    <div className='space-y-2'>
                      {group.events.map((event) => (
                        <CalendarEvent
                          key={event.id}
                          event={event}
                          variant='agenda'
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )
      case 'year':
        return (
          <YearCalendarView
            currentDate={currentDate}
            events={
              events as Array<
                CalendarEventExtended & {
                  type?: import('../utils/event-type-colors').EventType
                }
              >
            }
          />
        )
      default:
        return (
          <MonthCalendarView
            currentDate={currentDate}
            events={events}
            onDateSelect={onDateSelect}
          />
        )
    }
  }

  return (
    <div className='w-full'>
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={handleViewChange}
        onPrevious={previous}
        onNext={next}
        onToday={goToToday}
        className='mb-4'
      />

      {renderCalendarView()}
    </div>
  )
}
