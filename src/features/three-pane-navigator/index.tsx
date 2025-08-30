import { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useThreePaneNavigatorStore } from '@/stores/threePaneNavigatorStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CourseDetailPane } from './components/CourseDetailPane'
import { CoursePane } from './components/CoursePane'
import { NavigationBreadcrumb } from './components/NavigationBreadcrumb'
import { ProgramPane } from './components/ProgramPane'
import { ResizeHandle } from './components/ResizeHandle'
import { PANE_DIMENSIONS } from './constants/layout.constants'
import { programs, courses } from './data/mockData'
import { usePaneNavigation } from './hooks/usePaneNavigation'
import { usePaneResize } from './hooks/usePaneResize'
import { useResponsivePanes } from './hooks/useResponsivePanes'

export default function ThreePaneNavigator() {
  const {
    isMobile,
    isTablet,
    isDesktop,
    navigateBack,
    showBackButton,
    showMobileNav,
  } = useResponsivePanes()
  const { paneWidths, activePane, selectedProgramId, selectedCourseId } =
    useThreePaneNavigatorStore()
  const [isProgramsOpen, setIsProgramsOpen] = useState(false)

  const selectedProgram = programs.find((p) => p.id === selectedProgramId)
  const selectedCourse = courses.find((c) => c.id === selectedCourseId)

  const programsResize = usePaneResize({ pane: 'programs' })
  const coursesResize = usePaneResize({ pane: 'courses' })
  const { programPaneRef, coursePaneRef, focusProgramPane, focusCoursePane } =
    usePaneNavigation()

  // Auto-open programs menu in tablet mode when no program is selected
  useEffect(() => {
    if (isTablet && !selectedProgram) {
      setIsProgramsOpen(true)
    }
  }, [isTablet, selectedProgram])

  // Reset selection when component unmounts
  useEffect(() => {
    return () => {
      useThreePaneNavigatorStore.getState().resetSelection()
    }
  }, [])

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Content ===== */}
      <Main fixed className='flex flex-col p-0'>
        <div className='relative flex-1 overflow-hidden'>
          {/* Mobile navigation bar with breadcrumb */}
          {showMobileNav && (
            <div className='bg-background/95 absolute top-0 left-0 z-10 w-full border-b p-2 backdrop-blur-sm'>
              <div className='flex items-center gap-2'>
                {showBackButton && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={navigateBack}
                    className='h-8 w-8 p-0'
                  >
                    <ChevronLeft className='h-4 w-4' />
                    <span className='sr-only'>Back</span>
                  </Button>
                )}
                <NavigationBreadcrumb
                  selectedProgram={selectedProgram}
                  selectedCourse={selectedCourse}
                  activePane={activePane}
                  variant='mobile'
                />
              </div>
            </div>
          )}

          {/* Tablet navigation bar */}
          {isTablet && (
            <div className='bg-background/95 absolute top-0 left-0 z-10 flex w-full items-center gap-3 border-b p-2 backdrop-blur-sm'>
              <NavigationBreadcrumb
                selectedProgram={selectedProgram}
                selectedCourse={selectedCourse}
                activePane={activePane}
                variant='tablet'
                onTogglePrograms={() => setIsProgramsOpen(!isProgramsOpen)}
              />
            </div>
          )}

          {/* Three-pane layout */}
          <div
            className={cn(
              'flex h-full min-h-0 flex-1',
              showMobileNav && 'pt-12', // 48px = 3rem
              isTablet && 'pt-12' // 48px = 3rem
            )}
          >
            {/* Programs Pane */}
            <div
              className={cn(
                'bg-muted/30 flex h-full flex-col overflow-hidden transition-all duration-300',
                isMobile && activePane !== 'programs' && 'hidden',
                isTablet && !isProgramsOpen && 'hidden',
                isTablet &&
                  isProgramsOpen &&
                  'bg-background ring-border/50 absolute top-12 left-0 z-20 h-[calc(100%-3rem)] shadow-2xl ring-1'
              )}
              style={{
                width: isMobile
                  ? '100%'
                  : isTablet
                    ? `${PANE_DIMENSIONS.programs.tablet}px`
                    : `${paneWidths.programs}px`,
                minWidth: isMobile
                  ? '100%'
                  : isTablet
                    ? `${PANE_DIMENSIONS.programs.tablet}px`
                    : `${PANE_DIMENSIONS.programs.min}px`,
                maxWidth: isMobile
                  ? '100%'
                  : isTablet
                    ? `${PANE_DIMENSIONS.programs.tablet}px`
                    : `${PANE_DIMENSIONS.programs.max}px`,
              }}
            >
              <ProgramPane
                ref={programPaneRef}
                onProgramSelect={() => isTablet && setIsProgramsOpen(false)}
                onRightPress={focusCoursePane}
              />
            </div>

            {/* Invisible overlay for tablet when programs menu is open */}
            {isTablet && isProgramsOpen && (
              <div
                className='absolute inset-0 z-10'
                onClick={() => setIsProgramsOpen(false)}
              />
            )}

            {/* Resize handle for programs pane */}
            {isDesktop && (
              <ResizeHandle onMouseDown={programsResize.handleMouseDown} />
            )}

            {/* Courses Pane */}
            <div
              className={cn(
                'flex h-full flex-col overflow-hidden transition-all duration-300',
                isMobile && activePane !== 'courses' && 'hidden'
              )}
              style={{
                width: isMobile
                  ? '100%'
                  : isTablet
                    ? `${PANE_DIMENSIONS.courses.tablet}px`
                    : `${paneWidths.courses}px`,
                minWidth: isMobile
                  ? '100%'
                  : isTablet
                    ? `${PANE_DIMENSIONS.courses.tablet}px`
                    : `${PANE_DIMENSIONS.courses.min}px`,
                maxWidth: isMobile
                  ? '100%'
                  : isTablet
                    ? `${PANE_DIMENSIONS.courses.tablet}px`
                    : `${PANE_DIMENSIONS.courses.max}px`,
              }}
            >
              <CoursePane ref={coursePaneRef} onLeftPress={focusProgramPane} />
            </div>

            {/* Resize handle for courses pane */}
            {isDesktop && (
              <ResizeHandle onMouseDown={coursesResize.handleMouseDown} />
            )}

            {/* Detail Pane */}
            <div
              className={cn(
                'bg-background flex h-full flex-1 flex-col overflow-hidden transition-all duration-300',
                isMobile && activePane !== 'details' && 'hidden'
              )}
            >
              <CourseDetailPane />
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
