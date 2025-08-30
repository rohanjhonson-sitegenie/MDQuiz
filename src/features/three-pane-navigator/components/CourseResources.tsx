import { Download, FileText, Video, Link, File } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { courseResources } from '../data/mockData'
import type { CourseResource } from '../types/course.types'

interface CourseResourcesProps {
  courseId: string
}

function getResourceIcon(type: CourseResource['type']) {
  switch (type) {
    case 'PDF':
      return <FileText className='h-4 w-4' />
    case 'Video':
      return <Video className='h-4 w-4' />
    case 'Link':
      return <Link className='h-4 w-4' />
    case 'Document':
      return <File className='h-4 w-4' />
    default:
      return <File className='h-4 w-4' />
  }
}

function getResourceTypeColor(type: CourseResource['type']) {
  switch (type) {
    case 'PDF':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    case 'Video':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    case 'Link':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    case 'Document':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    default:
      return ''
  }
}

export function CourseResources({ courseId }: CourseResourcesProps) {
  const resources = courseResources.filter(
    (resource) => resource.courseId === courseId
  )

  if (resources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>📁 Course Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>
            No resources available yet
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>📁 Course Resources</CardTitle>
          <Button variant='outline' size='sm'>
            <Download className='mr-1 h-3 w-3' />
            Download All
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-2'>
        {resources.map((resource) => (
          <div
            key={resource.id}
            className='hover:bg-accent/50 group flex items-center justify-between rounded-lg border p-3 transition-colors'
          >
            <div className='flex min-w-0 flex-1 items-center gap-3'>
              <div className='text-muted-foreground'>
                {getResourceIcon(resource.type)}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>{resource.name}</p>
                <div className='mt-1 flex items-center gap-2'>
                  <Badge
                    variant='secondary'
                    className={cn(
                      'text-xs',
                      getResourceTypeColor(resource.type)
                    )}
                  >
                    {resource.type}
                  </Badge>
                  {resource.size && (
                    <span className='text-muted-foreground text-xs'>
                      {resource.size}
                    </span>
                  )}
                  <span className='text-muted-foreground text-xs'>
                    • {new Date(resource.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant='ghost'
              size='sm'
              className='opacity-0 transition-opacity group-hover:opacity-100'
            >
              <Download className='h-3 w-3' />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
