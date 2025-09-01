import { useQuery } from '@tanstack/react-query'
import type { BlogFilters } from '@/types/app.types'
import { blogsRepository } from '@/api/repositories'

export const useBlogPosts = (filters?: BlogFilters) => {
  return useQuery({
    queryKey: ['blog-posts', filters],
    queryFn: () => blogsRepository.findAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
