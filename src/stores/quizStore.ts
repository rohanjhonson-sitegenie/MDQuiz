// Quiz management store following three-pane navigator patterns
// Adapted from useThreePaneNavigatorStore for quiz management

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Quiz, QuizSection, Question, QuizStore } from '@/lib/simple-types'
import { QuizRepository } from '@/services/quiz-repository'
import { transformToMarkdown, transformMixedToSectioned, transformSectionedToMixed } from '@/utils/markdown-transform'
import { parseMarkdownQuiz } from '@/lib/markdown-quiz-parser'
import { validateQuiz, normalizeQuiz, formatErrors, SimpleValidationError } from '@/lib/simple-types'
import { createClient } from '@/lib/supabase'

// Calculate responsive default for editor pane to achieve 60% of available space
const calculateEditorDefault = () => {
  if (typeof window === 'undefined') return 600 // SSR fallback
  const availableWidth = window.innerWidth - 320 - 100 // Subtract quiz list width and margins
  return Math.min(1200, Math.max(400, Math.round(availableWidth * 0.6)))
}

const PANE_DIMENSIONS = {
  quizList: {
    default: 320,
    min: 250,
    max: 500
  },
  editor: {
    default: calculateEditorDefault(),
    min: 300,
    max: 1200
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
        quizPanelCollapsed: false,

        // Data state
        quizzes: [],
        categories: [],
        sections: [],
        selectedQuiz: null,
        selectedSectionId: null,
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

        setSelectedSection: (sectionId) => {
          set({ selectedSectionId: sectionId })
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

        toggleQuizPanel: () => {
          set((state) => ({ quizPanelCollapsed: !state.quizPanelCollapsed }))
        },

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

            // Use getQuizWithSections to load both questions and sections
            const quiz = await repository.getQuizWithSections(quizId)

            if (quiz) {
              // Simple normalization of loaded data
              const normalizedQuiz = normalizeQuiz(quiz)

              // Convert to markdown using transformation layer
              const markdown = transformToMarkdown(normalizedQuiz)

              set({ selectedQuiz: normalizedQuiz, markdownContent: markdown })
            } else {
              set({ error: 'Quiz not found' })
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load quiz'
            console.error('Quiz load error:', error)
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

            // Block editing of published quizzes
            if (selectedQuiz.published) {
              throw new Error('Cannot save changes to published quiz. Unpublish the quiz first to make edits.')
            }

            set({ isLoading: true, error: null })

            // SIMPLE VALIDATION: Parse markdown and basic validation
            const parsedQuiz = parseMarkdownQuiz(markdownContent)

            // Simple validation without throwing errors
            const validation = validateQuiz({
              ...parsedQuiz,
              id: selectedQuizId
            })

            if (!validation.valid) {
              console.warn('Quiz validation warnings:', validation.errors)
              // Continue anyway - don't block saving for minor issues
            }

            // Normalize and ensure required fields
            const serializedQuiz = normalizeQuiz({
              ...parsedQuiz,
              id: selectedQuizId
            })

            // Preserve existing quiz metadata
            const quizToSave = {
              ...serializedQuiz,
              category_id: selectedQuiz.category_id,
              published: selectedQuiz.published,
              created_at: selectedQuiz.created_at
            }

            // VALIDATION GATE 3: Save via repository with built-in validation
            const savedQuiz = await repository.updateQuiz(selectedQuizId, quizToSave)

            // Simple normalization of saved data
            const normalizedQuiz = normalizeQuiz(savedQuiz)

            // Update local state with normalized data
            set({ selectedQuiz: normalizedQuiz })

            // Refresh quiz list
            await get().loadQuizzes()

          } catch (error) {
            let errorMessage = 'Failed to save quiz'

            if (error instanceof SimpleValidationError) {
              errorMessage = `Validation Error: ${formatErrors(error.details)}`
            } else if (error instanceof Error) {
              errorMessage = error.message
            }

            console.error('Quiz save error:', error)
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
                structure_type: 'mixed',
                time_limit: 30,
                show_feedback: true,
                randomize_questions: false
              },
              published: false,
              questions: [],
              sections: []
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
        },

        publishQuiz: async (quizId?: string) => {
          try {
            const targetQuizId = quizId || get().selectedQuizId
            if (!targetQuizId) {
              throw new Error('No quiz specified to publish')
            }

            set({ isLoading: true, error: null })

            // Load quiz for validation
            const quizToValidate = await repository.getQuizById(targetQuizId)
            if (!quizToValidate) {
              throw new Error('Quiz not found')
            }

            // Validate quiz before publishing
            const validation = validateQuiz(quizToValidate)

            if (!validation.canPublish) {
              throw new Error(`Cannot publish quiz: ${validation.errors.join(', ')}`)
            }

            // Update quiz published status
            await repository.updateQuiz(targetQuizId, { published: true })

            // Refresh quiz list and selected quiz
            await get().loadQuizzes()
            if (get().selectedQuizId === targetQuizId) {
              await get().loadQuizById(targetQuizId)
            }

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to publish quiz'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        },

        unpublishQuiz: async (quizId?: string) => {
          try {
            const targetQuizId = quizId || get().selectedQuizId
            if (!targetQuizId) {
              throw new Error('No quiz specified to unpublish')
            }

            set({ isLoading: true, error: null })

            // Update quiz published status
            await repository.updateQuiz(targetQuizId, { published: false })

            // Refresh quiz list and selected quiz
            await get().loadQuizzes()
            if (get().selectedQuizId === targetQuizId) {
              await get().loadQuizById(targetQuizId)
            }

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to unpublish quiz'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        },

        // Section Management Actions
        loadSections: async (quizId: string) => {
          try {
            set({ isLoading: true, error: null })
            const sections = await repository.getSectionsByQuizId(quizId)
            set({ sections })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load sections'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        },

        createSection: async (quizId: string, title: string) => {
          try {
            set({ isLoading: true, error: null })

            const { sections } = get()
            const newSection = await repository.createSection({
              quiz_id: quizId,
              title,
              description: '',
              order_index: sections.length,
              settings: {
                allowed_question_types: ['multiple_choice', 'true_false', 'text_input'],
                show_section_feedback: true
              }
            })

            set(state => ({
              sections: [...state.sections, newSection],
              selectedSectionId: newSection.id
            }))

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create section'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        },

        updateSection: async (sectionId: string, updates: Partial<QuizSection>) => {
          try {
            set({ isLoading: true, error: null })

            const updatedSection = await repository.updateSection(sectionId, updates)

            set(state => ({
              sections: state.sections.map(section =>
                section.id === sectionId ? updatedSection : section
              )
            }))

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update section'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        },

        deleteSection: async (sectionId: string) => {
          try {
            set({ isLoading: true, error: null })

            await repository.deleteSection(sectionId)

            set(state => ({
              sections: state.sections.filter(section => section.id !== sectionId),
              selectedSectionId: state.selectedSectionId === sectionId ? null : state.selectedSectionId
            }))

            // Reload quiz to get updated questions
            const { selectedQuizId } = get()
            if (selectedQuizId) {
              await get().loadQuizById(selectedQuizId)
            }

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete section'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        },

        reorderSections: async (sectionOrders: { id: string; order_index: number }[]) => {
          try {
            set({ isLoading: true, error: null })

            const { selectedQuizId } = get()
            if (!selectedQuizId) {
              throw new Error('No quiz selected')
            }

            await repository.reorderSections(selectedQuizId, sectionOrders)

            // Update local state
            set(state => {
              const updatedSections = [...state.sections]
              sectionOrders.forEach(({ id, order_index }) => {
                const sectionIndex = updatedSections.findIndex(s => s.id === id)
                if (sectionIndex !== -1) {
                  updatedSections[sectionIndex] = {
                    ...updatedSections[sectionIndex],
                    order_index
                  }
                }
              })
              return {
                sections: updatedSections.sort((a, b) => a.order_index - b.order_index)
              }
            })

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to reorder sections'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        },

        moveQuestionToSection: async (questionId: string, sectionId: string | null) => {
          try {
            set({ isLoading: true, error: null })

            await repository.moveQuestionToSection(questionId, sectionId)

            // Reload quiz to get updated question assignments
            const { selectedQuizId } = get()
            if (selectedQuizId) {
              await get().loadQuizById(selectedQuizId)
            }

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to move question to section'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        },

        toggleQuizStructure: async (quizId: string, structureType: 'mixed' | 'sectioned') => {
          try {
            set({ isLoading: true, error: null })

            const quiz = await repository.getQuizById(quizId)
            if (!quiz) {
              throw new Error('Quiz not found')
            }

            const updatedSettings = {
              ...quiz.settings,
              structure_type: structureType
            }

            await repository.updateQuiz(quizId, { settings: updatedSettings })

            // Transform markdown content when switching modes
            const { markdownContent } = get()
            if (structureType === 'sectioned') {
              const transformedContent = transformMixedToSectioned(markdownContent)
              set({ markdownContent: transformedContent })
            } else {
              const transformedContent = transformSectionedToMixed(markdownContent)
              set({ markdownContent: transformedContent })
            }

            // Reload quiz and sections
            await get().loadQuizById(quizId)
            await get().loadSections(quizId)

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to toggle quiz structure'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        },

        // Question Management Actions
        createQuestion: async (question: Omit<Question, 'id' | 'created_at' | 'updated_at'>) => {
          try {
            set({ isLoading: true, error: null })

            const createdQuestion = await repository.createQuestion(question)

            // Reload the current quiz to update the questions list
            const { selectedQuizId } = get()
            if (selectedQuizId) {
              await get().loadQuizById(selectedQuizId)
            }

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create question'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        },

        updateQuestion: async (questionId: string, updates: Partial<Question>) => {
          try {
            set({ isLoading: true, error: null })

            await repository.updateQuestion(questionId, updates)

            // Reload the current quiz to update the questions list
            const { selectedQuizId } = get()
            if (selectedQuizId) {
              await get().loadQuizById(selectedQuizId)
            }

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update question'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        },

        deleteQuestion: async (questionId: string) => {
          try {
            set({ isLoading: true, error: null })

            await repository.deleteQuestion(questionId)

            // Reload the current quiz to update the questions list
            const { selectedQuizId } = get()
            if (selectedQuizId) {
              await get().loadQuizById(selectedQuizId)
            }

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete question'
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
          }
        },

        reorderQuestions: async (questionOrders: { id: string; order_index: number }[]) => {
          try {
            set({ isLoading: true, error: null })

            await repository.reorderQuestions(questionOrders)

            // Reload the current quiz to update the questions list
            const { selectedQuizId } = get()
            if (selectedQuizId) {
              await get().loadQuizById(selectedQuizId)
            }

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to reorder questions'
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