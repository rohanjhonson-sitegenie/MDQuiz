import { useQuery } from '@tanstack/react-query'
import type { BlogTag } from '@/types/app.types'
import { blogsRepository } from '@/api/repositories'

interface UseTagSearchOptions {
  query: string
  limit?: number
  enabled?: boolean
}

export function useTagSearch({
  query,
  limit = 10,
  enabled = true,
}: UseTagSearchOptions) {
  return useQuery<BlogTag[], Error>({
    queryKey: ['tags', 'search', query, limit],
    queryFn: () => blogsRepository.searchTags(query, limit),
    enabled: enabled && query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
