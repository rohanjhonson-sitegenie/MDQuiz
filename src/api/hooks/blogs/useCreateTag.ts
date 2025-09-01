import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { BlogTag } from '@/types/app.types'
import { blogsRepository } from '@/api/repositories'

export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation<BlogTag, Error, string>({
    mutationFn: (name: string) => blogsRepository.createTag(name),
    onSuccess: (newTag) => {
      // Invalidate and refetch tags queries
      queryClient.invalidateQueries({ queryKey: ['tags'] })

      // Optimistically update search results that might contain this tag
      queryClient.setQueriesData<BlogTag[]>(
        { queryKey: ['tags', 'search'] },
        (oldData) => {
          if (!oldData) return oldData
          // Add the new tag if it's not already in the results
          if (!oldData.find((tag) => tag.id === newTag.id)) {
            return [...oldData, newTag].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          }
          return oldData
        }
      )
    },
  })
}
