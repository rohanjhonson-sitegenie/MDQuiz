export interface Program {
  id: string
  name: string
  icon?: string
  description: string
  courseCount: number
}

export interface Course {
  id: string
  programId: string
  code: string
  name: string
  instructor: {
    name: string
    avatar?: string
    email: string
  }
  credits: number
  duration: string // e.g., "12 weeks"
  totalSeats: number
  enrolledSeats: number
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  description: string
  prerequisites: string[]
  startDate: string
  endDate: string
}

export interface ClassSession {
  id: string
  courseId: string
  dayOfWeek: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  startTime: string // e.g., "09:00"
  endTime: string // e.g., "10:30"
  room: string
  type: 'Lecture' | 'Lab' | 'Tutorial' | 'Workshop'
  instructor?: string
}

export interface CourseResource {
  id: string
  courseId: string
  name: string
  type: 'PDF' | 'Video' | 'Link' | 'Document'
  url: string
  size?: string
  uploadedAt: string
}

export interface NavigationState {
  selectedProgramId: string | null
  selectedCourseId: string | null
  paneWidths: {
    programs: number
    courses: number
  }
  isMobile: boolean
  activePane: 'programs' | 'courses' | 'details'
}
