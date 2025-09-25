// Enhanced Markdown Quiz Parser - Supports both mixed and sectioned quiz structures
// Features:
// - Section-based organization with settings
// - Backward compatibility with legacy format
// - Dynamic question type validation
// - Section settings parsing from markdown comments

export interface ParsedQuestion {
  id?: string
  section_id?: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'text_input'
  question_content: Record<string, unknown>
  options: Record<string, unknown>
  answer_data: Record<string, unknown>
  order_index: number
}

export interface ParsedSection {
  id?: string
  title: string
  description?: string
  order_index: number
  settings: Record<string, unknown>
  questions: ParsedQuestion[]
}

export interface ParsedQuiz {
  title: string
  description?: string
  questions: ParsedQuestion[]
  sections: ParsedSection[]
  settings: Record<string, unknown>
  structure_type: 'mixed' | 'sectioned'
}

export function parseMarkdownQuiz(markdownContent: string, sectionId?: string): ParsedQuiz {
  const lines = markdownContent.split('\n')

  const quiz: ParsedQuiz = {
    title: '',
    description: '',
    questions: [],
    sections: [],
    settings: {},
    structure_type: 'mixed'
  }

  let currentQuestion: Partial<ParsedQuestion> | null = null
  let currentSection: Partial<ParsedSection> | null = null
  let questionIndex = 0
  let sectionIndex = 0
  let questionsInCurrentSection = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()


    // Parse title (first H1)
    if (line.startsWith('# ') && !quiz.title) {
      quiz.title = line.substring(2).trim()
      continue
    }

    // Parse description (content before first question)
    if (line.startsWith('## ') && !quiz.description && quiz.title) {
      // Look for content between title and first question
      const prevLines = lines.slice(0, i).reverse()
      const descLines: string[] = []
      for (const prevLine of prevLines) {
        if (prevLine.trim().startsWith('# ')) break
        // Skip settings lines when building description
        if (prevLine.trim().startsWith('> Settings:')) continue
        if (prevLine.trim()) descLines.unshift(prevLine.trim())
      }
      quiz.description = descLines.join(' ')
    }

    // Parse section headers (## Section: Title)
    if (line.match(/^## Section:/)) {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.question_text) {
        if (currentSection) {
          currentSection.questions = currentSection.questions || []
          currentSection.questions.push(currentQuestion as ParsedQuestion)
        } else {
          quiz.questions.push(currentQuestion as ParsedQuestion)
        }
        currentQuestion = null
      }

      // Save previous section if exists
      if (currentSection && currentSection.title) {
        quiz.sections.push(currentSection as ParsedSection)
        quiz.structure_type = 'sectioned'
      }

      // Start new section
      const sectionTitle = line.substring(11).trim() // Remove '## Section: '
      currentSection = {
        title: sectionTitle,
        order_index: sectionIndex++,
        settings: {},
        questions: []
      }
      questionsInCurrentSection = 0
      continue
    }

    // Parse settings (> Settings: key=value, key2=value2)
    // Can be either section settings (when in a section) or global quiz settings (mixed mode)
    if (line.match(/^> Settings:/)) {
      const settingsText = line.substring(11).trim() // Remove '> Settings: '
      console.log('⚙️ [PARSER-TRACE] Found settings line:', { settingsText, inSection: !!currentSection })

      const settings: Record<string, any> = {}

      // Parse key=value pairs
      const pairs = settingsText.split(',')
      console.log('📝 [PARSER-TRACE] Parsing settings pairs:', pairs)

      for (const pair of pairs) {
        const [key, value] = pair.split('=').map(s => s.trim())
        if (key && value) {
          console.log('🔑 [PARSER-TRACE] Processing pair:', { key, value, originalValue: value })

          // Try to parse as JSON, fall back to string
          try {
            const parsedValue = JSON.parse(value)
            settings[key] = parsedValue
            console.log('✅ [PARSER-TRACE] JSON parsed successfully:', { key, parsedValue, type: typeof parsedValue })
          } catch {
            settings[key] = value
            console.log('📝 [PARSER-TRACE] Using string value:', { key, value, type: 'string' })
          }
        }
      }

      console.log('🏗️ [PARSER-TRACE] Final parsed settings:', settings)

      // Apply settings to current section or global quiz
      if (currentSection) {
        currentSection.settings = settings
        console.log('🏷️ [PARSER-TRACE] Applied settings to current section:', currentSection.title)
      } else {
        quiz.settings = settings
        console.log('🌐 [PARSER-TRACE] Applied settings to global quiz (mixed mode)')
      }
      continue
    }

    // Parse question headers (### Q1, ### Q2, ### Question, etc.)
    if (line.match(/^### (Q\d+|Question)/)) {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.question_text) {
        if (currentSection) {
          currentSection.questions = currentSection.questions || []
          currentQuestion.order_index = questionsInCurrentSection++
          currentSection.questions.push(currentQuestion as ParsedQuestion)
        } else {
          quiz.questions.push(currentQuestion as ParsedQuestion)
        }
      }

      // Start new question
      currentQuestion = {
        question_text: '',
        question_type: 'multiple_choice',
        question_content: {},
        options: {},
        answer_data: {},
        section_id: sectionId || undefined,
        order_index: currentSection ? questionsInCurrentSection : questionIndex++
      }
      continue
    }

    // Legacy support: Parse question headers (## Q1, ## Q2, ## Question, etc.)
    if (line.match(/^## (Q\d+|Question)/) && !currentSection) {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.question_text) {
        quiz.questions.push(currentQuestion as ParsedQuestion)
      }

      // Start new question
      currentQuestion = {
        question_text: '',
        question_type: 'multiple_choice',
        question_content: {},
        options: {},
        answer_data: {},
        section_id: sectionId || undefined,
        order_index: questionIndex++
      }
      continue
    }

    // Parse question text (first non-empty line after question header that's not an option)
    if (currentQuestion && !currentQuestion.question_text && line && !line.startsWith('-') && !line.startsWith('*') && !line.startsWith('#')) {
      currentQuestion.question_text = line
      continue
    }

    // Parse multiple choice options
    if (currentQuestion && line.match(/^- \[(x| )\]/)) {
      const isCorrect = line.includes('[x]')
      const optionText = line.replace(/^- \[(x| )\]/, '').trim()

      // Initialize options if needed
      if (!currentQuestion.options) currentQuestion.options = {}

      const options = currentQuestion.options as { choices?: Array<{ id: number; text: string }>; correct_index?: number }

      if (!options.choices) {
        options.choices = []
      }

      const optionIndex = options.choices.length
      const choiceId = optionIndex
      options.choices.push({ id: choiceId, text: optionText })

      if (isCorrect) {
        options.correct_index = choiceId
      }

      currentQuestion.question_type = 'multiple_choice'
      continue
    }

    // Parse true/false questions
    if (currentQuestion && line.match(/^(True|False):/)) {
      const isTrue = line.startsWith('True:')
      const explanation = line.substring(line.indexOf(':') + 1).trim()

      currentQuestion.question_type = 'true_false'

      // Create standardized choice format for true/false
      currentQuestion.options = {
        choices: [
          { id: 0, text: 'True' },
          { id: 1, text: 'False' }
        ]
      }

      currentQuestion.answer_data = {
        correct_answer: isTrue,
        explanation: explanation
      }
      continue
    }

    // Parse text input questions (indicated by "Answer:" line)
    if (currentQuestion && line.startsWith('Answer:')) {
      const answer = line.substring(7).trim()
      currentQuestion.question_type = 'text_input'
      currentQuestion.options = {}
      currentQuestion.answer_data = {
        correct_answer: answer
      }
      continue
    }
  }

  // Save last question
  if (currentQuestion && currentQuestion.question_text) {
    if (currentSection) {
      currentSection.questions = currentSection.questions || []
      currentQuestion.order_index = questionsInCurrentSection++
      currentSection.questions.push(currentQuestion as ParsedQuestion)
    } else {
      quiz.questions.push(currentQuestion as ParsedQuestion)
    }
  }

  // Save last section
  if (currentSection && currentSection.title) {
    quiz.sections.push(currentSection as ParsedSection)
    quiz.structure_type = 'sectioned'
  }

  // If we have sections, move standalone questions to sections
  if (quiz.structure_type === 'sectioned' && quiz.questions.length > 0) {
    // Create a default section for standalone questions
    const defaultSection: ParsedSection = {
      title: 'Additional Questions',
      order_index: quiz.sections.length,
      settings: {},
      questions: quiz.questions
    }
    quiz.sections.push(defaultSection)
    quiz.questions = [] // Clear standalone questions
  }

  return quiz
}

// Simple utility to generate quiz slug from title
export function generateQuizSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Utility to convert sections back to markdown
export function sectionsToMarkdown(sections: ParsedSection[]): string {
  let markdown = ''

  for (const section of sections) {
    markdown += `## Section: ${section.title}\n`

    if (section.description) {
      markdown += `${section.description}\n\n`
    }

    if (Object.keys(section.settings).length > 0) {
      const settingsStr = Object.entries(section.settings)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(', ')
      markdown += `> Settings: ${settingsStr}\n\n`
    }

    for (const question of section.questions || []) {
      markdown += `### Q${question.order_index + 1}\n\n`
      markdown += `${question.question_text}\n\n`

      if (question.question_type === 'multiple_choice') {
        const options = question.options as { choices?: string[] | Array<{ id: number; text: string }>; correct_index?: number }
        if (options.choices) {
          options.choices.forEach((choice, index) => {
            const isCorrect = index === options.correct_index ? 'x' : ' '
            // Handle both string and object formats
            const choiceText = typeof choice === 'string' ? choice : choice.text
            markdown += `- [${isCorrect}] ${choiceText}\n`
          })
        }
      } else if (question.question_type === 'true_false') {
        const answerData = question.answer_data as { correct_answer?: boolean; explanation?: string }
        const answer = answerData.correct_answer ? 'True' : 'False'
        const explanation = answerData.explanation || ''
        markdown += `${answer}: ${explanation}\n`
      } else if (question.question_type === 'text_input') {
        const answerData = question.answer_data as { correct_answer?: string }
        markdown += `Answer: ${answerData.correct_answer || ''}\n`
      }

      markdown += '\n'
    }
  }

  return markdown
}