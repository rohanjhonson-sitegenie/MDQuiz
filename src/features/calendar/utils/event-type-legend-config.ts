import type { EventType } from './event-type-colors'

// Legend configuration
export const eventTypeLegend: Record<EventType, { label: string }> = {
  class: { label: 'Class' },
  meeting: { label: 'Meeting' },
  appointment: { label: 'Appointment' },
  deadline: { label: 'Deadline' },
  tournament: { label: 'Tournament' },
  holiday: { label: 'Holiday' },
  personal: { label: 'Personal' },
  scrimmage: { label: 'Scrimmage' },
}
