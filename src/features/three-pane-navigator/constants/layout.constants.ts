export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1280,
} as const

export const PANE_DIMENSIONS = {
  programs: {
    default: 280,
    min: 200,
    max: 500,
    tablet: 300,
  },
  courses: {
    default: 320,
    min: 250,
    max: 500,
    tablet: 320,
  },
} as const

export const MOBILE_NAV_HEIGHT = 48 // 3rem = 48px
export const NARROW_PANE_THRESHOLD = 600
