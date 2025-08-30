import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Course } from '../types/course.types'

interface CourseHeaderProps {
  course: Course
}

export function CourseHeader({ course }: CourseHeaderProps) {
  const enrollmentPercentage = (course.enrolledSeats / course.totalSeats) * 100
  const seatsRemaining = course.totalSeats - course.enrolledSeats

  return (
    <div className='from-primary/10 via-primary/5 to-background relative overflow-hidden rounded-lg border bg-gradient-to-br'>
      <div className='p-6'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <div className='mb-2 flex items-center gap-3'>
              <h1 className='text-2xl font-bold'>{course.code}</h1>
              <Badge variant='outline'>{course.level}</Badge>
            </div>
            <h2 className='text-muted-foreground mb-4 text-lg'>
              {course.name}
            </h2>

            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                  />
                  <AvatarFallback>
                    {course.instructor.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='text-sm font-medium'>
                    {course.instructor.name}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    {course.instructor.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='text-right'>
            <div className='mb-2 flex items-center justify-end gap-2'>
              <Badge variant='secondary'>📚 {course.credits} Credits</Badge>
              <Badge variant='secondary'>⏱️ {course.duration}</Badge>
            </div>
          </div>
        </div>

        <div className='mt-6 space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>Course Enrollment</span>
            <span className='font-medium'>
              {course.enrolledSeats}/{course.totalSeats} seats ({seatsRemaining}{' '}
              available)
            </span>
          </div>
          <Progress value={enrollmentPercentage} className='h-2' />
        </div>
      </div>
    </div>
  )
}
