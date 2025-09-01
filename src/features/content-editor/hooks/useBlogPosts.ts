import { useQuery } from '@tanstack/react-query'
import { BlogFilters } from '@/types/app.types'
import { blogsRepository } from '@/api/repositories'

interface UseBlogPostsOptions extends BlogFilters {
  page?: number
  pageSize?: number
}

export function useBlogPosts(options?: UseBlogPostsOptions) {
  const { page = 1, pageSize = 10, ...filters } = options || {}

  // Calculate offset from page and pageSize
  const offset = (page - 1) * pageSize

  return useQuery({
    queryKey: ['blog-posts', { page, pageSize, offset, ...filters }],
    queryFn: () =>
      blogsRepository.findAll({
        ...filters,
        includeDrafts: true,
        limit: pageSize,
        offset,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
