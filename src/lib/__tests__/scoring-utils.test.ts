// Tests for scoring utilities to ensure analytics accuracy

import { normalizeAnswer, calculateKeywordMatch, calculateSectionScore } from '../scoring-utils'
import type { Question } from '../scoring-utils'

describe('scoring-utils', () => {
  describe('normalizeAnswer', () => {
    it('should normalize case and spacing', () => {
      expect(normalizeAnswer('Try Catch')).toBe('try catch')
      expect(normalizeAnswer('try-catch')).toBe('try catch')
      expect(normalizeAnswer('  TRY/CATCH  ')).toBe('try catch')
    })

    it('should handle special characters', () => {
      expect(normalizeAnswer('hello,world;test')).toBe('hello world test')
      expect(normalizeAnswer('test_with_underscores')).toBe('test with underscores')
    })
  })

  describe('calculateKeywordMatch', () => {
    it('should match keywords correctly', () => {
      const userAnswer = 'try catch blocks'
      const correctAnswer = 'try-catch error handling'

      const score = calculateKeywordMatch(userAnswer, correctAnswer)
      expect(score).toBeGreaterThan(0.5) // Should match 'try' and 'catch'
    })

    it('should handle empty answers', () => {
      expect(calculateKeywordMatch('test', '')).toBe(0)
      expect(calculateKeywordMatch('', 'test')).toBe(0)
    })
  })

  describe('calculateSectionScore', () => {
    const mockQuestions: Question[] = [
      {
        id: 'q1',
        question_text: 'Test question 1',
        answer_data: { correct_answer: true }
      },
      {
        id: 'q2',
        question_text: 'Test question 2',
        answer_data: { correct_answer: 'try catch' }
      },
      {
        id: 'q3',
        question_text: 'Test question 3',
        answer_data: { correct_answer: 2 }
      }
    ]

    it('should calculate correct scores with normalization', () => {
      const userAnswers = {
        'q1': true,           // Correct
        'q2': 'try-catch',    // Should match with normalization
        'q3': 2               // Correct
      }

      const result = calculateSectionScore(userAnswers, mockQuestions)

      expect(result.score).toBe(3)
      expect(result.maxScore).toBe(3)
      expect(result.percentage).toBe(100)
    })

    it('should handle partially correct answers', () => {
      const userAnswers = {
        'q1': true,           // Correct
        'q2': 'wrong answer', // Incorrect
        'q3': 1               // Incorrect
      }

      const result = calculateSectionScore(userAnswers, mockQuestions)

      expect(result.score).toBe(1)
      expect(result.maxScore).toBe(3)
      expect(result.percentage).toBe(33.333333333333336)
    })

    it('should handle missing answers', () => {
      const userAnswers = {
        'q1': true            // Only one answer provided
      }

      const result = calculateSectionScore(userAnswers, mockQuestions)

      expect(result.score).toBe(1)
      expect(result.maxScore).toBe(3)
      expect(result.percentage).toBe(33.333333333333336)
    })

    it('should handle questions without correct answers', () => {
      const questionsWithoutAnswers: Question[] = [
        {
          id: 'q1',
          question_text: 'Test question',
          // No answer_data
        }
      ]

      const userAnswers = { 'q1': 'any answer' }
      const result = calculateSectionScore(userAnswers, questionsWithoutAnswers)

      expect(result.score).toBe(0)
      expect(result.maxScore).toBe(1)
      expect(result.percentage).toBe(0)
    })
  })
})