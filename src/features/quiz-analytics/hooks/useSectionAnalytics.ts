// Hook to fetch and calculate section-wise analytics for sectioned quizzes

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase-client'
import { calculateSectionScore } from '@/lib/scoring-utils'
import type { SectionAnalytics, SectionCompletionFunnelData, SectionTimeUtilization } from '../types/section-analytics.types'

interface UseSectionAnalyticsReturn {
  sectionAnalytics: SectionAnalytics[]
  funnelData: SectionCompletionFunnelData[]
  timeUtilizationData: SectionTimeUtilization[]
  isLoading: boolean
  error: string | null
  totalStarted: number
}

export function useSectionAnalytics(quizId: string): UseSectionAnalyticsReturn {
  const [sectionAnalytics, setSectionAnalytics] = useState<SectionAnalytics[]>([])
  const [funnelData, setFunnelData] = useState<SectionCompletionFunnelData[]>([])
  const [timeUtilizationData, setTimeUtilizationData] = useState<SectionTimeUtilization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalStarted, setTotalStarted] = useState(0)

  const loadSectionAnalytics = useCallback(async () => {
    if (!quizId) return

    setIsLoading(true)
    setError(null)

    try {
      // Check if quiz is sectioned
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('settings')
        .eq('id', quizId)
        .single()

      if (quizError) throw quizError

      const structureType = quiz?.settings?.structure_type

      if (structureType !== 'sectioned') {
        // Check if sections exist even if structure_type is not set
        const { data: sectionsCheck } = await supabase
          .from('quiz_sections')
          .select('id')
          .eq('quiz_id', quizId)
          .limit(1)

        if (!sectionsCheck || sectionsCheck.length === 0) {
          setSectionAnalytics([])
          setFunnelData([])
          setTimeUtilizationData([])
          setTotalStarted(0)
          return
        }
      }

      // Fetch sections with questions
      const { data: sections, error: sectionsError } = await supabase
        .from('quiz_sections')
        .select(`
          id,
          title,
          order_index,
          settings,
          questions (
            id,
            question_type,
            answer_data,
            options
          )
        `)
        .eq('quiz_id', quizId)
        .order('order_index')

      if (sectionsError) {
        throw sectionsError
      }

      if (!sections || sections.length === 0) {
        setSectionAnalytics([])
        setFunnelData([])
        setTimeUtilizationData([])
        return
      }

      // Fetch all responses for the quiz
      const { data: responses, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .eq('quiz_id', quizId)

      if (responsesError) throw responsesError

      // Calculate analytics for each section
      const analyticsData: SectionAnalytics[] = []
      const funnelDataArray: SectionCompletionFunnelData[] = []
      const timeUtilArray: SectionTimeUtilization[] = []

      let previousSectionCompletions = responses?.length || 0
      setTotalStarted(previousSectionCompletions)

      for (const section of sections) {
        const sectionQuestions = section.questions || []
        const sectionQuestionIds = sectionQuestions.map(q => q.id)

        // Calculate section-specific metrics from responses
        let totalAttempts = 0
        let totalCompletions = 0
        let totalScore = 0
        let totalTime = 0
        let timeoutCount = 0
        let passCount = 0
        let timeSamples: number[] = []

        // Calculate section-level metrics across all responses
        let totalSectionCorrectAnswers = 0
        let totalSectionQuestions = 0
        let sectionTotalQuestions = sectionQuestions.length

        // Process all responses that have answers for this section
        const sectionResponses = responses?.filter(r => {
          const answers = r.answers || {}
          return sectionQuestions.some(q => q.id in answers)
        }) || []

        totalAttempts = sectionResponses.length

        if (sectionResponses.length > 0) {
          let totalSectionScores = 0

          sectionResponses.forEach(response => {
            const answers = response.answers || {}
            let responseCorrectAnswers = 0
            let responseAnsweredQuestions = 0

            // Count correct answers for this response in this section
            sectionQuestions.forEach(question => {
              if (question.id in answers) {
                responseAnsweredQuestions++
                if (isAnswerCorrect(question, answers[question.id])) {
                  responseCorrectAnswers++
                }
              }
            })

            // Calculate percentage for this response
            const responsePercentage = responseAnsweredQuestions > 0 ? (responseCorrectAnswers / responseAnsweredQuestions) * 100 : 0
            totalSectionScores += responsePercentage

            // Accumulate totals across all responses
            totalSectionCorrectAnswers += responseCorrectAnswers
            totalSectionQuestions += responseAnsweredQuestions

            // Check if this response completed the section (all questions answered)
            if (responseAnsweredQuestions === sectionTotalQuestions) {
              totalCompletions++
            }

            // Check pass rate (assuming 60% is passing)
            if (responsePercentage >= 60) {
              passCount++
            }
          })

          // Calculate overall score as percentage of total correct answers
          const totalPossibleAnswers = sectionResponses.length * sectionTotalQuestions
          totalScore = totalPossibleAnswers > 0 ? (totalSectionCorrectAnswers / totalPossibleAnswers) * 100 : 0

        }

        // Helper function to check if answer is correct (same logic as QuizResponseTable)
        function isAnswerCorrect(question: any, userAnswer: unknown): boolean {
          if (question.question_type === 'multiple_choice') {
            const options = question.options as { correct_index?: number }
            return userAnswer === options?.correct_index
          }
          if (question.question_type === 'true_false') {
            const answerData = question.answer_data as { correct_answer?: boolean }
            return userAnswer === answerData?.correct_answer
          }
          if (question.question_type === 'text_input') {
            const answerData = question.answer_data as { correct_answer?: string }
            return String(userAnswer || '').toLowerCase().trim() === (answerData?.correct_answer || '').toLowerCase().trim()
          }
          return false
        }

        const avgScore = totalAttempts > 0 ? totalScore / totalAttempts : 0
        const avgTime = timeSamples.length > 0
          ? timeSamples.reduce((a, b) => a + b, 0) / timeSamples.length
          : 0
        const passRate = totalAttempts > 0 ? (passCount / totalAttempts) * 100 : 0
        const timeLimit = section.settings?.time_limit_minutes ? section.settings.time_limit_minutes * 60 : null
        const timeUtilization = timeLimit && avgTime > 0 ? (avgTime / timeLimit) * 100 : 0

        // Section Analytics
        analyticsData.push({
          section_id: section.id,
          section_title: section.title,
          order_index: section.order_index,
          total_attempts: totalAttempts,
          total_completions: totalCompletions,
          avg_score_percentage: totalScore,
          pass_count: passCount,
          pass_rate: passRate,
          avg_time_seconds: avgTime,
          time_limit_seconds: timeLimit,
          time_utilization_percentage: timeUtilization,
          timeout_count: timeoutCount,
          timeout_rate: totalAttempts > 0 ? (timeoutCount / totalAttempts) * 100 : 0,
          question_count: sectionQuestions.length,
          correct_answers_count: totalSectionCorrectAnswers,
          total_questions_answered: totalSectionQuestions,
          question_type_breakdown: {
            multiple_choice: {
              count: sectionQuestions.filter(q => q.question_type === 'multiple_choice').length,
              avg_score: 0,
              total_attempts: 0
            },
            true_false: {
              count: sectionQuestions.filter(q => q.question_type === 'true_false').length,
              avg_score: 0,
              total_attempts: 0
            },
            text_input: {
              count: sectionQuestions.filter(q => q.question_type === 'text_input').length,
              avg_score: 0,
              total_attempts: 0
            }
          },
          fastest_time_seconds: 0,
          slowest_time_seconds: 0,
          median_time_seconds: 0
        })

        // Funnel Data
        const dropOffCount = previousSectionCompletions - totalCompletions
        funnelDataArray.push({
          section_id: section.id,
          section_title: section.title,
          order_index: section.order_index,
          started_count: previousSectionCompletions,
          completed_count: totalCompletions,
          completion_rate: previousSectionCompletions > 0
            ? (totalCompletions / previousSectionCompletions) * 100
            : 0,
          drop_off_count: dropOffCount
        })

        // Time Utilization Data
        timeUtilArray.push({
          section_id: section.id,
          section_title: section.title,
          time_allocated_seconds: timeLimit,
          time_used_seconds: avgTime,
          utilization_percentage: timeUtilization,
          overtime_count: 0,
          timeout_count: timeoutCount
        })

        previousSectionCompletions = totalCompletions
      }

      setSectionAnalytics(analyticsData)
      setFunnelData(funnelDataArray)
      setTimeUtilizationData(timeUtilArray)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load section analytics'
      setError(errorMessage)
      console.error('Section analytics error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [quizId])

  useEffect(() => {
    loadSectionAnalytics()
  }, [loadSectionAnalytics])

  return {
    sectionAnalytics,
    funnelData,
    timeUtilizationData,
    isLoading,
    error,
    totalStarted
  }
}