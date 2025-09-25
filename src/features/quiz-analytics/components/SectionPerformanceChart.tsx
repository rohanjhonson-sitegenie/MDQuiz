// Section Performance Bar Chart - Compares average scores across sections

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import type { SectionAnalytics } from '../types/section-analytics.types'

interface SectionPerformanceChartProps {
  sections: SectionAnalytics[]
}

export function SectionPerformanceChart({ sections }: SectionPerformanceChartProps) {
  if (sections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Section Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No section data available</p>
        </CardContent>
      </Card>
    )
  }

  const maxScore = Math.max(...sections.map(s => s.avg_score_percentage))
  const sortedSections = [...sections].sort((a, b) => a.order_index - b.order_index)


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Section Performance Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedSections.map((section) => {
            const percentage = section.avg_score_percentage
            const widthPercentage = maxScore > 0 ? (percentage / maxScore) * 100 : 0
            const color = percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'


            return (
              <div key={section.section_id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate flex-1 mr-4">
                    {section.section_title}
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    {percentage.toFixed(1)}% avg
                  </span>
                </div>
                <div className="w-full h-8 bg-muted rounded-md overflow-hidden">
                  <div
                    className={`h-full ${color} transition-all duration-500 ease-out flex items-center justify-end px-2`}
                    style={{ width: `${widthPercentage}%` }}
                  >
                    {widthPercentage > 20 && (
                      <span className="text-xs font-medium text-white">
                        {section.correct_answers_count}/{section.total_questions_answered} correct
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span>≥80%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded" />
            <span>60-79%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span>&lt;60%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}