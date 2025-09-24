import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, PieChartIcon, BarChart3 } from 'lucide-react'

interface TrendDataPoint {
  date: string
  count: number
}

interface QuestionStat {
  questionId: string
  questionText: string
  percentage: number
  correctCount: number
  totalCount: number
}

interface AnalyticsChartsGridProps {
  trendData: TrendDataPoint[]
  questionStats: QuestionStat[]
}

const COLORS = [
  'hsl(142, 76%, 36%)', // Green
  'hsl(48, 96%, 53%)',  // Yellow
  'hsl(0, 84%, 60%)',   // Red
  'hsl(217, 91%, 60%)', // Blue
  'hsl(271, 91%, 65%)', // Purple
  'hsl(24, 95%, 53%)',  // Orange
  'hsl(173, 80%, 40%)', // Teal
]

const getBarColor = (percentage: number) => {
  if (percentage >= 80) return 'hsl(142, 76%, 36%)'
  if (percentage >= 60) return 'hsl(48, 96%, 53%)'
  return 'hsl(0, 84%, 60%)'
}

export function AnalyticsChartsGrid({ trendData, questionStats }: AnalyticsChartsGridProps) {
  // TEMPORARY: Add mock data to show 10 dates
  const mockTrendData = [
    { date: '9/15/2025', count: 3 },
    { date: '9/16/2025', count: 5 },
    { date: '9/17/2025', count: 8 },
    { date: '9/18/2025', count: 4 },
    { date: '9/19/2025', count: 12 },
    { date: '9/20/2025', count: 15 },
    { date: '9/21/2025', count: 9 },
    { date: '9/22/2025', count: 11 },
    { date: '9/23/2025', count: 7 },
    { date: '9/24/2025', count: 14 }
  ]

  const displayTrendData = mockTrendData.length > 0 ? mockTrendData : trendData
  const hasTrendData = displayTrendData.length > 0
  const hasQuestionData = questionStats.length > 0

  const pieChartData = questionStats.map((item, index) => ({
    name: `Q${index + 1}`,
    value: item.percentage,
    fullQuestion: item.questionText,
    stats: `${item.correctCount}/${item.totalCount}`,
    percentage: item.percentage
  }))

  const averagePerformance = hasQuestionData
    ? questionStats.reduce((sum, q) => sum + q.percentage, 0) / questionStats.length
    : 0

  if (!hasTrendData && !hasQuestionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BarChart3 className='h-5 w-5 text-muted-foreground' />
            Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6 text-center text-muted-foreground'>
          <p>No analytics data available yet</p>
          <p className='text-xs mt-1'>Charts will appear once users submit responses</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <BarChart3 className='h-5 w-5 text-muted-foreground' />
          Analytics Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
              <h4 className='text-sm font-medium'>Response Trend</h4>
            </div>
            {hasTrendData ? (
              <ResponsiveContainer width='100%' height={250}>
                <LineChart data={displayTrendData}>
                  <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                  <XAxis
                    dataKey='date'
                    className='text-xs'
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className='text-xs'
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line
                    type='monotone'
                    dataKey='count'
                    stroke='hsl(var(--primary))'
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-[250px] flex items-center justify-center text-sm text-muted-foreground'>
                No response data yet
              </div>
            )}
          </div>

          <div>
            <div className='flex items-center gap-2 mb-4'>
              <PieChartIcon className='h-4 w-4 text-muted-foreground' />
              <h4 className='text-sm font-medium'>Question Performance</h4>
            </div>
            {hasQuestionData ? (
              <>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percentage }) => `${percentage.toFixed(0)}%`}
                      outerRadius={100}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null
                        const item = payload[0].payload
                        return (
                          <div className='bg-card border border-border rounded-lg p-3 shadow-lg max-w-[250px]'>
                            <p className='font-medium text-sm mb-1'>{item.name}</p>
                            <p className='text-xs text-muted-foreground mb-2 line-clamp-2'>
                              {item.fullQuestion}
                            </p>
                            <div className='space-y-1'>
                              <p className='text-sm font-semibold'>
                                {item.percentage.toFixed(1)}% correct
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                {item.stats} responses
                              </p>
                            </div>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className='text-center text-sm text-muted-foreground'>
                  📊 Average: {averagePerformance.toFixed(1)}%
                </div>
              </>
            ) : (
              <div className='h-[300px] flex items-center justify-center text-sm text-muted-foreground'>
                No performance data yet
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}