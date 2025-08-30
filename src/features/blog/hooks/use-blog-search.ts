import { useState, useCallback, useMemo } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { useBlogPosts } from './use-blog-posts'

export function useBlogSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  const debouncedSearch = useDebounce(searchQuery, 300)

  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
    }),
    [debouncedSearch, selectedTags, currentPage]
  )

  const { data, isLoading, error } = useBlogPosts(filters)

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    setCurrentPage(1) // Reset to first page on new search
  }, [])

  const handleTagToggle = useCallback((tagId: string) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
      setCurrentPage(1) // Reset to first page on tag change
      return newTags
    })
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const totalPages = data ? Math.ceil(data.total / itemsPerPage) : 0

  return {
    searchQuery,
    selectedTags,
    currentPage,
    totalPages,
    posts: data?.posts || [],
    totalPosts: data?.total || 0,
    isLoading,
    error,
    handleSearchChange,
    handleTagToggle,
    handlePageChange,
  }
}
