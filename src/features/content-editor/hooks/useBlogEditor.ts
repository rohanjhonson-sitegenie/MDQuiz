import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { CreateBlogPostDto, UpdateBlogPostDto } from '@/types/app.types'
import { toast } from 'sonner'
import { blogsRepository } from '@/api/repositories'
import { useAuthStore } from '@/stores/authStore'
import {
  blogPostSchema,
  BlogPostFormData,
} from '../schemas/content-editor.schema'

export function useBlogEditor() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { auth } = useAuthStore()

  // Try to get id from either edit route
  let id: string | undefined
  try {
    const params = useParams({ from: '/admin/_authenticated/blogs/$id/edit' })
    id = params.id
  } catch {
    // If not on edit route, id will be undefined
    id = undefined
  }

  const isEditMode = !!id

  // Fetch existing blog post if in edit mode
  const { data: existingPost, isLoading } = useQuery({
    queryKey: ['blog-post', id],
    queryFn: () => blogsRepository.findById(id!),
    enabled: isEditMode,
  })

  // Initialize form
  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      author: auth.user?.displayName || '',
      tags: [],
      draft: true,
      featuredImage: null,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: [],
    },
  })

  // Update form when existing post is loaded
  useEffect(() => {
    if (existingPost && isEditMode) {
      form.reset({
        title: existingPost.title || '',
        slug: existingPost.slug || '',
        content: existingPost.content || '',
        excerpt: existingPost.excerpt || '',
        author: existingPost.author || '',
        tags: [], // Tags will need to be loaded separately
        draft: existingPost.draft ?? false,
        publishedAt: existingPost.published_at
          ? new Date(existingPost.published_at)
          : undefined,
        seoTitle:
          (
            existingPost.seo as {
              title?: string
              description?: string
              keywords?: string[]
            }
          )?.title || '',
        seoDescription:
          (
            existingPost.seo as {
              title?: string
              description?: string
              keywords?: string[]
            }
          )?.description || '',
        seoKeywords:
          (
            existingPost.seo as {
              title?: string
              description?: string
              keywords?: string[]
            }
          )?.keywords || [],
        featuredImage: existingPost.featured_image || null,
      })
    }
  }, [existingPost, isEditMode, form])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateBlogPostDto) => blogsRepository.create(data),
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      toast.success('Blog post created successfully')
      // Navigate to edit mode for the newly created post
      navigate({ to: `/admin/blogs/${newPost.id}/edit` })
    },
    onError: () => {
      toast.error('Failed to create blog post')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogPostDto }) =>
      blogsRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      queryClient.invalidateQueries({ queryKey: ['blog-post', id] })
      toast.success('Blog post updated successfully')
      // Stay on the edit page after saving
    },
    onError: () => {
      toast.error('Failed to update blog post')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogsRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
      toast.success('Blog post deleted successfully')
      navigate({ to: '/admin/blogs' })
    },
    onError: () => {
      toast.error('Failed to delete blog post')
    },
  })

  // Handle form submission
  const onSubmit = async (data: BlogPostFormData) => {
    // Check if slug is provided and validate it
    if (data.slug) {
      const slugExists = await blogsRepository.checkSlugExists(
        data.slug,
        isEditMode ? id : undefined
      )
      if (slugExists) {
        form.setError('slug', {
          type: 'manual',
          message: 'This slug is already taken. Please choose a different one.',
        })
        return
      }
    }

    const blogData = {
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt || data.content.slice(0, 200) + '...',
      author: data.author,
      tags: data.tags || [],
      draft: data.draft ?? false,
      featured_image:
        data.featuredImage &&
        typeof data.featuredImage === 'string' &&
        data.featuredImage.trim() !== ''
          ? data.featuredImage
          : undefined, // Use undefined to match UpdateBlogPostDto type
      seo_title: data.seoTitle,
      seo_description: data.seoDescription,
      seo_keywords: data.seoKeywords || [],
    }

    if (isEditMode && id) {
      updateMutation.mutate({ id, data: blogData })
    } else {
      createMutation.mutate(blogData as CreateBlogPostDto)
    }
  }

  return {
    form,
    onSubmit,
    isLoading,
    isEditMode,
    isSaving: createMutation.isPending || updateMutation.isPending,
    onDelete: isEditMode && id ? () => deleteMutation.mutate(id) : undefined,
    isDeleting: deleteMutation.isPending,
  }
}
