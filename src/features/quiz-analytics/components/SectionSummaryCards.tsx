// Section Summary Cards - Key metrics at a glance for each section

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import type { SectionAnalytics } from '../types/section-analytics.types'

interface SectionSummaryCardsProps {
  sections: SectionAnalytics[]
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function SectionSummaryCards({ sections }: SectionSummaryCardsProps) {
  if (sections.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No section data available</p>
      </div>
    )
  }

  const sortedSections = [...sections].sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedSections.map((section) => {
        const scoreColor = section.avg_score_percentage >= 80
          ? 'text-green-600'
          : section.avg_score_percentage >= 60
            ? 'text-yellow-600'
            : 'text-red-600'

        const passRateColor = section.pass_rate >= 75
          ? 'bg-green-100 text-green-800'
          : section.pass_rate >= 50
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'

        return (
          <Card key={section.section_id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              {/* Section Title & Order */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      Section {section.order_index + 1}
                    </Badge>
                    {section.timeout_count > 0 && (
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                    )}
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2">
                    {section.section_title}
                  </h3>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-3">
                {/* Average Score */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Avg Score</span>
                  </div>
                  <span className={`text-lg font-bold ${scoreColor}`}>
                    {section.avg_score_percentage.toFixed(1)}%
                  </span>
                </div>

                {/* Completions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4" />
                    <span>Completions</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {section.total_completions} / {section.total_attempts}
                  </span>
                </div>

                {/* Average Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Avg Time</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">
                      {formatTime(Math.round(section.avg_time_seconds))}
                    </span>
                    {section.time_limit_seconds && (
                      <span className="text-xs text-muted-foreground ml-1">
                        / {formatTime(section.time_limit_seconds)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pass Rate */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Pass Rate</span>
                  </div>
                  <Badge variant="secondary" className={passRateColor}>
                    {section.pass_rate.toFixed(0)}%
                  </Badge>
                </div>

                {/* Timeout Info */}
                {section.timeout_count > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-orange-600">Timeouts</span>
                      <span className="font-medium text-orange-600">
                        {section.timeout_count} ({section.timeout_rate.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}