// Custom hooks for quiz data management
// Provides data fetching and submission functions for quiz operations

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase-client'
import { generateQuizSlug } from '@/lib/markdown-quiz-parser'

export interface PublicQuiz {
  id: string
  title: string
  description?: string
  questions: PublicQuestion[]
  sections?: PublicSection[]
  settings: Record<string, unknown>
  structure_type?: 'mixed' | 'sectioned'
}

export interface PublicSection {
  id: string
  title: string
  description?: string
  order_index: number
  questions: PublicQuestion[]
}

export interface PublicQuestion {
  id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'text_input'
  options: Record<string, unknown>
  order_index: number
  section_id?: string
}

export interface QuizAnswers {
  [questionId: string]: unknown
}

export interface SubmissionResult {
  success: boolean
  responseId?: string
  error?: string
}

export function useQuizData() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getPublishedQuiz = useCallback(async (slug: string): Promise<PublicQuiz | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch all published quizzes with both questions and sections
      const { data: quizzesData, error: quizError } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          settings,
          questions (
            id,
            question_text,
            question_type,
            question_content,
            options,
            answer_data,
            order_index,
            section_id
          ),
          sections:quiz_sections (
            id,
            title,
            description,
            order_index,
            questions (
              id,
              question_text,
              question_type,
              question_content,
              options,
              answer_data,
              order_index,
              section_id
            )
          )
        `)
        .eq('published', true)

      if (quizError) {
        throw new Error(quizError.message)
      }

      if (!quizzesData || quizzesData.length === 0) {
        return null
      }

      // Find quiz by generated slug (convert title to slug format)
      const targetQuiz = quizzesData.find(quiz => {
        const generatedSlug = generateQuizSlug(quiz.title)
        return generatedSlug === slug
      })

      if (!targetQuiz) {
        console.error('Quiz not found for slug:', slug)
        return null
      }

      const quizData = targetQuiz

      if (!quizData.id) {
        console.error('Quiz data missing ID:', quizData)
        throw new Error('Quiz data is incomplete - missing ID')
      }

      const settings = quizData.settings || {}
      const structureType = settings.structure_type as 'mixed' | 'sectioned' || 'mixed'

      // Handle sectioned vs mixed structure
      let allQuestions: any[] = []
      let sections: any[] = []

      if (structureType === 'sectioned' && quizData.sections && quizData.sections.length > 0) {
        // For sectioned quizzes, organize questions by sections
        sections = (quizData.sections || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((section: any) => ({
            ...section,
            questions: (section.questions || []).sort((a: any, b: any) => a.order_index - b.order_index)
          }))

        // Flatten all questions for compatibility
        allQuestions = sections.flatMap(section => section.questions || [])
      } else {
        // For mixed quizzes, use direct questions
        allQuestions = (quizData.questions || []).sort(
          (a: any, b: any) => a.order_index - b.order_index
        )
      }

      return {
        id: quizData.id,
        title: quizData.title,
        description: quizData.description,
        settings: settings,
        structure_type: structureType,
        questions: allQuestions,
        sections: sections.length > 0 ? sections : undefined
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load quiz'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const submitQuizResponse = useCallback(async (
    quizId: string,
    answers: QuizAnswers,
    sessionId: string,
    respondentName?: string | null,
    respondentEmail?: string | null
  ): Promise<SubmissionResult> => {
    console.log('=== submitQuizResponse called ===')
    console.log('quizId:', quizId)
    console.log('answers:', answers)
    console.log('sessionId:', sessionId)

    setIsLoading(true)
    setError(null)

    try {
      console.log('Inserting into responses table...')
      const { data, error: submitError } = await supabase
        .from('responses')
        .insert({
          quiz_id: quizId,
          session_id: sessionId,
          answers: answers,
          respondent_name: respondentName || null,
          respondent_email: respondentEmail || null
        })
        .select('id')
        .single()

      console.log('Insert response:', { data, error: submitError })

      if (submitError) {
        console.error('Supabase insert error:', submitError)
        throw new Error(submitError.message)
      }

      console.log('Response submitted successfully, ID:', data?.id)

      return {
        success: true,
        responseId: data?.id
      }
    } catch (err) {
      console.error('Exception in submitQuizResponse:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit quiz'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    getPublishedQuiz,
    submitQuizResponse
  }
}