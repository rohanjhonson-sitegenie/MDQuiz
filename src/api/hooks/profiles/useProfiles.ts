import { useQuery } from '@tanstack/react-query'
import { profilesRepository } from '@/api/repositories'
import type { ProfileFilters } from '@/api/types'

interface UseProfilesOptions extends ProfileFilters {
  page?: number
  pageSize?: number
}

export const useProfiles = (options?: UseProfilesOptions) => {
  const { page = 1, pageSize = 10, ...filters } = options || {}

  // Calculate offset from page and pageSize
  const offset = (page - 1) * pageSize

  return useQuery({
    queryKey: ['profiles', { page, pageSize, offset, ...filters }],
    queryFn: () =>
      profilesRepository.findAll({
        ...filters,
        limit: pageSize,
        offset,
      }),
    staleTime: 30 * 1000, // 30 seconds
  })
}
