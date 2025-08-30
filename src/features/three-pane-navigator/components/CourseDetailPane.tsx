import { useRef, useEffect, useState, useMemo } from 'react'
import { useThreePaneNavigatorStore } from '@/stores/threePaneNavigatorStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { NARROW_PANE_THRESHOLD } from '../constants/layout.constants'
import { courses } from '../data/mockData'
import { CourseEnrollment } from './CourseEnrollment'
import { CourseHeader } from './CourseHeader'
import { CoursePrerequisites } from './CoursePrerequisites'
import { CourseResources } from './CourseResources'
import { CourseSchedule } from './CourseSchedule'
import { EmptyState } from './EmptyState'

export function CourseDetailPane() {
  const { selectedCourseId } = useThreePaneNavigatorStore()
  const [isNarrow, setIsNarrow] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const course = courses.find((c) => c.id === selectedCourseId)

  // Check if prerequisites are met (for demo, use stable value based on course ID)
  const hasPrerequisites = useMemo(() => {
    if (!course) return false
    if (course.prerequisites.length === 0) return true
    // Generate stable "random" value based on course ID
    const hash = course.id
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return hash % 10 > 3 // 70% chance of having prerequisites met
  }, [course])

  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        setIsNarrow(containerRef.current.offsetWidth < NARROW_PANE_THRESHOLD)
      }
    }

    checkWidth()
    window.addEventListener('resize', checkWidth)

    // Use ResizeObserver for more accurate detection
    const resizeObserver = new ResizeObserver(checkWidth)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      window.removeEventListener('resize', checkWidth)
      resizeObserver.disconnect()
    }
  }, [])

  if (!selectedCourseId || !course) {
    return <EmptyState message='Select a course to view details' />
  }

  return (
    <div ref={containerRef} className='flex h-full flex-col overflow-hidden'>
      <ScrollArea className='flex-1 overflow-y-auto'>
        <div className='space-y-6 p-6'>
          <CourseHeader course={course} />

          <div className='space-y-4'>
            <div>
              <h3 className='mb-2 text-sm font-semibold'>Course Description</h3>
              <p className='text-muted-foreground text-sm'>
                {course.description}
              </p>
            </div>

            <Separator />
          </div>

          <div
            className={`grid gap-4 ${isNarrow ? 'grid-cols-1' : 'grid-cols-2'}`}
          >
            <div className='space-y-4'>
              <CourseSchedule courseId={course.id} />
              <CoursePrerequisites prerequisites={course.prerequisites} />
            </div>

            <div className='space-y-4'>
              <CourseResources courseId={course.id} />
              <CourseEnrollment
                course={course}
                hasPrerequisites={hasPrerequisites}
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
