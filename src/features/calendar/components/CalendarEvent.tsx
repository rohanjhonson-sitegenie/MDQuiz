import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'
import type { CalendarEventExtended } from '../types/calendar.types'
import { formatTime } from '../utils/date-utils'
import {
  getLightColor,
  DEFAULT_EVENT_COLOR,
  isAllDayEvent,
} from '../utils/event-helpers'
import { CalendarTooltipContent } from './CalendarTooltip'

export interface CalendarEventProps {
  event: CalendarEventExtended
  variant?: 'month' | 'week' | 'day' | 'agenda' | 'allDay'
  showTime?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: (event: CalendarEventExtended) => void
}

export const CalendarEvent = React.memo(function CalendarEvent({
  event,
  variant = 'month',
  showTime = true,
  className,
  style,
  onClick,
}: CalendarEventProps) {
  const isAllDay = event.isAllDay ?? isAllDayEvent(event)
  const eventColor = event.color || DEFAULT_EVENT_COLOR
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    // Create observer to watch for class changes on the html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'))
        }
      })
    })

    // Start observing
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    // Cleanup
    return () => observer.disconnect()
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(event)
  }

  const getEventContent = () => {
    switch (variant) {
      case 'month':
        return <div className='truncate px-1 py-0.5 text-xs'>{event.title}</div>

      case 'week':
        return (
          <>
            <div className='text-foreground truncate font-medium'>
              {event.title}
            </div>
            {showTime && !isAllDay && (
              <div className='text-muted-foreground text-[10px]'>
                {formatTime(event.start)}
              </div>
            )}
          </>
        )

      case 'day':
        return (
          <div className='flex h-full'>
            <div
              className='w-1 flex-shrink-0'
              style={{ backgroundColor: eventColor }}
            />
            <div className='flex-1 overflow-hidden px-2 py-1'>
              <div className='text-foreground truncate text-sm font-medium'>
                {event.title}
              </div>
              {showTime && !isAllDay && (
                <div className='text-muted-foreground truncate text-xs'>
                  {formatTime(event.start)} - {formatTime(event.end)}
                </div>
              )}
              {event.description && (
                <div className='text-muted-foreground/80 mt-1 truncate text-xs'>
                  {event.description}
                </div>
              )}
            </div>
          </div>
        )

      case 'allDay':
        return (
          <div className='truncate px-2 py-1 text-xs font-medium'>
            {event.title}
          </div>
        )

      case 'agenda':
        return (
          <div className='flex items-center gap-3 p-3'>
            <div
              className='h-12 w-1 flex-shrink-0 rounded-full'
              style={{ backgroundColor: eventColor }}
            />
            <div className='min-w-0 flex-1'>
              <h5 className='truncate font-medium'>{event.title}</h5>
              <p className='text-muted-foreground text-sm'>
                {isAllDay
                  ? 'All Day'
                  : `${formatTime(event.start)} - ${formatTime(event.end)}`}
              </p>
              {event.description && (
                <p className='text-muted-foreground mt-1 truncate text-sm'>
                  {event.description}
                </p>
              )}
            </div>
          </div>
        )

      default:
        return event.title
    }
  }

  const getEventStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      ...style,
    }

    switch (variant) {
      case 'month':
        return {
          ...baseStyles,
          backgroundColor: event.color
            ? `${event.color}20`
            : 'rgb(var(--informative) / 0.1)',
          color: event.color || 'rgb(var(--informative))',
        }

      case 'week':
        return {
          ...baseStyles,
          backgroundColor: getLightColor(eventColor, isDarkMode),
          borderLeft: `3px solid ${eventColor}`,
        }

      case 'day':
        return {
          ...baseStyles,
          backgroundColor: getLightColor(eventColor, isDarkMode),
        }

      case 'allDay':
        return {
          ...baseStyles,
          backgroundColor: isDarkMode
            ? getLightColor(eventColor, isDarkMode)
            : eventColor,
          color: isDarkMode ? eventColor : 'white',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: isDarkMode ? eventColor : 'transparent',
        }

      case 'agenda':
        return baseStyles

      default:
        return baseStyles
    }
  }

  const eventElement = (
    <div
      className={cn(
        'cursor-pointer transition-all',
        variant === 'month' && 'rounded hover:opacity-80',
        variant === 'week' && 'h-full rounded px-1 py-0.5 text-xs',
        variant === 'day' &&
          'overflow-hidden rounded-md shadow-sm hover:shadow-md',
        variant === 'allDay' && 'rounded-md hover:opacity-90',
        variant === 'agenda' && 'bg-card hover:bg-accent/50 rounded-lg border',
        className
      )}
      style={getEventStyles()}
      onClick={handleClick}
    >
      {getEventContent()}
    </div>
  )

  if (variant === 'agenda') {
    return eventElement
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{eventElement}</TooltipTrigger>
      <CalendarTooltipContent
        side={variant === 'day' ? 'right' : 'top'}
        align={variant === 'day' ? 'start' : 'center'}
        sideOffset={4}
      >
        <div className='space-y-1'>
          <div className='font-semibold'>{event.title}</div>
          <div className='text-muted-foreground text-xs'>
            {isAllDay
              ? 'All Day'
              : `${formatTime(event.start)} - ${formatTime(event.end)}`}
          </div>
          {event.description && (
            <div className='text-muted-foreground border-t pt-1 text-xs'>
              {event.description}
            </div>
          )}
          {variant === 'day' && !isAllDay && (
            <div className='text-muted-foreground/80 pt-1 text-xs'>
              Duration:{' '}
              {Math.round(
                (event.end.getTime() - event.start.getTime()) / (1000 * 60)
              )}{' '}
              minutes
            </div>
          )}
        </div>
      </CalendarTooltipContent>
    </Tooltip>
  )
})
