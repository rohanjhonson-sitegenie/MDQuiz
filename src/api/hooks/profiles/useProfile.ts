import { useQuery } from '@tanstack/react-query'
import { profilesRepository } from '@/api/repositories'

export const useProfile = (id: string) => {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: () => profilesRepository.findById(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  })
}
