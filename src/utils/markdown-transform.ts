// Markdown transformation utilities for existing quiz schema
// Bidirectional conversion between structured quiz data and markdown format

import type { Quiz, Question, QuestionType, QuizSection } from '@/types/quiz.types'
import { parseMarkdownQuiz, sectionsToMarkdown } from '@/lib/markdown-quiz-parser'

/**
 * Transform structured quiz data to markdown format
 * Supports both mixed and sectioned quiz structures
 */
export function transformToMarkdown(quiz: Quiz): string {
  const structureType = quiz.settings?.structure_type || 'mixed'

  // Use new enhanced parser if quiz has sections
  if (structureType === 'sectioned' && quiz.sections && quiz.sections.length > 0) {
    return transformSectionedQuizToMarkdown(quiz)
  }

  // Legacy mixed mode transformation
  return transformMixedQuizToMarkdown(quiz)
}

/**
 * Transform sectioned quiz to markdown using enhanced format
 */
function transformSectionedQuizToMarkdown(quiz: Quiz): string {
  const lines: string[] = []

  // Quiz title as H1
  lines.push(`# ${quiz.title}`)
  lines.push('')

  if (quiz.description) {
    lines.push(quiz.description)
    lines.push('')
  }

  // Transform sections
  if (quiz.sections && quiz.sections.length > 0) {
    const sortedSections = [...quiz.sections].sort((a, b) => a.order_index - b.order_index)
    const sectionsMarkdown = sectionsToMarkdown(sortedSections)
    lines.push(sectionsMarkdown)
  }

  return lines.join('\n')
}

/**
 * Transform mixed quiz to legacy markdown format
 */
function transformMixedQuizToMarkdown(quiz: Quiz): string {
  const lines: string[] = []

  // Quiz header with metadata (legacy format)
  lines.push('---')
  lines.push(`title: "${quiz.title}"`)
  if (quiz.description) {
    lines.push(`description: "${quiz.description}"`)
  }
  if (quiz.category?.name) {
    lines.push(`category: "${quiz.category.name}"`)
  }
  lines.push(`published: ${quiz.published}`)

  // Settings section
  if (quiz.settings && Object.keys(quiz.settings).length > 0) {
    lines.push('settings:')
    if (quiz.settings.time_limit) {
      lines.push(`  time_limit: ${quiz.settings.time_limit}`)
    }
    if (quiz.settings.randomize_questions !== undefined) {
      lines.push(`  randomize_questions: ${quiz.settings.randomize_questions}`)
    }
    if (quiz.settings.show_feedback !== undefined) {
      lines.push(`  show_feedback: ${quiz.settings.show_feedback}`)
    }
    if (quiz.settings.passing_score) {
      lines.push(`  passing_score: ${quiz.settings.passing_score}`)
    }
  }

  lines.push('---')
  lines.push('')

  // Quiz title as H1
  lines.push(`# ${quiz.title}`)
  lines.push('')

  if (quiz.description) {
    lines.push(quiz.description)
    lines.push('')
  }

  // Questions (legacy format with ## headers)
  if (quiz.questions && quiz.questions.length > 0) {
    const sortedQuestions = [...quiz.questions].sort((a, b) => a.order_index - b.order_index)

    sortedQuestions.forEach((question, index) => {
      lines.push(`## Q${index + 1}`)
      lines.push('')
      lines.push(question.question_text)
      lines.push('')

      // Add question-specific content
      if (question.question_content.additional_context) {
        lines.push(question.question_content.additional_context)
        lines.push('')
      }

      // Handle different question types
      switch (question.question_type) {
        case 'multiple_choice':
          if (question.options.choices && Array.isArray(question.options.choices)) {
            question.options.choices.forEach((choice, choiceIndex) => {
              const isCorrect = question.options.correct_index === choiceIndex
              const marker = isCorrect ? '[x]' : '[ ]'
              // Handle both string and object formats
              const choiceText = typeof choice === 'string' ? choice : choice.text
              lines.push(`- ${marker} ${choiceText}`)
            })
          }
          break

        case 'true_false': {
          const correctAnswer = question.answer_data.correct_answer
          const explanation = question.answer_data.explanation || ''
          if (correctAnswer === 'true' || correctAnswer === true) {
            lines.push(`True: ${explanation}`)
          } else {
            lines.push(`False: ${explanation}`)
          }
          break
        }

        case 'text_input':
          lines.push(`Answer: ${question.answer_data.correct_answer}`)
          break
      }

      lines.push('')
    })
  }

  return lines.join('\n')
}

/**
 * Parse markdown content back to structured quiz data
 * Uses enhanced parser that supports both mixed and sectioned formats
 */
export function parseMarkdownToQuiz(markdown: string): Partial<Quiz> {
  // Use the enhanced parser from markdown-quiz-parser
  const parsedQuiz = parseMarkdownQuiz(markdown)

  // Convert to our Quiz interface format
  const quiz: Partial<Quiz> = {
    title: parsedQuiz.title,
    description: parsedQuiz.description,
    settings: {
      ...parsedQuiz.settings,
      structure_type: parsedQuiz.structure_type
    }
  }

  // Handle sectioned vs mixed format
  if (parsedQuiz.structure_type === 'sectioned' && parsedQuiz.sections.length > 0) {
    quiz.sections = parsedQuiz.sections as QuizSection[]
    // Flatten questions from all sections for backward compatibility
    quiz.questions = parsedQuiz.sections.flatMap(section =>
      (section.questions || []).map(q => ({ ...q, section_id: section.id }))
    ) as Question[]
  } else {
    quiz.questions = parsedQuiz.questions as Question[]
  }

  return quiz
}

/**
 * Legacy markdown parser for backward compatibility
 */
export function parseMarkdownToQuizLegacy(markdown: string): Partial<Quiz> {
  const lines = markdown.split('\n')

  // Parse frontmatter
  let frontmatterEnd = -1
  let inFrontmatter = false
  const frontmatter: Record<string, unknown> = {}
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true
      } else {
        frontmatterEnd = i
        break
      }
    } else if (inFrontmatter) {
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim()
        let value = line.substring(colonIndex + 1).trim()
        
        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        
        // Handle nested settings
        if (key === 'settings') continue
        if (line.startsWith('  ') && key.length > 0) {
          if (!frontmatter.settings) frontmatter.settings = {}
          const settingKey = key
          let settingValue: unknown = value
          if (settingValue === 'true') settingValue = true
          if (settingValue === 'false') settingValue = false
          if (!isNaN(Number(settingValue))) settingValue = Number(settingValue)
          frontmatter.settings[settingKey] = settingValue
        } else {
          if (value === 'true') frontmatter[key] = true
          else if (value === 'false') frontmatter[key] = false
          else if (!isNaN(Number(value))) frontmatter[key] = Number(value)
          else frontmatter[key] = value
        }
      }
    }
  }
  
  // Parse content after frontmatter
  const contentLines = frontmatterEnd > 0 ? lines.slice(frontmatterEnd + 1) : lines
  const questions: Omit<Question, 'id' | 'quiz_id' | 'created_at' | 'updated_at'>[] = []
  
  let currentQuestion: Partial<Omit<Question, 'id' | 'quiz_id' | 'created_at' | 'updated_at'>> | null = null
  let questionIndex = 0
  
  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i].trim()
    
    // Question header - match Q1, Q2, etc. format
    if (line.match(/^## Q\d+/)) {
      if (currentQuestion) {
        questions.push({
          ...currentQuestion,
          order_index: questionIndex++
        })
      }
      currentQuestion = {
        question_text: '',
        question_type: 'multiple_choice' as QuestionType,
        question_content: {},
        options: {},
        answer_data: {}
      }
      continue
    }
    
    if (!currentQuestion) continue
    
    // Question text (first non-empty line after question header)
    if (!currentQuestion.question_text && line && !line.startsWith('#')) {
      currentQuestion.question_text = line
      continue
    }
    
    // Multiple choice options - match - [x] and - [ ] format
    const mcMatch = line.match(/^- \[(x| )\]\s*(.+)$/)
    if (mcMatch) {
      if (!currentQuestion.options.choices) currentQuestion.options.choices = []
      currentQuestion.options.choices.push(mcMatch[2])
      if (mcMatch[1] === 'x') {
        currentQuestion.options.correct_index = currentQuestion.options.choices.length - 1
        currentQuestion.answer_data.correct_answer = mcMatch[2]
      }
      currentQuestion.question_type = 'multiple_choice'
      continue
    }
    
    // True/False options - match True: or False: format
    const tfMatch = line.match(/^(True|False):\s*(.*)$/)
    if (tfMatch) {
      currentQuestion.answer_data.correct_answer = tfMatch[1].toLowerCase()
      currentQuestion.answer_data.explanation = tfMatch[2]
      currentQuestion.question_type = 'true_false'
      continue
    }
    
    // Text input answer - match Answer: format
    const answerMatch = line.match(/^Answer:\s*(.+)$/)
    if (answerMatch) {
      currentQuestion.answer_data.correct_answer = answerMatch[1]
      currentQuestion.question_type = 'text_input'
      continue
    }
    
    // Explanation
    const explanationMatch = line.match(/^\*\*Explanation:\*\*\s*(.+)$/)
    if (explanationMatch) {
      currentQuestion.answer_data.explanation = explanationMatch[1]
      continue
    }
  }
  
  // Add the last question
  if (currentQuestion) {
    questions.push({
      ...currentQuestion,
      order_index: questionIndex
    })
  }
  
  // Build quiz object
  const quiz: Partial<Quiz> = {
    title: frontmatter.title || 'Untitled Quiz',
    description: frontmatter.description || null,
    published: frontmatter.published || false,
    settings: frontmatter.settings || {},
    questions: questions as Question[]
  }
  
  return quiz
}

/**
 * Validate markdown content for quiz format
 */
export function validateMarkdown(markdown: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    const quiz = parseMarkdownToQuiz(markdown)
    
    if (!quiz.title) {
      errors.push('Quiz title is required')
    }
    
    if (!quiz.questions || quiz.questions.length === 0) {
      errors.push('At least one question is required')
    }
    
    quiz.questions?.forEach((question, index) => {
      if (!question.question_text) {
        errors.push(`Question ${index + 1} is missing question text`)
      }
      
      if (question.question_type === 'multiple_choice') {
        if (!question.options.choices || question.options.choices.length < 2) {
          errors.push(`Question ${index + 1} needs at least 2 multiple choice options`)
        }
        if (question.options.correct_index === undefined) {
          errors.push(`Question ${index + 1} needs a correct answer marked with [x]`)
        }
      }
      
      if (question.question_type === 'true_false') {
        if (!question.answer_data.correct_answer) {
          errors.push(`Question ${index + 1} needs a correct answer specified with True: or False:`)
        }
      }
      
      if (question.question_type === 'text_input') {
        if (!question.answer_data.correct_answer) {
          errors.push(`Question ${index + 1} needs an answer specified`)
        }
      }
    })
    
  } catch (error) {
    errors.push(`Markdown parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Transform mixed quiz markdown to sectioned format
 * Preserves existing content and converts question headers
 */
export function transformMixedToSectioned(markdown: string): string {
  if (!markdown.trim()) {
    // Return template for empty content
    return `# New Quiz

## Section: Main Questions
> Settings: time_limit_minutes=10, shuffle_questions=false

### Q1
Your question here...
- [ ] Option A
- [x] Option B
- [ ] Option C

### Q2
Another question...
Answer: Your answer here
`
  }

  try {
    const parsedQuiz = parseMarkdownQuiz(markdown)

    // If already sectioned, return as-is
    if (parsedQuiz.structure_type === 'sectioned' && parsedQuiz.sections.length > 0) {
      return markdown
    }

    // Convert mixed format to sectioned format
    const lines = markdown.split('\n')
    const newLines: string[] = []
    let questionStarted = false
    let inQuestionBlock = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Convert mixed question headers (## Q1) to sectioned format (### Q1)
      if (line.match(/^## (Q\d+|Question)/)) {
        // Add section wrapper before first question
        if (!questionStarted) {
          questionStarted = true
          newLines.push('## Section: Main Questions')
          newLines.push('> Settings: time_limit_minutes=10, shuffle_questions=false')
          newLines.push('')
        }

        // Convert ## to ###
        newLines.push(line.replace(/^##/, '###'))
        inQuestionBlock = true
        continue
      }

      // Preserve all other content
      newLines.push(line)
    }

    // If no questions found, add template section
    if (!questionStarted && parsedQuiz.questions.length === 0) {
      return markdown + `

## Section: Main Questions
> Settings: time_limit_minutes=10, shuffle_questions=false

### Q1
Your question here...
- [ ] Option A
- [x] Option B
- [ ] Option C
`
    }

    return newLines.join('\n')

  } catch (error) {
    // If parsing fails, try simple regex conversion
    const converted = markdown
      .replace(/^## (Q\d+|Question)/gm, (match) => {
        // Add section header before first question if not present
        const hasSection = markdown.includes('## Section:')
        const sectionHeader = hasSection ? '' : `## Section: Main Questions\n> Settings: time_limit_minutes=10, shuffle_questions=false\n\n`
        return sectionHeader + match.replace(/^##/, '###')
      })

    return converted || markdown + `

## Section: Main Questions
> Settings: time_limit_minutes=10, shuffle_questions=false

### Q1
Your question here...
- [ ] Option A
- [x] Option B
- [ ] Option C
`
  }
}

/**
 * Transform sectioned quiz markdown to mixed format
 * Flattens sections and converts question headers
 */
export function transformSectionedToMixed(markdown: string): string {
  if (!markdown.trim()) {
    return markdown
  }

  try {
    const lines = markdown.split('\n')
    const newLines: string[] = []
    let questionCounter = 1

    for (const line of lines) {
      // Skip section headers and settings
      if (line.match(/^## Section:/) || line.match(/^> Settings:/)) {
        continue
      }

      // Convert sectioned question headers (### Q1) to mixed format (## Q1)
      if (line.match(/^### (Q\d+|Question)/)) {
        newLines.push(`## Q${questionCounter}`)
        questionCounter++
        continue
      }

      // Preserve all other content
      newLines.push(line)
    }

    return newLines.join('\n')

  } catch (error) {
    // If parsing fails, try simple regex conversion
    return markdown
      .replace(/^## Section:.*$/gm, '') // Remove section headers
      .replace(/^> Settings:.*$/gm, '') // Remove settings
      .replace(/^### (Q\d+|Question)/gm, (match, group) => {
        // Convert ### to ## and renumber questions
        return `## ${group}`
      })
      .replace(/\n\n\n+/g, '\n\n') // Clean up extra newlines
  }
}