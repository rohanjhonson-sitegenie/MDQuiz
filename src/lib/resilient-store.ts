// Resilient quiz store - handles errors gracefully with fallbacks
// Focuses on user experience over strict validation

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SimpleQuiz, SimpleQuestion, safeDisplayText } from './simple-types'
import { SimpleQuizRepository, markdownToSimpleQuiz, simpleQuizToMarkdown } from './simple-repository'

interface ResilientQuizStore {
  // State
  quizzes: SimpleQuiz[]
  selectedQuiz: SimpleQuiz | null
  selectedQuizId: string | null
  markdownContent: string
  isLoading: boolean
  error: string | null
  warnings: string[]

  // Actions
  loadQuizzes: () => Promise<void>
  loadQuiz: (id: string) => Promise<void>
  saveQuiz: () => Promise<void>
  createQuiz: () => Promise<void>
  setMarkdownContent: (content: string) => void
  clearError: () => void
  clearWarnings: () => void
}

export function createResilientQuizStore(supabase: SupabaseClient) {
  const repository = new SimpleQuizRepository(supabase)

  return create<ResilientQuizStore>()(
    devtools(
      (set, get) => ({
        // Initial state
        quizzes: [],
        selectedQuiz: null,
        selectedQuizId: null,
        markdownContent: '',
        isLoading: false,
        error: null,
        warnings: [],

        // Load quizzes with error tolerance
        loadQuizzes: async () => {
          try {
            set({ isLoading: true, error: null })

            const { data, error } = await supabase
              .from('quizzes')
              .select('*')
              .order('updated_at', { ascending: false })

            if (error) {
              throw new Error(error.message)
            }

            // Normalize data with fallbacks
            const normalizedQuizzes = (data || []).map((quiz: any) => ({
              id: quiz.id,
              title: quiz.title || 'Untitled Quiz',
              description: quiz.description || '',
              category_id: quiz.category_id,
              settings: safeParseObject(quiz.settings),
              published: Boolean(quiz.published),
              questions: [], // Load questions on demand
              sections: [], // Load sections on demand
              created_at: quiz.created_at,
              updated_at: quiz.updated_at
            }))

            set({ quizzes: normalizedQuizzes })
          } catch (error) {
            console.error('Failed to load quizzes:', error)
            set({
              error: `Failed to load quizzes: ${error instanceof Error ? error.message : 'Unknown error'}`,
              quizzes: [] // Fallback to empty array
            })
          } finally {
            set({ isLoading: false })
          }
        },

        // Load individual quiz with maximum error tolerance
        loadQuiz: async (id: string) => {
          try {
            set({ isLoading: true, error: null, warnings: [] })

            const quiz = await repository.getQuiz(id)

            if (!quiz) {
              throw new Error('Quiz not found')
            }

            // Convert to markdown with error handling
            let markdown = ''
            const warnings: string[] = []

            try {
              markdown = simpleQuizToMarkdown(quiz)
            } catch (markdownError) {
              console.warn('Markdown conversion failed, using fallback:', markdownError)
              markdown = `# ${quiz.title}\n\n*Unable to convert quiz to markdown. Edit mode may be limited.*\n\n`
              warnings.push('Quiz markdown conversion had issues - some features may not work correctly')
            }

            set({
              selectedQuiz: quiz,
              selectedQuizId: id,
              markdownContent: markdown,
              warnings
            })

          } catch (error) {
            console.error('Failed to load quiz:', error)
            set({
              error: `Failed to load quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
              selectedQuiz: null,
              selectedQuizId: null,
              markdownContent: ''
            })
          } finally {
            set({ isLoading: false })
          }
        },

        // Save quiz with progressive fallbacks
        saveQuiz: async () => {
          try {
            const { selectedQuizId, markdownContent, selectedQuiz } = get()

            if (!selectedQuizId || !selectedQuiz) {
              throw new Error('No quiz selected')
            }

            set({ isLoading: true, error: null, warnings: [] })

            // Try to parse markdown with fallbacks
            let quizData: SimpleQuiz
            const warnings: string[] = []

            try {
              quizData = markdownToSimpleQuiz(markdownContent)
              // Preserve existing metadata
              quizData.id = selectedQuiz.id
              quizData.category_id = selectedQuiz.category_id
              quizData.published = selectedQuiz.published
              quizData.created_at = selectedQuiz.created_at
            } catch (parseError) {
              console.warn('Markdown parsing failed, using existing data with title update:', parseError)
              warnings.push('Some markdown changes could not be parsed - only basic updates applied')

              // Fallback: just update title if we can extract it
              const titleMatch = markdownContent.match(/^#\s+(.+)$/m)
              quizData = {
                ...selectedQuiz,
                title: titleMatch ? titleMatch[1].trim() : selectedQuiz.title
              }
            }

            // Save with error tolerance
            const savedQuiz = await repository.saveQuiz(selectedQuizId, quizData)

            if (savedQuiz) {
              set({
                selectedQuiz: savedQuiz,
                warnings
              })

              // Refresh quiz list in background (don't block on errors)
              get().loadQuizzes().catch(console.warn)
            } else {
              warnings.push('Quiz was saved but confirmation failed - please refresh')
              set({ warnings })
            }

          } catch (error) {
            console.error('Failed to save quiz:', error)
            set({
              error: `Failed to save quiz: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
          } finally {
            set({ isLoading: false })
          }
        },

        // Create quiz with simple defaults
        createQuiz: async () => {
          try {
            set({ isLoading: true, error: null })

            const { data: newQuiz, error } = await supabase
              .from('quizzes')
              .insert({
                title: 'New Quiz',
                description: '',
                settings: { structure_type: 'mixed' },
                published: false
              })
              .select()
              .single()

            if (error) {
              throw new Error(error.message)
            }

            const simpleQuiz: SimpleQuiz = {
              id: newQuiz.id,
              title: newQuiz.title,
              description: newQuiz.description || '',
              settings: newQuiz.settings || {},
              published: false,
              questions: [],
              sections: [],
              created_at: newQuiz.created_at,
              updated_at: newQuiz.updated_at
            }

            // Add to list and select
            set(state => ({
              quizzes: [simpleQuiz, ...state.quizzes],
              selectedQuiz: simpleQuiz,
              selectedQuizId: newQuiz.id,
              markdownContent: `# ${simpleQuiz.title}\n\n## Q1\nYour first question here\n\n- [ ] Option A\n- [x] Option B\n- [ ] Option C\n\n`
            }))

          } catch (error) {
            console.error('Failed to create quiz:', error)
            set({
              error: `Failed to create quiz: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
          } finally {
            set({ isLoading: false })
          }
        },

        // Simple setters
        setMarkdownContent: (content: string) => {
          set({ markdownContent: content })
        },

        clearError: () => {
          set({ error: null })
        },

        clearWarnings: () => {
          set({ warnings: [] })
        }
      }),
      { name: 'resilient-quiz-store' }
    )
  )
}

// Utility function for safe object parsing
function safeParseObject(value: any): Record<string, any> {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return typeof parsed === 'object' && parsed !== null ? parsed : {}
    } catch {
      return {}
    }
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value
  }
  return {}
}

// Component helper for safe display
export function QuizDisplayHelper(quiz: SimpleQuiz) {
  return {
    title: quiz.title || 'Untitled Quiz',
    questionCount: quiz.questions?.length || 0,
    status: quiz.published ? 'Published' : 'Draft',
    lastUpdated: quiz.updated_at
      ? new Date(quiz.updated_at).toLocaleDateString()
      : 'Unknown',

    // Safe question display
    getQuestionSummary: (question: SimpleQuestion) => ({
      text: question.question_text || 'No question text',
      type: question.question_type || 'multiple_choice',
      optionsText: safeDisplayText(question.options)
    }),

    // Check if quiz has issues
    hasIssues: () => {
      return !quiz.title?.trim() ||
             !quiz.questions?.length ||
             quiz.questions.some(q => !q.question_text?.trim())
    },

    // Get issue list for debugging
    getIssues: () => {
      const issues: string[] = []

      if (!quiz.title?.trim()) issues.push('Missing title')
      if (!quiz.questions?.length) issues.push('No questions')

      quiz.questions?.forEach((q, index) => {
        if (!q.question_text?.trim()) {
          issues.push(`Question ${index + 1} has no text`)
        }
      })

      return issues
    }
  }
}