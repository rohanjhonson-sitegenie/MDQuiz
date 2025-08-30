import { cn } from '@/lib/utils'
import { useCalendarSelection } from '../hooks/useCalendarSelection'
import { useEventPositioning } from '../hooks/useEventPositioning'
import { useMonthView } from '../hooks/useMonthView'
import type { CalendarEventExtended } from '../types/calendar.types'
import { getDayName } from '../utils/date-utils'
import { CalendarEvent } from './CalendarEvent'

interface MonthCalendarProps {
  currentDate: Date
  events?: CalendarEventExtended[]
  onDateSelect?: (date: Date) => void
}

export function MonthCalendarView({
  currentDate,
  events = [],
  onDateSelect,
}: MonthCalendarProps) {
  const { weeks } = useMonthView(currentDate)
  const { isDateSelected, selectDate } = useCalendarSelection({
    mode: 'single',
    onDateSelect,
  })
  const eventPositions = useEventPositioning(events, 'month')

  const weekDays =
    weeks[0]?.days.map((day) => getDayName(day.date, 'short')) || []

  return (
    <div className='w-full'>
      {/* Calendar Grid */}
      <div className='border-border overflow-hidden rounded-lg border'>
        {/* Week day headers */}
        <div className='bg-muted/30 grid grid-cols-7'>
          {weekDays.map((day, index) => (
            <div
              key={index}
              className='text-foreground py-2 text-center text-sm font-medium'
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar weeks */}
        <div className='bg-background'>
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className='border-border grid grid-cols-7 border-t'
            >
              {week.days.map((day, dayIndex) => {
                const dayEvents = eventPositions.getEventsInCell(day.date)
                const isSelected = isDateSelected(day.date)

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      'border-border hover:bg-accent/50 min-h-[100px] cursor-pointer border-r p-2 transition-colors',
                      'relative',
                      dayIndex === 6 && 'border-r-0',
                      !day.isCurrentMonth &&
                        'bg-muted/20 text-muted-foreground',
                      day.isToday && 'bg-informative/10',
                      day.isWeekend && 'bg-muted/10',
                      isSelected && 'ring-informative ring-2 ring-inset'
                    )}
                    onClick={() => selectDate(day.date)}
                  >
                    <div className='flex'>
                      <div
                        className={cn(
                          'text-foreground mb-1 text-sm font-medium',
                          day.isToday &&
                            'bg-informative text-informative-foreground flex h-7 w-7 items-center justify-center rounded-full',
                          !day.isToday && 'px-1'
                        )}
                      >
                        {day.date.getDate()}
                      </div>
                    </div>

                    {/* Render events */}
                    <div className='space-y-1'>
                      {dayEvents.slice(0, 3).map((event) => {
                        const position = eventPositions.get(event)
                        if (!position) return null

                        return (
                          <CalendarEvent
                            key={event.id}
                            event={event}
                            variant='month'
                          />
                        )
                      })}
                      {dayEvents.length > 3 && (
                        <div className='text-muted-foreground text-xs font-medium'>
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
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
