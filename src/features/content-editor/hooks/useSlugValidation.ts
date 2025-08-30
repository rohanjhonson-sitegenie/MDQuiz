import { useEffect, useState } from 'react'
import { blogsRepository } from '@/api/repositories'
import { useDebounce } from '@/hooks/useDebounce'

interface UseSlugValidationOptions {
  currentPostId?: string
  enabled?: boolean
}

export function useSlugValidation(
  slug: string,
  options: UseSlugValidationOptions = {}
) {
  const { currentPostId, enabled = true } = options
  const [isChecking, setIsChecking] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debounce the slug to avoid too many API calls
  const debouncedSlug = useDebounce(slug, 500)

  useEffect(() => {
    if (!enabled || !debouncedSlug || debouncedSlug === '') {
      setIsValid(true)
      setError(null)
      return
    }

    const checkSlug = async () => {
      setIsChecking(true)
      setError(null)

      try {
        const exists = await blogsRepository.checkSlugExists(
          debouncedSlug,
          currentPostId
        )

        if (exists) {
          setIsValid(false)
          setError('This slug is already taken. Please choose a different one.')
        } else {
          setIsValid(true)
          setError(null)
        }
      } catch (err) {
        // Log error in development only
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error('Error checking slug:', err)
        }
        setError('Unable to validate slug. Please try again.')
        setIsValid(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkSlug()
  }, [debouncedSlug, currentPostId, enabled])

  return {
    isChecking,
    isValid,
    error,
  }
}
