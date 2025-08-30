import { getEventTypeColor, type EventType } from './event-type-colors'
import { eventTypeLegend } from './event-type-legend-config'

export function EventTypeLegend() {
  return (
    <div className='flex flex-wrap justify-center gap-4 text-xs'>
      {(
        Object.entries(eventTypeLegend) as [
          EventType,
          (typeof eventTypeLegend)[EventType],
        ][]
      ).map(([type, config]) => (
        <div key={type} className='flex items-center gap-1.5'>
          <div
            className='size-2 rounded-full'
            style={{
              backgroundColor: getEventTypeColor(type),
              boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <span>{config.label}</span>
        </div>
      ))}
    </div>
  )
}
