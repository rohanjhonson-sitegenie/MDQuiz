import { ChevronLeft, ChevronRight, Calendar1 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type CalendarView = 'day' | 'week' | 'month' | 'agenda' | 'year'

interface CalendarHeaderProps {
  currentDate: Date
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  className?: string
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  className,
}: CalendarHeaderProps) {
  // Format the date display based on the current view
  const getDateDisplay = () => {
    switch (view) {
      case 'day':
        // For day view: "Monday, January 27, 2025"
        return currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      case 'week': {
        // For week view: "Jan 26 - Feb 1, 2025" or "January 26-31, 2025"
        const weekStart = new Date(currentDate)
        weekStart.setDate(currentDate.getDate() - currentDate.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)

        if (weekStart.getMonth() === weekEnd.getMonth()) {
          // Same month
          return `${weekStart.toLocaleDateString('en-US', { month: 'long' })} ${weekStart.getDate()}-${weekEnd.getDate()}, ${weekStart.getFullYear()}`
        } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
          // Different months, same year
          return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${weekStart.getFullYear()}`
        } else {
          // Different years
          return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        }
      }
      case 'month':
      case 'agenda':
        // For month/agenda view: "January 2025"
        return currentDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })
      case 'year':
        // For year view: "2025"
        return currentDate.getFullYear().toString()
      default:
        return currentDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })
    }
  }

  const dateDisplay = getDateDisplay()

  const mainViews: { value: CalendarView; label: string }[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ]

  const additionalViews: { value: CalendarView; label: string }[] = [
    { value: 'agenda', label: 'Agenda' },
    { value: 'year', label: 'Year' },
  ]

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {/* Left section: Today button and navigation */}
      <div className='flex items-center gap-2'>
        <Button variant='outline' size='sm' onClick={onToday} className='h-8'>
          <Calendar1 className='mr-1 h-3.5 w-3.5' />
          Today
        </Button>

        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onPrevious}
            className='h-8 w-8'
            aria-label='Previous'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>

          <Button
            variant='ghost'
            size='icon'
            onClick={onNext}
            className='h-8 w-8'
            aria-label='Next'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>

        <h2 className='ml-2 text-base font-medium'>{dateDisplay}</h2>
      </div>

      {/* Right section: View toggles */}
      <div className='flex items-center gap-2'>
        {/* Grouped Day/Week/Month buttons */}
        <div className='flex items-center rounded-md border'>
          {mainViews.map((v, index) => (
            <Button
              key={v.value}
              variant={view === v.value ? 'default' : 'ghost'}
              size='sm'
              onClick={() => onViewChange(v.value)}
              className={cn(
                'h-8 rounded-none border-0',
                index === 0 && 'rounded-l-md',
                index === mainViews.length - 1 && 'rounded-r-md',
                index !== mainViews.length - 1 && 'border-r',
                view === v.value &&
                  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
              )}
            >
              {v.label}
            </Button>
          ))}
        </div>

        {/* Separate Agenda and Year buttons */}
        {additionalViews.map((v) => (
          <Button
            key={v.value}
            variant={view === v.value ? 'default' : 'outline'}
            size='sm'
            onClick={() => onViewChange(v.value)}
            className='h-8'
          >
            {v.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
