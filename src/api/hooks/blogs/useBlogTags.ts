import { useQuery } from '@tanstack/react-query'
import { blogsRepository } from '@/api/repositories'

export const useBlogTags = () => {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: () => blogsRepository.getTags(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}
