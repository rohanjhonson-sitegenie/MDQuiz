import { useCallback, useRef } from 'react'
import { useThreePaneNavigatorStore } from '@/stores/threePaneNavigatorStore'
import { courses } from '@/features/three-pane-navigator/data/mockData'

export function usePaneNavigation() {
  const programPaneRef = useRef<HTMLDivElement>(null)
  const coursePaneRef = useRef<HTMLDivElement>(null)

  const focusProgramPane = useCallback(() => {
    const { setKeyboardFocusedPane } = useThreePaneNavigatorStore.getState()
    setKeyboardFocusedPane('programs')

    const firstButton = programPaneRef.current?.querySelector(
      'button[tabindex="0"]'
    )
    if (firstButton instanceof HTMLElement) {
      firstButton.focus()
    }
  }, [])

  const focusCoursePane = useCallback(() => {
    const {
      selectedProgramId,
      selectedCourseId,
      setSelectedCourse,
      setKeyboardFocusedPane,
    } = useThreePaneNavigatorStore.getState()
    setKeyboardFocusedPane('courses')

    // If no course is selected, select the first course for the current program
    if (selectedProgramId && !selectedCourseId) {
      const firstCourse = courses.find(
        (course) => course.programId === selectedProgramId
      )
      if (firstCourse) {
        setSelectedCourse(firstCourse.id, true)
      }
    }

    // Focus on the selected course button
    setTimeout(() => {
      const buttonToFocus = coursePaneRef.current?.querySelector(
        'button[tabindex="0"]'
      )
      if (buttonToFocus instanceof HTMLElement) {
        buttonToFocus.focus()
      }
    }, 0)
  }, [])

  return {
    programPaneRef,
    coursePaneRef,
    focusProgramPane,
    focusCoursePane,
  }
}
