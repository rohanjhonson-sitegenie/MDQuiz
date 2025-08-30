import { useMemo } from 'react'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { courses } from '../data/mockData'

interface CoursePrerequisitesProps {
  prerequisites: string[]
}

export function CoursePrerequisites({
  prerequisites,
}: CoursePrerequisitesProps) {
  // For demo purposes, we'll simulate met/unmet prerequisites
  // Use useMemo with stable hash based on prereq code to ensure consistent results
  const prerequisiteStatus = useMemo(() => {
    return prerequisites.map((prereq, index) => {
      const course = courses.find((c) => c.code === prereq)
      // Generate a stable "random" value based on the prereq code
      const hash = prereq
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const isMet = (hash + index) % 10 > 3 // 70% chance of being met, but stable

      return {
        code: prereq,
        name: course?.name || `Course ${prereq}`,
        isMet,
        grade: isMet ? ['A', 'B+', 'B', 'A-'][(hash + index) % 4] : null,
      }
    })
  }, [prerequisites])

  if (prerequisites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>✅ Prerequisites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-2 text-green-600 dark:text-green-400'>
            <CheckCircle2 className='h-4 w-4' />
            <p className='text-sm font-medium'>No prerequisites required</p>
          </div>
          <p className='text-muted-foreground mt-1 text-xs'>
            This course is open to all students
          </p>
        </CardContent>
      </Card>
    )
  }

  const allMet = prerequisiteStatus.every((p) => p.isMet)

  return (
    <Card>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>✅ Prerequisites</CardTitle>
          {allMet ? (
            <Badge
              variant='secondary'
              className='bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            >
              <CheckCircle2 className='mr-1 h-3 w-3' />
              All Met
            </Badge>
          ) : (
            <Badge
              variant='secondary'
              className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            >
              <AlertCircle className='mr-1 h-3 w-3' />
              Requirements Pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-2'>
        {prerequisiteStatus.map((prereq, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center justify-between rounded-lg border p-3',
              prereq.isMet
                ? 'bg-green-50/50 dark:bg-green-900/10'
                : 'bg-red-50/50 dark:bg-red-900/10'
            )}
          >
            <div className='flex items-center gap-3'>
              {prereq.isMet ? (
                <CheckCircle2 className='h-4 w-4 text-green-600 dark:text-green-400' />
              ) : (
                <XCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
              )}
              <div>
                <p className='text-sm font-medium'>{prereq.code}</p>
                <p className='text-muted-foreground text-xs'>{prereq.name}</p>
              </div>
            </div>

            {prereq.isMet ? (
              <Badge variant='secondary' className='text-xs'>
                Grade: {prereq.grade}
              </Badge>
            ) : (
              <Badge variant='destructive' className='text-xs'>
                Not Completed
              </Badge>
            )}
          </div>
        ))}

        {!allMet && (
          <div className='mt-3 border-t pt-3'>
            <p className='text-muted-foreground text-xs'>
              ⚠️ You must complete all prerequisites before enrolling in this
              course
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
