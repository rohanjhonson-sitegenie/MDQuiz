import { useEffect, useRef } from 'react'
import { UseFormWatch } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { blogsRepository } from '@/api/repositories'
import { UpdateBlogPostDto } from '@/api/types'
import { BlogPostFormData } from '../schemas/content-editor.schema'

interface UseAutoSaveProps {
  watch: UseFormWatch<BlogPostFormData>
  isDirty?: boolean
  postId?: string
  enabled?: boolean
  delay?: number
}

export function useAutoSave({
  watch,
  isDirty = true,
  postId,
  enabled = true,
  delay = 30000,
}: UseAutoSaveProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const lastSavedRef = useRef<string>('')

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogPostDto }) =>
      blogsRepository.update(id, data),
    onSuccess: () => {
      // Silent auto-save - no toast notification
    },
    onError: () => {
      // Only show error toast for auto-save failures
      toast.error('Auto-save failed', { duration: 2000 })
    },
  })

  useEffect(() => {
    if (!enabled || !postId) return

    const subscription = watch((data) => {
      // Only proceed if form is dirty
      if (!isDirty) return

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        const currentData = JSON.stringify(data)

        // Only save if data has changed
        if (currentData !== lastSavedRef.current) {
          lastSavedRef.current = currentData

          const saveData: UpdateBlogPostDto = {
            title: data.title || '',
            content: data.content || '',
            excerpt: data.excerpt,
            author: data.author || '',
            tags:
              data.tags?.filter(
                (tag): tag is string =>
                  typeof tag === 'string' && tag !== undefined
              ) || [],
            draft: data.draft ?? true,
            seo_title: data.seoTitle,
            seo_description: data.seoDescription,
            seo_keywords:
              data.seoKeywords?.filter(
                (kw): kw is string => typeof kw === 'string' && kw !== undefined
              ) || [],
          }

          mutate({ id: postId, data: saveData })
        }
      }, delay)
    })

    return () => {
      subscription.unsubscribe()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [watch, postId, enabled, delay, mutate, isDirty])

  return {
    isSaving: isPending,
    lastSaved: isSuccess ? new Date() : null,
  }
}
