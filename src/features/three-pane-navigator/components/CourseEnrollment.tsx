import { Calendar, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Course } from '../types/course.types'

interface CourseEnrollmentProps {
  course: Course
  hasPrerequisites: boolean
}

export function CourseEnrollment({
  course,
  hasPrerequisites,
}: CourseEnrollmentProps) {
  const seatsRemaining = course.totalSeats - course.enrolledSeats
  const isFull = seatsRemaining <= 0
  const isLimited = seatsRemaining > 0 && seatsRemaining <= 5

  // For demo purposes, simulate enrollment deadline
  const enrollmentDeadline = new Date(course.startDate)
  enrollmentDeadline.setDate(enrollmentDeadline.getDate() - 7) // 7 days before start
  const isEnrollmentOpen = new Date() < enrollmentDeadline

  return (
    <Card className='border-primary/20'>
      <CardHeader>
        <CardTitle className='text-lg'>🎓 Enrollment</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-3'>
          <div className='flex items-center gap-2 text-sm'>
            <Calendar className='text-muted-foreground h-4 w-4' />
            <span>
              Course Duration: {course.startDate} - {course.endDate}
            </span>
          </div>

          <div className='flex items-center gap-2 text-sm'>
            <Clock className='text-muted-foreground h-4 w-4' />
            <span>
              Enrollment Deadline: {enrollmentDeadline.toLocaleDateString()}
            </span>
          </div>

          <div className='flex items-center gap-2 text-sm'>
            <Users className='text-muted-foreground h-4 w-4' />
            <span>
              Available Seats: {seatsRemaining} of {course.totalSeats}
            </span>
            {isLimited && !isFull && (
              <Badge variant='destructive' className='text-xs'>
                Limited Seats
              </Badge>
            )}
          </div>
        </div>

        <div className='border-t pt-4'>
          {!isEnrollmentOpen ? (
            <div className='text-center'>
              <p className='text-muted-foreground mb-2 text-sm'>
                Enrollment has closed
              </p>
              <Button variant='secondary' disabled className='w-full'>
                Enrollment Closed
              </Button>
            </div>
          ) : isFull ? (
            <div className='text-center'>
              <p className='text-muted-foreground mb-2 text-sm'>
                This course is full
              </p>
              <Button variant='secondary' className='w-full'>
                Join Waitlist
              </Button>
            </div>
          ) : !hasPrerequisites ? (
            <div className='text-center'>
              <p className='text-destructive mb-2 text-sm'>
                Prerequisites not met
              </p>
              <Button variant='outline' disabled className='w-full'>
                Cannot Enroll
              </Button>
            </div>
          ) : (
            <div className='space-y-2'>
              <Button className='w-full' size='lg'>
                Enroll Now
              </Button>
              {isLimited && (
                <p className='text-muted-foreground text-center text-xs'>
                  ⚡ Only {seatsRemaining} seats remaining!
                </p>
              )}
            </div>
          )}
        </div>

        <div className='text-muted-foreground space-y-1 text-xs'>
          <p>• You can drop this course within the first 2 weeks</p>
          <p>• A confirmation email will be sent upon enrollment</p>
          <p>• Course materials will be available 3 days before start</p>
        </div>
      </CardContent>
    </Card>
  )
}
