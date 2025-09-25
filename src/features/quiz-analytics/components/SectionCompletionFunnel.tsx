// Section Completion Funnel - Shows drop-off rates between sections

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingDown, ChevronRight } from 'lucide-react'
import type { SectionCompletionFunnelData } from '../types/section-analytics.types'

interface SectionCompletionFunnelProps {
  funnelData: SectionCompletionFunnelData[]
  totalStarted: number
}

export function SectionCompletionFunnel({ funnelData, totalStarted }: SectionCompletionFunnelProps) {
  if (funnelData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Section Completion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No funnel data available</p>
        </CardContent>
      </Card>
    )
  }

  const sortedData = [...funnelData].sort((a, b) => a.order_index - b.order_index)
  const maxWidth = totalStarted

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Section Completion Funnel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {sortedData.map((stage, index) => {
            const widthPercentage = maxWidth > 0 ? (stage.started_count / maxWidth) * 100 : 0
            const completionRate = stage.completion_rate

            return (
              <div key={stage.section_id}>
                {/* Funnel Stage */}
                <div
                  className="relative py-4 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded transition-all duration-300 hover:shadow-lg"
                  style={{
                    width: `${Math.max(widthPercentage, 20)}%`,
                    marginLeft: index > 0 ? `${(100 - widthPercentage) / 2}%` : '0'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{stage.section_title}</p>
                      <p className="text-xs opacity-90">
                        {stage.started_count} started
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{stage.completed_count}</p>
                      <p className="text-xs opacity-90">completed</p>
                    </div>
                  </div>

                  {/* Completion Rate Badge */}
                  <div className="absolute -bottom-2 right-4 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold shadow">
                    {completionRate.toFixed(0)}% complete
                  </div>
                </div>

                {/* Drop-off Indicator */}
                {index < sortedData.length - 1 && stage.drop_off_count > 0 && (
                  <div className="flex items-center justify-center py-1 text-xs text-muted-foreground">
                    <ChevronRight className="h-3 w-3" />
                    <span className="ml-1">
                      {stage.drop_off_count} dropped ({((stage.drop_off_count / stage.started_count) * 100).toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Completion Rate</span>
            <span className="font-semibold">
              {totalStarted > 0
                ? ((sortedData[sortedData.length - 1]?.completed_count || 0) / totalStarted * 100).toFixed(1)
                : 0}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}