// Section Time Utilization Stacked Bar - Shows allocated vs used time

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import type { SectionTimeUtilization } from '../types/section-analytics.types'

interface SectionTimeUtilizationChartProps {
  utilizationData: SectionTimeUtilization[]
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function SectionTimeUtilizationChart({ utilizationData }: SectionTimeUtilizationChartProps) {
  if (utilizationData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Utilization by Section
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No time data available</p>
        </CardContent>
      </Card>
    )
  }

  const sortedData = [...utilizationData].sort((a, b) =>
    (a.section_title || '').localeCompare(b.section_title || '')
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Utilization by Section
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedData.map((section) => {
            const hasTimeLimit = section.time_allocated_seconds !== null && section.time_allocated_seconds > 0
            const usedPercentage = hasTimeLimit
              ? Math.min((section.time_used_seconds / section.time_allocated_seconds!) * 100, 100)
              : 0
            const overtimePercentage = hasTimeLimit && section.time_used_seconds > section.time_allocated_seconds!
              ? ((section.time_used_seconds - section.time_allocated_seconds!) / section.time_allocated_seconds!) * 100
              : 0

            return (
              <div key={section.section_id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate flex-1 mr-4">
                    {section.section_title}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {hasTimeLimit && (
                      <span>
                        Limit: {formatTime(section.time_allocated_seconds!)}
                      </span>
                    )}
                    <span>
                      Avg: {formatTime(Math.round(section.time_used_seconds))}
                    </span>
                  </div>
                </div>

                {/* Stacked Bar */}
                <div className="relative h-10 bg-muted rounded-md overflow-hidden">
                  {hasTimeLimit ? (
                    <>
                      {/* Used Time */}
                      <div
                        className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${Math.min(usedPercentage, 100)}%` }}
                      />

                      {/* Overtime (if applicable) */}
                      {overtimePercentage > 0 && (
                        <div
                          className="absolute h-full bg-red-500 transition-all duration-500"
                          style={{
                            left: '100%',
                            width: `${overtimePercentage}%`
                          }}
                        />
                      )}

                      {/* Time Limit Marker */}
                      <div className="absolute left-0 top-0 h-full w-full border-r-2 border-dashed border-gray-400" />

                      {/* Labels */}
                      <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium">
                        <span className={usedPercentage > 30 ? 'text-white' : 'text-gray-700'}>
                          {section.utilization_percentage.toFixed(0)}% used
                        </span>
                        {section.timeout_count > 0 && (
                          <span className="text-red-100 bg-red-600 px-2 py-0.5 rounded">
                            {section.timeout_count} timeouts
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    // No time limit
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                      No time limit
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span>Time Used</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span>Overtime</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-dashed border-gray-400 rounded" />
            <span>Time Limit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}