// Quiz management store following three-pane navigator patterns
// Adapted from useThreePaneNavigatorStore for quiz management

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { QuizStore, Quiz } from '@/types/quiz.types'
import { QuizRepository } from '@/services/quiz-repository'
import { transformToMarkdown, parseMarkdownToQuiz } from '@/utils/markdown-transform'
import { createClient } from '@/lib/supabase'

const PANE_DIMENSIONS = {
  quizList: {
    default: 320,
    min: 250,
    max: 500
  },
  editor: {
    default: 400,
    min: 300,
    max: 800
  }
} as const

export const useQuizStore = create<QuizStore>()(
  devtools(
    (set, get) => {
      // Initialize repository
      const supabase = createClient()
      const repository = new QuizRepository(supabase)

      return {
        // Navigation state (following three-pane patterns)
        selectedQuizId: null,
        selectedCategoryId: null,
        paneWidths: {
          quizList: PANE_DIMENSIONS.quizList.default,
          editor: PANE_DIMENSIONS.editor.default
        },
        activePane: 'list',

        // Data state
        quizzes: [],
        categories: [],
        selectedQuiz: null,
        markdownContent: '',
        isLoading: false,
        error: null,

        // Navigation actions (adapted from three-pane patterns)
        setSelectedQuiz: (quizId) => {
          set({ selectedQuizId: quizId, activePane: quizId ? 'editor' : 'list' })
          
          if (quizId) {
            // Load quiz and transform to markdown
            get().loadQuizById(quizId)
          } else {
            set({ selectedQuiz: null, markdownContent: '' })
          }
        },

        setSelectedCategory: (categoryId) => {
          set({ selectedCategoryId: categoryId })
          // Reload quizzes when category changes
          get().loadQuizzes()
        },

        setPaneWidth: (pane, width) => {
          const minWidth = PANE_DIMENSIONS[pane].min
          const maxWidth = PANE_DIMENSIONS[pane].max
          const clampedWidth = Math.min(maxWidth, Math.max(minWidth, width))
          
          set((state) => ({
            paneWidths: {
              ...state.paneWidths,
              [pane]: clampedWidth
            }
          }))
        },

        setActivePane: (pane) => set({ activePane: pane }),

        setMarkdownContent: (content) => {
          set({ markdownContent: content })
        },

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        // Data loading actions
        loadQuizzes: async () => {
          try {
            set({ isLoading: true, error: null })
            const quizzes = await repository.getQuizzes()
            
            // Filter by category if selected
            const { selectedCategoryId } = get()
            const filteredQuizzes = selectedCategoryId 
              ? quizzes.filter(quiz => quiz.category_id === selectedCategoryId)
              : quizzes

            set({ quizzes: filteredQuizzes })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load quizzes'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        },

        loadCategories: async () => {
          try {
            const categories = await repository.getCategories()
            set({ categories })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load categories'
            set({ error: errorMessage })
          }
        },

        // Internal helper to load quiz by ID
        loadQuizById: async (quizId: string) => {
          try {
            set({ isLoading: true, error: null })
            const quiz = await repository.getQuizById(quizId)
            
            if (quiz) {
              const markdown = transformToMarkdown(quiz)
              set({ selectedQuiz: quiz, markdownContent: markdown })
            } else {
              set({ error: 'Quiz not found' })
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load quiz'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        },

        saveQuiz: async () => {
          try {
            const { selectedQuizId, selectedQuiz, markdownContent } = get()
            
            if (!selectedQuizId || !selectedQuiz) {
              throw new Error('No quiz selected to save')
            }

            set({ isLoading: true, error: null })

            // Parse markdown back to quiz structure
            const parsedQuiz = parseMarkdownToQuiz(markdownContent)
            
            // Merge with existing quiz data
            const updatedQuiz = {
              ...selectedQuiz,
              ...parsedQuiz,
              questions: parsedQuiz.questions || []
            }

            // Save via repository
            const savedQuiz = await repository.updateQuiz(selectedQuizId, updatedQuiz)
            
            // Update local state
            set({ selectedQuiz: savedQuiz })
            
            // Refresh quiz list
            await get().loadQuizzes()
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save quiz'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        },

        createQuiz: async () => {
          try {
            set({ isLoading: true, error: null })

            // Create new quiz with defaults
            const newQuiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at'> = {
              title: 'New Quiz',
              description: 'Enter quiz description...',
              category_id: get().selectedCategoryId,
              settings: {
                time_limit: 30,
                show_feedback: true,
                randomize_questions: false
              },
              published: false,
              questions: []
            }

            const createdQuiz = await repository.createQuiz(newQuiz)
            
            // Add to quiz list and select
            set(state => ({
              quizzes: [createdQuiz, ...state.quizzes]
            }))
            
            get().setSelectedQuiz(createdQuiz.id)
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create quiz'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        },

        deleteQuiz: async (quizId: string) => {
          try {
            set({ isLoading: true, error: null })
            
            await repository.deleteQuiz(quizId)
            
            // Remove from local state
            set(state => ({
              quizzes: state.quizzes.filter(quiz => quiz.id !== quizId),
              selectedQuizId: state.selectedQuizId === quizId ? null : state.selectedQuizId,
              selectedQuiz: state.selectedQuizId === quizId ? null : state.selectedQuiz,
              markdownContent: state.selectedQuizId === quizId ? '' : state.markdownContent,
              activePane: state.selectedQuizId === quizId ? 'list' : state.activePane
            }))
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete quiz'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        }
      }
    },
    {
      name: 'quiz-store'
    }
  )
)