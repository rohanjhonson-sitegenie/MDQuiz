// Public quiz route for anonymous quiz taking
// Route: /quiz/{slug} - displays published quiz for anonymous users

import { createFileRoute } from '@tanstack/react-router'
import { QuizInterface } from '@/features/quiz-taking/components/QuizInterface'

export const Route = createFileRoute('/quiz/$quizSlug')({
  component: QuizPage,
  loader: async ({ params }) => {
    // TODO: Fetch quiz data from Supabase
    return { quizSlug: params.quizSlug }
  }
})

function QuizPage() {
  const { quizSlug } = Route.useLoaderData()

  return (
    <div className='min-h-screen bg-background'>
      <QuizInterface quizSlug={quizSlug} />
    </div>
  )
}