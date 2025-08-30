import { createFileRoute } from '@tanstack/react-router'
import { CalendarDays, CalendarRange, List, Clock } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UnifiedCalendar } from '@/features/calendar'
import type { CalendarEvent } from '@/features/calendar'
import type { EventType } from '@/features/calendar/utils/event-type-colors'

// Sample events for demo
interface DemoEvent extends CalendarEvent {
  title: string
  color?: string
  description?: string
  type?: EventType
}

const sampleEvents: DemoEvent[] = [
  // Add events for January 2025 to ensure visibility
  {
    id: '0',
    title: 'New Year Kickoff',
    start: new Date(2025, 0, 2, 9, 0, 0), // January 2, 2025
    end: new Date(2025, 0, 2, 17, 0, 0),
    color: '#3B82F6',
    description: 'Company kickoff meeting',
    type: 'meeting',
  },
  {
    id: '50',
    title: 'Training Class',
    start: new Date(2025, 0, 15, 10, 0, 0), // January 15, 2025
    end: new Date(2025, 0, 15, 12, 0, 0),
    color: '#8B5CF6',
    description: 'New employee training',
    type: 'class',
  },
  {
    id: '51',
    title: 'Client Appointment',
    start: new Date(2025, 0, 20, 14, 0, 0), // January 20, 2025
    end: new Date(2025, 0, 20, 15, 30, 0),
    color: '#06B6D4',
    description: 'Quarterly review with client',
    type: 'appointment',
  },
  {
    id: '1',
    title: 'Team Meeting',
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 0, 0, 0)),
    color: '#3B82F6',
    description: 'Weekly team sync',
    type: 'meeting',
  },
  {
    id: '2',
    title: 'Project Review',
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 30, 0, 0)),
    color: '#10B981',
    description: 'Q4 project review meeting',
    type: 'meeting',
  },
  // Overlapping events for today
  {
    id: '3',
    title: 'Design Review',
    start: new Date(new Date().setHours(10, 30, 0, 0)),
    end: new Date(new Date().setHours(11, 30, 0, 0)),
    color: '#F59E0B',
    description: 'UI/UX design review',
    type: 'meeting',
  },
  {
    id: '4',
    title: 'Quick Sync',
    start: new Date(new Date().setHours(10, 15, 0, 0)),
    end: new Date(new Date().setHours(10, 45, 0, 0)),
    color: '#EC4899',
    description: 'Quick sync with PM',
    type: 'meeting',
  },
  // More overlapping events
  {
    id: '6',
    title: 'Tech Talk',
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(16, 0, 0, 0)),
    color: '#EF4444',
    description: 'Frontend best practices',
    type: 'class',
  },
  // Tomorrow's events
  {
    id: '7',
    title: 'Client Call',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      date.setHours(9, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      date.setHours(10, 0, 0, 0)
      return date
    })(),
    color: '#F59E0B',
    description: 'Monthly check-in with client',
    type: 'appointment',
  },
  {
    id: '8',
    title: 'Sprint Planning',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 2)
      date.setHours(11, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 2)
      date.setHours(12, 30, 0, 0)
      return date
    })(),
    color: '#8B5CF6',
    description: 'Plan next sprint tasks',
    type: 'meeting',
  },
  {
    id: '9',
    title: 'Company Holiday',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 3)
      date.setHours(0, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 3)
      date.setHours(23, 59, 59, 999)
      return date
    })(),
    color: '#EC4899',
    description: 'National holiday - Office closed',
    type: 'holiday',
  },
  // More all-day events
  {
    id: '10',
    title: 'Team Building Day',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 5)
      date.setHours(0, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 5)
      date.setHours(23, 59, 59, 999)
      return date
    })(),
    color: '#10B981',
    description: 'Annual team building activities',
    type: 'personal',
  },
  {
    id: '11',
    title: 'Conference - Day 1',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      date.setHours(0, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      date.setHours(23, 59, 59, 999)
      return date
    })(),
    color: '#8B5CF6',
    description: 'Tech Conference 2024',
    type: 'class',
  },
  {
    id: '12',
    title: 'Conference - Day 2',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 8)
      date.setHours(0, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 8)
      date.setHours(23, 59, 59, 999)
      return date
    })(),
    color: '#8B5CF6',
    description: 'Tech Conference 2024',
    type: 'class',
  },
  // More overlapping events for today
  {
    id: '13',
    title: 'Standup Meeting',
    start: new Date(new Date().setHours(9, 30, 0, 0)),
    end: new Date(new Date().setHours(9, 45, 0, 0)),
    color: '#6366F1',
    description: 'Daily standup',
    type: 'meeting',
  },
  {
    id: '14',
    title: 'Code Review',
    start: new Date(new Date().setHours(9, 30, 0, 0)),
    end: new Date(new Date().setHours(10, 30, 0, 0)),
    color: '#0EA5E9',
    description: 'PR review session',
    type: 'meeting',
  },
  {
    id: '15',
    title: 'Lunch & Learn',
    start: new Date(new Date().setHours(12, 0, 0, 0)),
    end: new Date(new Date().setHours(13, 0, 0, 0)),
    color: '#14B8A6',
    description: 'GraphQL best practices',
    type: 'class',
  },
  {
    id: '16',
    title: 'Customer Demo',
    start: new Date(new Date().setHours(14, 30, 0, 0)),
    end: new Date(new Date().setHours(15, 30, 0, 0)),
    color: '#F97316',
    description: 'Product demo for potential client',
    type: 'appointment',
  },
  {
    id: '17',
    title: 'Engineering Sync',
    start: new Date(new Date().setHours(15, 0, 0, 0)),
    end: new Date(new Date().setHours(16, 30, 0, 0)),
    color: '#84CC16',
    description: 'Weekly engineering team sync',
    type: 'meeting',
  },
  // Complex overlapping scenario
  {
    id: '18',
    title: 'Workshop Part 1',
    start: new Date(new Date().setHours(13, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0, 0)),
    color: '#A855F7',
    description: 'React performance workshop',
    type: 'class',
  },
  {
    id: '19',
    title: 'Workshop Part 2',
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(17, 0, 0, 0)),
    color: '#A855F7',
    description: 'React performance workshop continued',
    type: 'class',
  },
  // Multi-day all-day event
  {
    id: '20',
    title: 'Vacation',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 10)
      date.setHours(0, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 14)
      date.setHours(23, 59, 59, 999)
      return date
    })(),
    color: '#06B6D4',
    description: 'Out of office',
    type: 'holiday',
  },
  // Overlapping all-day events
  {
    id: '36',
    title: 'Product Launch',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 3)
      date.setHours(0, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 3)
      date.setHours(23, 59, 59, 999)
      return date
    })(),
    color: '#059669',
    description: 'New feature launch day',
    type: 'deadline',
  },
  {
    id: '37',
    title: 'Marketing Campaign',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 3)
      date.setHours(0, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 3)
      date.setHours(23, 59, 59, 999)
      return date
    })(),
    color: '#DC2626',
    description: 'Social media campaign launch',
    type: 'deadline',
  },
  // More overlapping on team building day
  {
    id: '38',
    title: 'Q4 Planning',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 5)
      date.setHours(0, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 5)
      date.setHours(23, 59, 59, 999)
      return date
    })(),
    color: '#7C3AED',
    description: 'Quarterly planning session',
    type: 'meeting',
  },
  {
    id: '39',
    title: 'Remote Work Day',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 5)
      date.setHours(0, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 5)
      date.setHours(23, 59, 59, 999)
      return date
    })(),
    color: '#0891B2',
    description: 'Optional remote work',
    type: 'personal',
  },
  // Overlapping with conference days
  {
    id: '40',
    title: 'Booth Setup',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      date.setHours(0, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      date.setHours(23, 59, 59, 999)
      return date
    })(),
    color: '#F97316',
    description: 'Conference booth preparation',
    type: 'class',
  },
  {
    id: '41',
    title: 'Partner Meetings',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 8)
      date.setHours(0, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 8)
      date.setHours(23, 59, 59, 999)
      return date
    })(),
    color: '#6366F1',
    description: 'Strategic partner discussions',
    type: 'meeting',
  },
  // Multiple overlapping on vacation
  {
    id: '42',
    title: 'Team Coverage',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 10)
      date.setHours(0, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 12)
      date.setHours(23, 59, 59, 999)
      return date
    })(),
    color: '#EF4444',
    description: 'Coverage schedule active',
    type: 'personal',
  },
  {
    id: '43',
    title: 'Project Freeze',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 11)
      date.setHours(0, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 13)
      date.setHours(23, 59, 59, 999)
      return date
    })(),
    color: '#F59E0B',
    description: 'No deployments period',
    type: 'deadline',
  },
  // Add some tournament and scrimmage events
  {
    id: '44',
    title: 'Regional Tournament',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 15)
      date.setHours(0, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 16)
      date.setHours(23, 59, 59, 999)
      return date
    })(),
    color: '#F59E0B',
    description: 'Regional robotics tournament',
    type: 'tournament',
  },
  // Add some events spread throughout the year
  {
    id: '46',
    title: 'Q1 Planning',
    start: new Date(2025, 2, 15, 0, 0, 0), // March 15, 2025
    end: new Date(2025, 2, 15, 23, 59, 59),
    color: '#3B82F6',
    description: 'Quarterly planning meeting',
    type: 'meeting',
  },
  {
    id: '47',
    title: 'Summer Holiday',
    start: new Date(2025, 6, 1, 0, 0, 0), // July 1, 2025
    end: new Date(2025, 6, 7, 23, 59, 59), // July 7, 2025
    color: '#10B981',
    description: 'Summer vacation week',
    type: 'holiday',
  },
  {
    id: '48',
    title: 'Fall Tournament',
    start: new Date(2025, 9, 20, 0, 0, 0), // October 20, 2025
    end: new Date(2025, 9, 21, 23, 59, 59), // October 21, 2025
    color: '#F59E0B',
    description: 'Fall robotics tournament',
    type: 'tournament',
  },
  {
    id: '49',
    title: 'Year End Deadline',
    start: new Date(2025, 11, 15, 0, 0, 0), // December 15, 2025
    end: new Date(2025, 11, 15, 23, 59, 59),
    color: '#EF4444',
    description: 'Project submission deadline',
    type: 'deadline',
  },
  {
    id: '45',
    title: 'Practice Scrimmage',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 6)
      date.setHours(14, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 6)
      date.setHours(17, 0, 0, 0)
      return date
    })(),
    color: '#3B82F6',
    description: 'Team practice scrimmage',
    type: 'scrimmage',
  },
  // Busy day tomorrow - multiple non-overlapping events
  {
    id: '21',
    title: 'Morning Yoga',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      date.setHours(7, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      date.setHours(8, 0, 0, 0)
      return date
    })(),
    color: '#EC4899',
    description: 'Team wellness activity',
  },
  {
    id: '22',
    title: 'Budget Review',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      date.setHours(10, 30, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      date.setHours(11, 30, 0, 0)
      return date
    })(),
    color: '#EF4444',
    description: 'Q4 budget planning',
  },
  {
    id: '23',
    title: 'Team Lunch',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      date.setHours(12, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      date.setHours(13, 30, 0, 0)
      return date
    })(),
    color: '#F59E0B',
    description: 'Monthly team lunch',
  },
  {
    id: '24',
    title: '1:1 with Manager',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      date.setHours(14, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      date.setHours(14, 30, 0, 0)
      return date
    })(),
    color: '#6366F1',
    description: 'Weekly check-in',
  },
  {
    id: '25',
    title: 'API Design Meeting',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      date.setHours(15, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      date.setHours(16, 30, 0, 0)
      return date
    })(),
    color: '#8B5CF6',
    description: 'Review API architecture',
  },
  {
    id: '26',
    title: 'Office Hours',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      date.setHours(17, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      date.setHours(18, 0, 0, 0)
      return date
    })(),
    color: '#10B981',
    description: 'Open for questions',
  },
  // Another busy day in 4 days
  {
    id: '27',
    title: 'Quarterly Planning',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 4)
      date.setHours(9, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 4)
      date.setHours(10, 30, 0, 0)
      return date
    })(),
    color: '#DC2626',
    description: 'Q1 2025 planning session',
  },
  {
    id: '28',
    title: 'Design Sprint',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 4)
      date.setHours(10, 30, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 4)
      date.setHours(12, 0, 0, 0)
      return date
    })(),
    color: '#F97316',
    description: 'New feature design sprint',
  },
  {
    id: '29',
    title: 'Lunch Break',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 4)
      date.setHours(12, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 4)
      date.setHours(13, 0, 0, 0)
      return date
    })(),
    color: '#059669',
    description: '',
  },
  {
    id: '30',
    title: 'Performance Reviews',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 4)
      date.setHours(13, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 4)
      date.setHours(15, 0, 0, 0)
      return date
    })(),
    color: '#7C3AED',
    description: 'Mid-year performance reviews',
  },
  {
    id: '31',
    title: 'Security Training',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 4)
      date.setHours(15, 30, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 4)
      date.setHours(16, 30, 0, 0)
      return date
    })(),
    color: '#BE185D',
    description: 'Annual security awareness',
  },
  {
    id: '32',
    title: 'Team Retrospective',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 4)
      date.setHours(16, 30, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 4)
      date.setHours(17, 30, 0, 0)
      return date
    })(),
    color: '#0891B2',
    description: 'Sprint retrospective',
  },
  // Add some events to the conference days to show all-day + regular events
  {
    id: '33',
    title: 'Conference Keynote',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      date.setHours(9, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      date.setHours(10, 30, 0, 0)
      return date
    })(),
    color: '#1E40AF',
    description: 'Opening keynote speech',
  },
  {
    id: '34',
    title: 'Workshop: Modern React',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      date.setHours(11, 0, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      date.setHours(12, 30, 0, 0)
      return date
    })(),
    color: '#15803D',
    description: 'React 19 new features',
  },
  {
    id: '35',
    title: 'Networking Lunch',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      date.setHours(12, 30, 0, 0)
      return date
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      date.setHours(14, 0, 0, 0)
      return date
    })(),
    color: '#B91C1C',
    description: 'Meet other attendees',
  },
]

function CalendarPage() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Calendar Demo</h2>
            <p className='text-muted-foreground'>
              Headless calendar system with multiple view modes
            </p>
          </div>
        </div>

        <div className='space-y-6'>
          {/* Feature Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Headless Calendar Features</CardTitle>
              <CardDescription>
                A flexible, composable calendar system that provides logic
                without UI opinions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <div className='space-y-2'>
                  <CalendarDays className='h-8 w-8 text-blue-500' />
                  <h3 className='font-semibold'>Multiple Views</h3>
                  <p className='text-muted-foreground text-sm'>
                    Month, week, day, and list views
                  </p>
                </div>
                <div className='space-y-2'>
                  <CalendarRange className='h-8 w-8 text-green-500' />
                  <h3 className='font-semibold'>Date Selection</h3>
                  <p className='text-muted-foreground text-sm'>
                    Single, range, and multiple selection modes
                  </p>
                </div>
                <div className='space-y-2'>
                  <Clock className='h-8 w-8 text-purple-500' />
                  <h3 className='font-semibold'>Event Positioning</h3>
                  <p className='text-muted-foreground text-sm'>
                    Smart layout prevents overlaps
                  </p>
                </div>
                <div className='space-y-2'>
                  <List className='h-8 w-8 text-orange-500' />
                  <h3 className='font-semibold'>Fully Typed</h3>
                  <p className='text-muted-foreground text-sm'>
                    Complete TypeScript support
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Views */}
          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-semibold'>Calendar Views</h3>
              <p className='text-muted-foreground text-sm'>
                Switch between different calendar view modes using the header
                controls
              </p>
            </div>
            <UnifiedCalendar
              events={sampleEvents}
              onDateSelect={() => {
                // Handle date selection
              }}
            />
          </div>

          {/* Usage Example */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Example</CardTitle>
              <CardDescription>
                How to use the headless calendar hooks in your components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className='bg-muted overflow-x-auto rounded-lg p-4'>
                <code>{`import { useCalendarCore, useMonthView } from '@/features/calendar'

function MyCalendar() {
  const { currentDate, next, previous } = useCalendarCore()
  const { weeks } = useMonthView(currentDate)
  
  return (
    <div>
      <button onClick={previous}>Previous</button>
      <button onClick={next}>Next</button>
      
      {weeks.map((week) => (
        <div key={week.weekNumber}>
          {week.days.map((day) => (
            <div key={day.date.toISOString()}>
              {day.date.getDate()}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}`}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}

export const Route = createFileRoute('/admin/_authenticated/calendar/')({
  component: CalendarPage,
})
