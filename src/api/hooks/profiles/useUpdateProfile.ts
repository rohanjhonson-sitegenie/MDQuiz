import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateProfileDto } from '@/types/app.types'
import { toast } from 'sonner'
import { profilesRepository } from '@/api/repositories'

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
