import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { classSessions } from '../data/mockData'
import type { ClassSession } from '../types/course.types'

interface CourseScheduleProps {
  courseId: string
}

const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

function formatTime(time: string) {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${minutes} ${ampm}`
}

function getSessionTypeColor(type: ClassSession['type']) {
  switch (type) {
    case 'Lecture':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    case 'Lab':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    case 'Tutorial':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    case 'Workshop':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    default:
      return ''
  }
}

export function CourseSchedule({ courseId }: CourseScheduleProps) {
  const courseSessions = classSessions
    .filter((session) => session.courseId === courseId)
    .sort(
      (a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek)
    )

  if (courseSessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>📅 Class Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>
            No scheduled sessions available
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>📅 Class Schedule</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {courseSessions.map((session) => (
          <div
            key={session.id}
            className='hover:bg-accent/50 flex items-center justify-between rounded-lg border p-3 transition-colors'
          >
            <div className='flex-1'>
              <div className='mb-1 flex items-center gap-2'>
                <span className='text-sm font-semibold'>
                  {session.dayOfWeek}
                </span>
                <Badge
                  variant='secondary'
                  className={getSessionTypeColor(session.type)}
                >
                  {session.type}
                </Badge>
              </div>
              <p className='text-sm'>
                {formatTime(session.startTime)} - {formatTime(session.endTime)}
              </p>
              <p className='text-muted-foreground mt-1 text-xs'>
                📍 {session.room}{' '}
                {session.instructor && `• ${session.instructor}`}
              </p>
            </div>

            <div className='text-right'>
              <p className='text-muted-foreground text-xs'>Duration</p>
              <p className='text-sm font-medium'>
                {(() => {
                  const [startHour, startMin] = session.startTime
                    .split(':')
                    .map(Number)
                  const [endHour, endMin] = session.endTime
                    .split(':')
                    .map(Number)
                  const duration =
                    endHour * 60 + endMin - (startHour * 60 + startMin)
                  const hours = Math.floor(duration / 60)
                  const mins = duration % 60
                  return hours > 0
                    ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`
                    : `${mins}m`
                })()}
              </p>
            </div>
          </div>
        ))}

        <div className='mt-4 border-t pt-3'>
          <p className='text-muted-foreground text-xs'>
            Total: {courseSessions.length} sessions per week
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
