// Section Analytics Types for Sectioned Quizzes

export interface SectionAnalytics {
  section_id: string
  section_title: string
  order_index: number

  // Performance metrics
  total_attempts: number
  total_completions: number
  avg_score_percentage: number
  pass_count: number
  pass_rate: number

  // Timing metrics
  avg_time_seconds: number
  time_limit_seconds: number | null
  time_utilization_percentage: number
  timeout_count: number
  timeout_rate: number

  // Question breakdown
  question_count: number
  correct_answers_count: number
  total_questions_answered: number
  question_type_breakdown: QuestionTypeBreakdown

  // Advanced metrics
  fastest_time_seconds: number
  slowest_time_seconds: number
  median_time_seconds: number
}

export interface QuestionTypeBreakdown {
  multiple_choice?: {
    count: number
    avg_score: number
    total_attempts: number
  }
  true_false?: {
    count: number
    avg_score: number
    total_attempts: number
  }
  text_input?: {
    count: number
    avg_score: number
    total_attempts: number
  }
}

export interface SectionCompletionFunnelData {
  section_id: string
  section_title: string
  order_index: number
  started_count: number
  completed_count: number
  completion_rate: number
  drop_off_count: number
}

export interface SectionTimeUtilization {
  section_id: string
  section_title: string
  time_allocated_seconds: number | null
  time_used_seconds: number
  utilization_percentage: number
  overtime_count: number
  timeout_count: number
}

export interface SectionPerformanceComparison {
  sections: Array<{
    section_id: string
    section_title: string
    avg_score: number
    order_index: number
  }>
}