import { useQuery } from '@tanstack/react-query'
import { blogsRepository } from '@/api/repositories'

export const useBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogsRepository.findBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
