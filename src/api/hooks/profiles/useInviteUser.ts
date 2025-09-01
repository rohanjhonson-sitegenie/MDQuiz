import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InviteUserDto } from '@/types/app.types'
import { toast } from 'sonner'
import { profilesRepository } from '@/api/repositories'

export const useInviteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InviteUserDto) => profilesRepository.inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      toast.success('Invitation sent successfully')
    },
    onError: () => {
      toast.error('Failed to send invitation')
    },
  })
}
