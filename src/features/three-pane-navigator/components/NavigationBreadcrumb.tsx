import { Menu } from 'lucide-react'
import { useThreePaneNavigatorStore } from '@/stores/threePaneNavigatorStore'
import { cn } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import type { Program, Course } from '../types/course.types'

interface NavigationBreadcrumbProps {
  selectedProgram: Program | undefined
  selectedCourse: Course | undefined
  activePane: 'programs' | 'courses' | 'details'
  variant?: 'mobile' | 'tablet'
  onTogglePrograms?: () => void
}

export function NavigationBreadcrumb({
  selectedProgram,
  selectedCourse,
  activePane,
  variant = 'mobile',
  onTogglePrograms,
}: NavigationBreadcrumbProps) {
  const textSizeClass = variant === 'mobile' ? 'text-xs sm:text-sm' : ''
  const maxWidthClass = variant === 'mobile' ? 'max-w-[100px]' : ''
  const { setActivePane } = useThreePaneNavigatorStore()

  // If no program is selected, show "Programs" as a link
  if (!selectedProgram) {
    return (
      <Breadcrumb>
        <BreadcrumbList className={textSizeClass}>
          <BreadcrumbItem>
            <BreadcrumbLink
              href='#'
              onClick={(e) => {
                e.preventDefault()
                if (variant === 'tablet' && onTogglePrograms) {
                  onTogglePrograms()
                } else {
                  setActivePane('programs')
                }
              }}
              className={cn(
                'hover:text-foreground flex cursor-pointer items-center gap-1 transition-colors',
                variant === 'mobile' ? 'max-w-[80px] truncate' : ''
              )}
            >
              {variant === 'tablet' && <Menu className='h-3 w-3' />}
              Programs
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className={textSizeClass}>
        <BreadcrumbItem>
          <BreadcrumbLink
            href='#'
            onClick={(e) => {
              e.preventDefault()
              if (onTogglePrograms) {
                onTogglePrograms()
              } else {
                setActivePane('programs')
              }
            }}
            className='hover:text-foreground flex cursor-pointer items-center gap-1 transition-colors'
          >
            <Menu className='h-3 w-3' />
            <span className={`${maxWidthClass} truncate`}>
              {selectedProgram.name}
            </span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {selectedCourse && activePane === 'details' && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className={`${maxWidthClass} truncate`}>
                {selectedCourse.code}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
