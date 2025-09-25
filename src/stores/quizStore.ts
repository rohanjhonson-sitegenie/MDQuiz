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
// Import sample files as raw text content
import sampleMixedContent from '../../sample-mixed-quiz.md?raw'
import sampleSectionedContent from '../../sample-sectioned-quiz.md?raw'

// Calculate responsive default for editor pane to achieve 60% of available space
const calculateEditorDefault = () => {
  if (typeof window === 'undefined') return 600 // SSR fallback
  const availableWidth = window.innerWidth - 320 - 100 // Subtract quiz list width and margins
  return Math.min(1200, Math.max(400, Math.round(availableWidth * 0.6)))
}

// Generate sample markdown content for new quizzes using actual sample files
const generateSampleMarkdown = (structureType: 'mixed' | 'sectioned') => {
  // Fallback if imports failed
  if (!sampleMixedContent || !sampleSectionedContent) {
    return `# Sample Quiz

This is a sample quiz created from template.

## Question 1
**Type:** multiple_choice

What is your favorite programming language?

a) JavaScript
b) TypeScript
c) Python
d) All of the above

**Answer:** d
**Explanation:** All programming languages have their strengths!`
  }

  if (structureType === 'sectioned') {
    return sampleSectionedContent
  } else {
    return sampleMixedContent
  }
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
          const currentState = get()
          console.log('[SETSELECTEDQUIZ] Called with:', {
            quizId,
            currentSelectedId: currentState.selectedQuizId,
            hasMarkdownContent: !!currentState.markdownContent,
            markdownPreview: currentState.markdownContent?.substring(0, 50) || 'none'
          })

          set({ selectedQuizId: quizId, activePane: quizId ? 'editor' : 'list' })

          if (quizId) {
            // Skip loading if we just created this quiz and it's already selected with sample content
            const justCreated = currentState.selectedQuizId === quizId &&
                               currentState.markdownContent &&
                               currentState.markdownContent.length > 100 &&
                               (currentState.markdownContent.includes('JavaScript Fundamentals') ||
                                currentState.markdownContent.includes('Web Development Fundamentals'))

            console.log('[SETSELECTEDQUIZ] Just created check:', justCreated)

            if (!justCreated) {
              console.log('[SETSELECTEDQUIZ] Loading quiz by ID')
              // Load quiz and transform to markdown
              get().loadQuizById(quizId)
            } else {
              console.log('[SETSELECTEDQUIZ] Skipping load - using sample content')
            }
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

            const quiz = await repository.getQuizWithSections(quizId)

            if (quiz) {
              const normalizedQuiz = normalizeQuiz(quiz)

              // Check if this is a fresh quiz with no actual content (only sample content)
              const hasActualQuestions = normalizedQuiz.questions && normalizedQuiz.questions.length > 0
              const hasActualSections = normalizedQuiz.sections && normalizedQuiz.sections.length > 0 &&
                normalizedQuiz.sections.some(section => section.questions && section.questions.length > 0)

              // If quiz has no actual content, preserve sample markdown content
              if (!hasActualQuestions && !hasActualSections) {
                console.log('[LOADQUIZBYID] Fresh quiz detected - preserving sample content')
                const sampleContent = generateSampleMarkdown(normalizedQuiz.settings?.structure_type || 'mixed')
                set({ selectedQuiz: normalizedQuiz, markdownContent: sampleContent })
              } else {
                console.log('[LOADQUIZBYID] Quiz has content - using transformed markdown')
                const markdown = transformToMarkdown(normalizedQuiz)
                set({ selectedQuiz: normalizedQuiz, markdownContent: markdown })
              }
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
            console.log('💾 [SAVE-TRACE] Starting save flow:', {
              selectedQuizId,
              hasSelectedQuiz: !!selectedQuiz,
              markdownLength: markdownContent.length,
              markdownPreview: markdownContent.substring(0, 200) + '...'
            })

            if (!selectedQuizId || !selectedQuiz) {
              console.error('❌ [SAVE-TRACE] No quiz selected')
              throw new Error('No quiz selected to save')
            }

            // Block editing of published quizzes
            if (selectedQuiz.published) {
              console.error('❌ [SAVE-TRACE] Attempting to save published quiz')
              throw new Error('Cannot save changes to published quiz. Unpublish the quiz first to make edits.')
            }

            set({ isLoading: true, error: null })
            console.log('📝 [SAVE-TRACE] Set loading state')

            // SIMPLE VALIDATION: Parse markdown and basic validation
            console.log('📄 [SAVE-TRACE] Parsing markdown content...')
            const parsedQuiz = parseMarkdownQuiz(markdownContent)
            console.log('📊 [SAVE-TRACE] Parsed quiz structure:', {
              title: parsedQuiz.title,
              description: parsedQuiz.description,
              structure_type: parsedQuiz.structure_type,
              sections_count: parsedQuiz.sections.length,
              questions_count: parsedQuiz.questions.length,
              settings: parsedQuiz.settings,
              settings_keys: Object.keys(parsedQuiz.settings || {})
            })

            // Simple validation without throwing errors
            const validation = validateQuiz({
              ...parsedQuiz,
              id: selectedQuizId
            })
            console.log('🔍 [SAVE-TRACE] Validation results:', {
              valid: validation.valid,
              canPublish: validation.canPublish,
              errors: validation.errors,
              errorCount: validation.errors.length
            })

            if (!validation.valid) {
              console.warn('⚠️ [SAVE-TRACE] Quiz validation warnings:', validation.errors)
              // Continue anyway - don't block saving for minor issues
            }

            // Normalize and ensure required fields
            console.log('🔧 [SAVE-TRACE] Normalizing quiz structure...')
            const serializedQuiz = normalizeQuiz({
              ...parsedQuiz,
              id: selectedQuizId
            })
            console.log('📦 [SAVE-TRACE] Normalized quiz:', {
              id: serializedQuiz.id,
              title: serializedQuiz.title,
              structure_type: serializedQuiz.settings.structure_type,
              settings: serializedQuiz.settings,
              has_questions: serializedQuiz.questions.length > 0,
              has_sections: serializedQuiz.sections.length > 0
            })

            // Preserve existing quiz metadata
            const quizToSave = {
              ...serializedQuiz,
              category_id: selectedQuiz.category_id,
              published: selectedQuiz.published,
              created_at: selectedQuiz.created_at
            }
            console.log('💼 [SAVE-TRACE] Final quiz to save:', {
              ...quizToSave,
              questions: `[${quizToSave.questions.length} questions]`,
              sections: `[${quizToSave.sections.length} sections]`
            })

            // VALIDATION GATE 3: Save via repository with built-in validation
            console.log('💾 [SAVE-TRACE] Saving to database via repository...')
            const savedQuiz = await repository.updateQuiz(selectedQuizId, quizToSave)
            console.log('✅ [SAVE-TRACE] Successfully saved to database')

            // Simple normalization of saved data
            const normalizedQuiz = normalizeQuiz(savedQuiz)
            console.log('🔄 [SAVE-TRACE] Normalized saved data')

            // Update local state with normalized data
            set({ selectedQuiz: normalizedQuiz })
            console.log('📱 [SAVE-TRACE] Updated local state')

            // Refresh quiz list
            console.log('🔄 [SAVE-TRACE] Refreshing quiz list...')
            await get().loadQuizzes()
            console.log('✨ [SAVE-TRACE] Quiz saved successfully!')

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
          console.log('[CREATEQUIZ] Function called - starting quiz creation')
          try {
            set({ isLoading: true, error: null })
            console.log('[CREATEQUIZ] Initial state set, creating quiz object')

            // Create new quiz using Repository pattern with proper data structure
            const newQuiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at'> = {
              title: 'New Quiz',
              description: 'Enter quiz description...',
              category_id: get().selectedCategoryId,
              settings: {
                structure_type: 'mixed', // Properly nested in settings
                time_limit: 30,
                randomize_questions: false,
                show_feedback: true
              },
              published: false,
              questions: [],
              sections: []
            }

            const createdQuiz = await repository.createQuiz(newQuiz)

            // Generate sample content based on structure type
            const sampleContent = generateSampleMarkdown('mixed')

            // Add to local state
            const currentQuizzes = get().quizzes
            const updatedQuizzes = [...currentQuizzes, createdQuiz]

            // Set all state atomically - DO NOT call setSelectedQuiz or loadQuizById as they will overwrite sample content
            set({
              quizzes: updatedQuizzes,
              selectedQuizId: createdQuiz.id,
              selectedQuiz: createdQuiz,
              markdownContent: sampleContent,
              activePane: 'editor',
              isLoading: false
            })

            // Force a state notification by triggering a minimal state change
            // This ensures Zustand subscriptions fire properly
            setTimeout(() => {
              set((state) => ({ ...state }))
            }, 0)

            console.log('[CREATEQUIZ] Quiz created successfully:', {
              title: createdQuiz.title,
              quizzesCount: updatedQuizzes.length,
              sampleContentLoaded: sampleContent.length > 0,
              sampleContentPreview: sampleContent.substring(0, 50) + '...'
            })
          } catch (error) {
            console.error('[CREATEQUIZ] Error during quiz creation:', error)
            set({
              error: error instanceof Error ? error.message : 'Failed to create quiz',
              isLoading: false
            })
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
            console.log('🚀 [PUBLISH-TRACE] Starting publish flow:', { targetQuizId, providedQuizId: quizId })

            if (!targetQuizId) {
              console.error('❌ [PUBLISH-TRACE] No quiz ID provided')
              throw new Error('No quiz specified to publish')
            }

            set({ isLoading: true, error: null })
            console.log('📝 [PUBLISH-TRACE] Set loading state, cleared errors')

            // Load quiz for validation
            console.log('📥 [PUBLISH-TRACE] Loading quiz for validation...')
            const quizToValidate = await repository.getQuizById(targetQuizId)
            console.log('📊 [PUBLISH-TRACE] Loaded quiz data:', {
              found: !!quizToValidate,
              title: quizToValidate?.title,
              structure_type: quizToValidate?.settings?.structure_type,
              has_sections: quizToValidate?.sections?.length || 0,
              has_questions: quizToValidate?.questions?.length || 0,
              settings: quizToValidate?.settings
            })

            if (!quizToValidate) {
              console.error('❌ [PUBLISH-TRACE] Quiz not found in database')
              throw new Error('Quiz not found')
            }

            // Validate quiz before publishing
            console.log('🔍 [PUBLISH-TRACE] Validating quiz structure...')
            const validation = validateQuiz(quizToValidate)
            console.log('📋 [PUBLISH-TRACE] Validation results:', {
              valid: validation.valid,
              canPublish: validation.canPublish,
              errors: validation.errors,
              errorCount: validation.errors.length
            })

            if (!validation.canPublish) {
              console.error('❌ [PUBLISH-TRACE] Validation failed:', validation.errors)
              throw new Error(`Cannot publish quiz: ${validation.errors.join(', ')}`)
            }

            // Update quiz published status
            console.log('💾 [PUBLISH-TRACE] Updating quiz published status to true...')
            await repository.updateQuiz(targetQuizId, { published: true })
            console.log('✅ [PUBLISH-TRACE] Successfully updated published status')

            // Refresh quiz list and selected quiz
            console.log('🔄 [PUBLISH-TRACE] Refreshing quiz list and selected quiz...')
            await get().loadQuizzes()
            if (get().selectedQuizId === targetQuizId) {
              await get().loadQuizById(targetQuizId)
            }
            console.log('✨ [PUBLISH-TRACE] Quiz published successfully!')

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to publish quiz'
            console.error('💥 [PUBLISH-TRACE] Publish failed:', { error: errorMessage, stack: error instanceof Error ? error.stack : 'No stack' })
            set({ error: errorMessage })
          } finally {
            set({ isLoading: false })
            console.log('🏁 [PUBLISH-TRACE] Publish flow completed')
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

        updateContactRequirement: async (quizId: string, contactRequirement: 'none' | 'optional' | 'required') => {
          try {
            set({ isLoading: true, error: null })

            const quiz = await repository.getQuizById(quizId)
            if (!quiz) {
              throw new Error('Quiz not found')
            }

            const updatedSettings = {
              ...quiz.settings,
              contact_requirement: contactRequirement
            }

            await repository.updateQuiz(quizId, { settings: updatedSettings })

            await get().loadQuizById(quizId)

            set({ isLoading: false })
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update contact requirement'
            set({ error: errorMessage, isLoading: false })
            throw err
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

            await repository.createQuestion(question)

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