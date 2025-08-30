import type {
  Program,
  Course,
  ClassSession,
  CourseResource,
} from '../types/course.types'

export const programs: Program[] = [
  {
    id: 'robotics',
    name: 'Robotics',
    description: 'Build and program robots using VEX systems',
    courseCount: 8,
    icon: '🤖',
  },
  {
    id: 'maker',
    name: 'Maker',
    description: 'Hands-on creation and DIY projects',
    courseCount: 6,
    icon: '🛠️',
  },
  {
    id: 'coding',
    name: 'Coding',
    description: 'Programming and software development',
    courseCount: 12,
    icon: '💻',
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Mathematical concepts and problem solving',
    courseCount: 10,
    icon: '📐',
  },
  {
    id: 'engineering',
    name: 'Engineering',
    description: 'Engineering principles and design',
    courseCount: 7,
    icon: '⚙️',
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Scientific exploration and experiments',
    courseCount: 9,
    icon: '🔬',
  },
]

export const courses: Course[] = [
  // Robotics Courses
  {
    id: 'rob-101',
    programId: 'robotics',
    code: 'ROB101',
    name: 'VEX IQ STEM Lab Introduction',
    instructor: {
      name: 'Dr. Sarah Chen',
      email: 'schen@school.edu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    credits: 3,
    duration: '12 weeks',
    totalSeats: 30,
    enrolledSeats: 24,
    level: 'Beginner',
    description:
      'Introduction to robotics using VEX IQ platform. Learn basic building techniques and programming concepts.',
    prerequisites: [],
    startDate: '2024-09-01',
    endDate: '2024-11-24',
  },
  {
    id: 'rob-102',
    programId: 'robotics',
    code: 'ROB102',
    name: 'VEX IQ Competition Foundation',
    instructor: {
      name: 'Prof. Mike Johnson',
      email: 'mjohnson@school.edu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    },
    credits: 4,
    duration: '12 weeks',
    totalSeats: 25,
    enrolledSeats: 22,
    level: 'Intermediate',
    description:
      'Prepare for VEX IQ competitions. Advanced building techniques and competition strategies.',
    prerequisites: ['ROB101'],
    startDate: '2024-09-01',
    endDate: '2024-11-24',
  },
  {
    id: 'rob-201',
    programId: 'robotics',
    code: 'ROB201',
    name: 'Advanced VEX Robotics',
    instructor: {
      name: 'Dr. Lisa Park',
      email: 'lpark@school.edu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    },
    credits: 4,
    duration: '16 weeks',
    totalSeats: 20,
    enrolledSeats: 18,
    level: 'Advanced',
    description:
      'Advanced robotics concepts including sensors, autonomous navigation, and complex mechanisms.',
    prerequisites: ['ROB102'],
    startDate: '2024-09-01',
    endDate: '2024-12-20',
  },

  // Coding Courses
  {
    id: 'cs-101',
    programId: 'coding',
    code: 'CS101',
    name: 'Introduction to Python',
    instructor: {
      name: 'Prof. Alex Turner',
      email: 'aturner@school.edu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
    credits: 3,
    duration: '10 weeks',
    totalSeats: 40,
    enrolledSeats: 35,
    level: 'Beginner',
    description:
      'Learn Python programming from scratch. Cover basic syntax, data structures, and problem solving.',
    prerequisites: [],
    startDate: '2024-09-01',
    endDate: '2024-11-10',
  },
  {
    id: 'cs-201',
    programId: 'coding',
    code: 'CS201',
    name: 'Web Development Fundamentals',
    instructor: {
      name: 'Dr. Emma Wilson',
      email: 'ewilson@school.edu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    },
    credits: 4,
    duration: '14 weeks',
    totalSeats: 35,
    enrolledSeats: 30,
    level: 'Intermediate',
    description:
      'Build modern websites using HTML, CSS, and JavaScript. Introduction to React framework.',
    prerequisites: ['CS101'],
    startDate: '2024-09-01',
    endDate: '2024-12-07',
  },

  // Mathematics Courses
  {
    id: 'math-101',
    programId: 'mathematics',
    code: 'MATH101',
    name: 'Algebra Foundations',
    instructor: {
      name: 'Dr. Robert Kim',
      email: 'rkim@school.edu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    },
    credits: 3,
    duration: '12 weeks',
    totalSeats: 45,
    enrolledSeats: 40,
    level: 'Beginner',
    description:
      'Fundamental concepts in algebra including equations, functions, and graphing.',
    prerequisites: [],
    startDate: '2024-09-01',
    endDate: '2024-11-24',
  },

  // Engineering Courses
  {
    id: 'eng-101',
    programId: 'engineering',
    code: 'ENG101',
    name: 'Engineering Design Process',
    instructor: {
      name: 'Prof. David Martinez',
      email: 'dmartinez@school.edu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    },
    credits: 3,
    duration: '10 weeks',
    totalSeats: 30,
    enrolledSeats: 25,
    level: 'Beginner',
    description:
      'Introduction to engineering design thinking and problem-solving methodologies.',
    prerequisites: [],
    startDate: '2024-09-01',
    endDate: '2024-11-10',
  },
]

export const classSessions: ClassSession[] = [
  // ROB101 Sessions
  {
    id: 'sess-1',
    courseId: 'rob-101',
    dayOfWeek: 'Mon',
    startTime: '09:00',
    endTime: '10:30',
    room: 'Robotics Lab 201',
    type: 'Lab',
    instructor: 'Dr. Sarah Chen',
  },
  {
    id: 'sess-2',
    courseId: 'rob-101',
    dayOfWeek: 'Wed',
    startTime: '09:00',
    endTime: '10:30',
    room: 'Robotics Lab 201',
    type: 'Lab',
    instructor: 'Dr. Sarah Chen',
  },
  {
    id: 'sess-3',
    courseId: 'rob-101',
    dayOfWeek: 'Fri',
    startTime: '14:00',
    endTime: '15:30',
    room: 'Lecture Hall 105',
    type: 'Lecture',
    instructor: 'Dr. Sarah Chen',
  },

  // CS101 Sessions
  {
    id: 'sess-4',
    courseId: 'cs-101',
    dayOfWeek: 'Tue',
    startTime: '10:00',
    endTime: '11:30',
    room: 'Computer Lab 301',
    type: 'Lab',
    instructor: 'Prof. Alex Turner',
  },
  {
    id: 'sess-5',
    courseId: 'cs-101',
    dayOfWeek: 'Thu',
    startTime: '10:00',
    endTime: '11:30',
    room: 'Computer Lab 301',
    type: 'Lab',
    instructor: 'Prof. Alex Turner',
  },
  {
    id: 'sess-6',
    courseId: 'cs-101',
    dayOfWeek: 'Fri',
    startTime: '13:00',
    endTime: '14:00',
    room: 'Lecture Hall 102',
    type: 'Lecture',
    instructor: 'Prof. Alex Turner',
  },
]

export const courseResources: CourseResource[] = [
  // ROB101 Resources
  {
    id: 'res-1',
    courseId: 'rob-101',
    name: 'VEX IQ Build Instructions',
    type: 'PDF',
    url: '/resources/vex-iq-guide.pdf',
    size: '4.2 MB',
    uploadedAt: '2024-08-15',
  },
  {
    id: 'res-2',
    courseId: 'rob-101',
    name: 'Introduction to RobotC',
    type: 'Video',
    url: '/resources/robotc-intro.mp4',
    size: '125 MB',
    uploadedAt: '2024-08-20',
  },
  {
    id: 'res-3',
    courseId: 'rob-101',
    name: 'Course Syllabus',
    type: 'Document',
    url: '/resources/rob101-syllabus.docx',
    size: '45 KB',
    uploadedAt: '2024-08-01',
  },

  // CS101 Resources
  {
    id: 'res-4',
    courseId: 'cs-101',
    name: 'Python Basics Cheatsheet',
    type: 'PDF',
    url: '/resources/python-cheatsheet.pdf',
    size: '1.2 MB',
    uploadedAt: '2024-08-10',
  },
  {
    id: 'res-5',
    courseId: 'cs-101',
    name: 'Codecademy Python Course',
    type: 'Link',
    url: 'https://www.codecademy.com/learn/learn-python-3',
    uploadedAt: '2024-08-05',
  },
]
