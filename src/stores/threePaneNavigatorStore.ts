import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { PANE_DIMENSIONS } from '@/features/three-pane-navigator/constants/layout.constants'
import type { NavigationState } from '@/features/three-pane-navigator/types/course.types'

interface ThreePaneNavigatorStore extends NavigationState {
  keyboardFocusedPane: 'programs' | 'courses' | null
  setSelectedProgram: (programId: string | null, isKeyboard?: boolean) => void
  setSelectedCourse: (courseId: string | null, isKeyboard?: boolean) => void
  setPaneWidth: (pane: 'programs' | 'courses', width: number) => void
  setActivePane: (pane: 'programs' | 'courses' | 'details') => void
  setKeyboardFocusedPane: (pane: 'programs' | 'courses' | null) => void
  resetSelection: () => void
}

export const useThreePaneNavigatorStore = create<ThreePaneNavigatorStore>()(
  devtools(
    (set) => ({
      // Initial state
      selectedProgramId: null,
      selectedCourseId: null,
      keyboardFocusedPane: null,
      paneWidths: {
        programs: PANE_DIMENSIONS.programs.default,
        courses: PANE_DIMENSIONS.courses.default,
      },
      isMobile: false,
      activePane: 'programs',

      // Actions
      setSelectedProgram: (programId, isKeyboard = false) =>
        set(() => ({
          selectedProgramId: programId,
          selectedCourseId: null, // Reset course selection when program changes
          activePane: programId ? 'courses' : 'programs',
          keyboardFocusedPane: isKeyboard ? 'programs' : null,
        })),

      setSelectedCourse: (courseId, isKeyboard = false) =>
        set(() => ({
          selectedCourseId: courseId,
          activePane: courseId ? 'details' : 'courses',
          keyboardFocusedPane: isKeyboard ? 'courses' : null,
        })),

      setPaneWidth: (pane, width) =>
        set((state) => ({
          paneWidths: {
            ...state.paneWidths,
            [pane]: width,
          },
        })),

      setActivePane: (pane) => set({ activePane: pane }),

      setKeyboardFocusedPane: (pane) => set({ keyboardFocusedPane: pane }),

      resetSelection: () =>
        set({
          selectedProgramId: null,
          selectedCourseId: null,
          activePane: 'programs',
          keyboardFocusedPane: null,
        }),
    }),
    {
      name: 'three-pane-navigator-store',
    }
  )
)
