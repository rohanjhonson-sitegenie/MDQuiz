import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { profilesRepository } from '@/api/repositories'
import type { UpdateProfileDto } from '@/api/types'

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfileDto }) =>
      profilesRepository.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] })
      toast.success('Profile updated successfully')
    },
    onError: () => {
      toast.error('Failed to update profile')
    },
  })
}
