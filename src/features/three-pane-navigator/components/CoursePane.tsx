import { forwardRef } from 'react'
import { useThreePaneNavigatorStore } from '@/stores/threePaneNavigatorStore'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { courses } from '../data/mockData'
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation'
import { EmptyState } from './EmptyState'

interface CoursePaneProps {
  onLeftPress?: () => void
}

export const CoursePane = forwardRef<HTMLDivElement, CoursePaneProps>(
  ({ onLeftPress }, ref) => {
    const {
      selectedProgramId,
      selectedCourseId,
      setSelectedCourse,
      keyboardFocusedPane,
    } = useThreePaneNavigatorStore()

    const filteredCourses = courses.filter(
      (course) => course.programId === selectedProgramId
    )

    const { containerRef, registerItemRef } = useKeyboardNavigation({
      items: filteredCourses,
      selectedId: selectedCourseId,
      onSelect: (id) => setSelectedCourse(id, true),
      getItemId: (course) => course.id,
      isActive: !!selectedProgramId,
      onLeftPress,
    })

    if (!selectedProgramId) {
      return (
        <div className='flex h-full flex-col overflow-hidden' ref={ref}>
          <EmptyState message='Select a program to view available courses' />
        </div>
      )
    }

    return (
      <div className='flex h-full flex-col overflow-hidden' ref={ref}>
        <div className='flex-shrink-0 border-b px-4 py-3'>
          <h2 className='text-lg font-semibold'>Courses</h2>
          <p className='text-muted-foreground text-sm'>
            {filteredCourses.length} courses available
          </p>
        </div>

        <ScrollArea className='flex-1 overflow-y-auto'>
          <div className='p-2 pr-4' ref={containerRef} tabIndex={-1}>
            {filteredCourses.map((course) => {
              const enrollmentPercentage =
                (course.enrolledSeats / course.totalSeats) * 100

              return (
                <button
                  key={course.id}
                  ref={(el) => registerItemRef(course.id, el)}
                  onClick={() => setSelectedCourse(course.id, false)}
                  className={cn(
                    'hover:bg-accent mb-2 w-full rounded-md border p-3 text-left transition-colors',
                    'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
                    selectedCourseId === course.id && 'bg-accent',
                    selectedCourseId === course.id &&
                      keyboardFocusedPane === 'courses' &&
                      'ring-primary ring-2'
                  )}
                  tabIndex={selectedCourseId === course.id ? 0 : -1}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <p className='font-semibold'>{course.code}</p>
                        <Badge variant='outline' className='text-xs'>
                          {course.level}
                        </Badge>
                      </div>
                      <p className='text-sm'>{course.name}</p>
                      <p className='text-muted-foreground mt-1 text-xs'>
                        {course.instructor.name} • {course.credits} credits
                      </p>
                    </div>
                  </div>

                  <div className='mt-2'>
                    <div className='text-muted-foreground mb-1 flex items-center justify-between text-xs'>
                      <span>Enrollment</span>
                      <span>
                        {course.enrolledSeats}/{course.totalSeats}
                      </span>
                    </div>
                    <Progress value={enrollmentPercentage} className='h-1.5' />
                  </div>

                  <div className='mt-2 flex items-center gap-2'>
                    <Badge variant='secondary' className='text-xs'>
                      {course.duration}
                    </Badge>
                    {course.prerequisites.length > 0 && (
                      <Badge variant='outline' className='text-xs'>
                        Prerequisites: {course.prerequisites.length}
                      </Badge>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    )
  }
)

CoursePane.displayName = 'CoursePane'
