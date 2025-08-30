import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { blogsRepository } from '@/api/repositories'

export function useBlogActions() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Publish/Unpublish mutation
  const togglePublishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      blogsRepository.update(id, {
        draft: !publish,
        published_at: publish ? new Date().toISOString() : null,
      }),
    onSuccess: (_, { publish }) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      queryClient.invalidateQueries({ queryKey: ['blog-post'] })
      toast.success(publish ? 'Blog post published' : 'Blog post unpublished')
    },
    onError: () => {
      toast.error('Failed to update publish status')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogsRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      toast.success('Blog post deleted')
      navigate({ to: '/admin/blogs' })
    },
    onError: () => {
      toast.error('Failed to delete blog post')
    },
  })

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const post = await blogsRepository.findById(id)
      return blogsRepository.create({
        title: `${post.title} (Copy)`,
        content: post.content,
        excerpt: post.excerpt,
        author: post.author,
        tags: post.metadata?.tags || [],
        draft: true,
        featuredImage: undefined, // Don't copy the featured image
      })
    },
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      toast.success('Blog post duplicated')
      navigate({ to: `/admin/blogs/${newPost.id}/edit` })
    },
    onError: () => {
      toast.error('Failed to duplicate blog post')
    },
  })

  return {
    togglePublish: togglePublishMutation.mutate,
    deletePost: deleteMutation.mutate,
    duplicatePost: duplicateMutation.mutate,
    isToggling: togglePublishMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
  }
}
