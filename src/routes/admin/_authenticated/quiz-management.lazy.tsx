import { createLazyFileRoute } from '@tanstack/react-router'
import { QuizManagement } from '@/features/quiz-management/components'

export const Route = createLazyFileRoute('/admin/_authenticated/quiz-management')({
  component: QuizManagement,
})