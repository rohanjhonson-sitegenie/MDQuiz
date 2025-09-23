// Comprehensive integration tests for quiz data integrity
// Tests the complete pipeline: markdown → parse → serialize → database → deserialize → display

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { parseMarkdownQuiz } from '../markdown-quiz-parser'
import {
  serializeQuizForDatabase,
  deserializeQuizFromDatabase,
  quizToMarkdown,
  extractDisplayText
} from '../quiz-data-transforms'
import {
  validateParsedQuiz,
  validateQuiz,
  strictValidateParsedQuiz,
  strictValidateQuiz
} from '../quiz-schemas'

// Sample markdown content matching sectioned-quiz-example.md
const SECTIONED_QUIZ_MARKDOWN = `# Advanced JavaScript Concepts Quiz (Sectioned)

This quiz demonstrates all sectioned mode features including timing, navigation restrictions, question type limitations, and progressive scoring.

## Section: Basic Concepts
> Settings: time_limit_minutes=5, allow_backward_navigation=false, allowed_question_types=["multiple_choice", "true_false"], show_section_feedback=true, passing_threshold=70

### Q1
What is the difference between \`let\` and \`var\` in JavaScript?

- [ ] No difference, they are identical
- [x] \`let\` has block scope, \`var\` has function scope
- [ ] \`var\` is newer than \`let\`
- [ ] \`let\` can be hoisted, \`var\` cannot

### Q2
JavaScript is a single-threaded language.

True: JavaScript has one main thread but uses event loop for asynchronous operations

### Q3
What does the 'this' keyword refer to in arrow functions?

- [ ] The function itself
- [ ] The global object
- [x] The lexical scope where the function was defined
- [ ] Always undefined

## Section: Advanced Features
> Settings: time_limit_minutes=10, require_completion_before_next=true, allowed_question_types=["text_input", "multiple_choice"], points_per_question=5, show_progress_bar=true

### Q1
Explain the concept of closures in JavaScript with a practical example.

Answer: A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned. Example: function outer() { let count = 0; return function inner() { count++; return count; }; } - the inner function forms a closure over the count variable.

### Q2
Which design pattern is commonly used for managing state in React applications?

- [ ] Observer Pattern
- [x] Flux/Redux Pattern
- [ ] Singleton Pattern
- [ ] Factory Pattern`

const MIXED_QUIZ_MARKDOWN = `# Simple JavaScript Quiz

A basic quiz about JavaScript fundamentals.

## Q1
What is the difference between \`let\` and \`var\` in JavaScript?

- [ ] No difference, they are identical
- [x] \`let\` has block scope, \`var\` has function scope
- [ ] \`var\` is newer than \`let\`

## Q2
JavaScript is a single-threaded language.

True: JavaScript has one main thread but uses event loop for asynchronous operations

## Q3
What is the output of: \`console.log(typeof typeof 1)\`?

Answer: string`

describe('Quiz Data Integrity Pipeline', () => {
  const mockQuizId = '123e4567-e89b-12d3-a456-426614174000'

  describe('Sectioned Quiz Pipeline', () => {
    it('should maintain data integrity through complete save/load cycle', () => {
      // STEP 1: Parse markdown content
      const parsedQuiz = parseMarkdownQuiz(SECTIONED_QUIZ_MARKDOWN)

      // Validate parsed content
      expect(() => strictValidateParsedQuiz(parsedQuiz)).not.toThrow()
      expect(parsedQuiz.structure_type).toBe('sectioned')
      expect(parsedQuiz.sections).toHaveLength(2)
      expect(parsedQuiz.title).toBe('Advanced JavaScript Concepts Quiz (Sectioned)')

      // STEP 2: Serialize for database
      const serializedQuiz = serializeQuizForDatabase(parsedQuiz, mockQuizId)

      // Validate serialized data
      expect(() => strictValidateQuiz(serializedQuiz)).not.toThrow()
      expect(serializedQuiz.id).toBe(mockQuizId)

      // STEP 3: Simulate database storage/retrieval (stringify/parse JSON fields)
      const dbSimulation = JSON.parse(JSON.stringify(serializedQuiz))

      // STEP 4: Deserialize from database
      const deserializedQuiz = deserializeQuizFromDatabase(dbSimulation)

      // Validate deserialized data
      expect(() => strictValidateQuiz(deserializedQuiz)).not.toThrow()

      // STEP 5: Convert back to markdown
      const regeneratedMarkdown = quizToMarkdown(deserializedQuiz)

      // CRITICAL ASSERTIONS: Data integrity maintained
      expect(deserializedQuiz.title).toBe(parsedQuiz.title)
      expect(deserializedQuiz.sections).toHaveLength(parsedQuiz.sections.length)
      expect(deserializedQuiz.settings.structure_type).toBe('sectioned')

      // Verify questions maintained proper structure
      const firstSection = deserializedQuiz.sections[0]
      const firstQuestion = firstSection.questions?.[0]

      expect(firstQuestion?.question_type).toBe('multiple_choice')
      expect(firstQuestion?.options).toHaveProperty('choices')
      expect(firstQuestion?.options).toHaveProperty('correct_index')

      if ('choices' in firstQuestion!.options) {
        const choices = firstQuestion!.options.choices as Array<{ id: number; text: string }>
        expect(choices).toHaveLength(4)
        expect(choices[0]).toHaveProperty('id')
        expect(choices[0]).toHaveProperty('text')
        expect(typeof choices[0].text).toBe('string')
      }

      // Verify markdown regeneration contains key content
      expect(regeneratedMarkdown).toContain('## Section: Basic Concepts')
      expect(regeneratedMarkdown).toContain('let` has block scope')
    })

    it('should handle multiple choice options correctly (prevents object object bug)', () => {
      const parsedQuiz = parseMarkdownQuiz(SECTIONED_QUIZ_MARKDOWN)
      const serializedQuiz = serializeQuizForDatabase(parsedQuiz, mockQuizId)

      // Get the first multiple choice question
      const firstSection = serializedQuiz.sections[0]
      const mcQuestion = firstSection.questions?.find(q => q.question_type === 'multiple_choice')

      expect(mcQuestion).toBeDefined()
      expect(mcQuestion!.options).toHaveProperty('choices')
      expect(mcQuestion!.options).toHaveProperty('correct_index')

      // Simulate JSON stringification that happens in database
      const stringified = JSON.stringify(mcQuestion!.options)
      const parsed = JSON.parse(stringified)

      // Simulate deserialization
      const deserializedQuiz = deserializeQuizFromDatabase({
        ...serializedQuiz,
        sections: [{
          ...firstSection,
          questions: [{ ...mcQuestion!, options: parsed }]
        }]
      })

      // Verify no "object object" display
      const displayText = extractDisplayText(deserializedQuiz.sections[0].questions?.[0]?.options)
      expect(displayText).not.toContain('[object Object]')
      expect(displayText).not.toContain('object object')
      expect(displayText).toContain('No difference')
      expect(displayText).toContain('block scope')
    })

    it('should handle true/false questions correctly', () => {
      const parsedQuiz = parseMarkdownQuiz(SECTIONED_QUIZ_MARKDOWN)
      const serializedQuiz = serializeQuizForDatabase(parsedQuiz, mockQuizId)

      const tfQuestion = serializedQuiz.sections[0].questions?.find(q => q.question_type === 'true_false')

      expect(tfQuestion).toBeDefined()
      expect(tfQuestion!.options).toHaveProperty('choices')
      expect(tfQuestion!.answer_data).toHaveProperty('correct_answer')
      expect(tfQuestion!.answer_data).toHaveProperty('explanation')

      // Verify structure
      if ('choices' in tfQuestion!.options) {
        const choices = tfQuestion!.options.choices as Array<{ id: number; text: string }>
        expect(choices).toHaveLength(2)
        expect(choices[0].text).toBe('True')
        expect(choices[1].text).toBe('False')
      }
    })

    it('should handle text input questions correctly', () => {
      const parsedQuiz = parseMarkdownQuiz(SECTIONED_QUIZ_MARKDOWN)
      const serializedQuiz = serializeQuizForDatabase(parsedQuiz, mockQuizId)

      const textQuestion = serializedQuiz.sections[1].questions?.find(q => q.question_type === 'text_input')

      expect(textQuestion).toBeDefined()
      expect(textQuestion!.answer_data).toHaveProperty('correct_answer')
      expect(typeof textQuestion!.answer_data.correct_answer).toBe('string')
      expect(textQuestion!.answer_data.correct_answer).toContain('closure')
    })
  })

  describe('Mixed Quiz Pipeline', () => {
    it('should maintain data integrity for mixed quiz structure', () => {
      const parsedQuiz = parseMarkdownQuiz(MIXED_QUIZ_MARKDOWN)

      expect(parsedQuiz.structure_type).toBe('mixed')
      expect(parsedQuiz.questions).toHaveLength(3)
      expect(parsedQuiz.sections).toHaveLength(0)

      const serializedQuiz = serializeQuizForDatabase(parsedQuiz, mockQuizId)
      const deserializedQuiz = deserializeQuizFromDatabase(serializedQuiz)

      expect(deserializedQuiz.questions).toHaveLength(3)
      expect(deserializedQuiz.settings.structure_type).toBe('mixed')
    })
  })

  describe('Error Handling and Data Repair', () => {
    it('should handle corrupted options data gracefully', () => {
      const corruptedQuizData = {
        id: mockQuizId,
        title: 'Corrupted Quiz',
        description: '',
        settings: { structure_type: 'mixed' },
        published: false,
        questions: [
          {
            id: 'q1',
            question_text: 'Test question',
            question_type: 'multiple_choice',
            question_content: {},
            options: '{"invalid": "json"', // Corrupted JSON string
            answer_data: {},
            order_index: 0
          }
        ],
        sections: []
      }

      // Should not throw error, should repair gracefully
      expect(() => {
        const repaired = deserializeQuizFromDatabase(corruptedQuizData)
        expect(repaired.questions).toHaveLength(1)
      }).not.toThrow()
    })

    it('should handle missing or null options gracefully', () => {
      const quizWithNullOptions = {
        id: mockQuizId,
        title: 'Quiz with Null Options',
        description: '',
        settings: { structure_type: 'mixed' },
        published: false,
        questions: [
          {
            id: 'q1',
            question_text: 'Test question',
            question_type: 'multiple_choice',
            question_content: {},
            options: null,
            answer_data: null,
            order_index: 0
          }
        ],
        sections: []
      }

      const repaired = deserializeQuizFromDatabase(quizWithNullOptions)
      expect(repaired.questions[0].options).toEqual({ choices: [], correct_index: 0 })
    })
  })

  describe('Display Text Extraction', () => {
    it('should extract readable text from various option formats', () => {
      // Test with proper object format
      const properOptions = {
        choices: [
          { id: 0, text: 'Option A' },
          { id: 1, text: 'Option B' }
        ],
        correct_index: 0
      }
      expect(extractDisplayText(properOptions)).toBe('Option A, Option B')

      // Test with stringified JSON (the bug scenario)
      const stringifiedOptions = JSON.stringify(properOptions)
      const extracted = extractDisplayText(stringifiedOptions)
      expect(extracted).toBe('Option A, Option B')
      expect(extracted).not.toContain('[object Object]')

      // Test with legacy string array format
      const legacyOptions = {
        choices: ['Choice 1', 'Choice 2', 'Choice 3'],
        correct_index: 1
      }
      expect(extractDisplayText(legacyOptions)).toBe('Choice 1, Choice 2, Choice 3')

      // Test with empty/null options
      expect(extractDisplayText(null)).toBe('No options')
      expect(extractDisplayText({})).toBe('Options available')
    })
  })

  describe('Validation Error Handling', () => {
    it('should provide clear error messages for invalid quiz data', () => {
      const invalidQuiz = {
        title: '', // Invalid: empty title
        description: '',
        questions: [
          {
            question_text: '', // Invalid: empty question text
            question_type: 'invalid_type', // Invalid: unknown type
            options: {},
            answer_data: {},
            order_index: 0
          }
        ],
        sections: [],
        settings: {},
        structure_type: 'mixed'
      }

      const validation = validateParsedQuiz(invalidQuiz)
      expect(validation.success).toBe(false)

      if (!validation.success) {
        expect(validation.error.errors.length).toBeGreaterThan(0)
        expect(validation.error.errors.some(err =>
          err.path.includes('title') || err.message.includes('title')
        )).toBe(true)
      }
    })
  })

  describe('Round-trip Consistency', () => {
    it('should maintain identical data through multiple save/load cycles', () => {
      const originalParsed = parseMarkdownQuiz(SECTIONED_QUIZ_MARKDOWN)

      // First cycle
      const serialized1 = serializeQuizForDatabase(originalParsed, mockQuizId)
      const deserialized1 = deserializeQuizFromDatabase(serialized1)
      const markdown1 = quizToMarkdown(deserialized1)

      // Second cycle (parse the regenerated markdown)
      const reparsed = parseMarkdownQuiz(markdown1)
      const serialized2 = serializeQuizForDatabase(reparsed, mockQuizId)
      const deserialized2 = deserializeQuizFromDatabase(serialized2)

      // Should be identical
      expect(deserialized1.title).toBe(deserialized2.title)
      expect(deserialized1.sections.length).toBe(deserialized2.sections.length)
      expect(deserialized1.questions.length).toBe(deserialized2.questions.length)

      // Check specific question data integrity
      const q1_cycle1 = deserialized1.sections[0].questions?.[0]
      const q1_cycle2 = deserialized2.sections[0].questions?.[0]

      expect(q1_cycle1?.question_text).toBe(q1_cycle2?.question_text)
      expect(q1_cycle1?.question_type).toBe(q1_cycle2?.question_type)

      // Verify options structure is preserved
      if (q1_cycle1?.question_type === 'multiple_choice' && q1_cycle2?.question_type === 'multiple_choice') {
        const choices1 = (q1_cycle1.options as any).choices
        const choices2 = (q1_cycle2.options as any).choices
        expect(choices1.length).toBe(choices2.length)
        expect(choices1[0].text).toBe(choices2[0].text)
      }
    })
  })
})