import { useQuery } from '@tanstack/react-query'
import { blogsRepository } from '@/api/repositories'
import type { BlogFilters } from '@/api/types'

export const useBlogPosts = (filters?: BlogFilters) => {
  return useQuery({
    queryKey: ['blog-posts', filters],
    queryFn: () => blogsRepository.findAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
