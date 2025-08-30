import { useQuery } from '@tanstack/react-query'
import { blogsRepository } from '@/api/repositories'

export const useRelatedPosts = (postId: string, limit?: number) => {
  return useQuery({
    queryKey: ['related-posts', postId, limit],
    queryFn: () => blogsRepository.getRelatedPosts(postId, limit),
    enabled: !!postId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
