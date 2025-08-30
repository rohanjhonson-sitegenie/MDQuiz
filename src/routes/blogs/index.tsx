import { createFileRoute } from '@tanstack/react-router'
import type { NavigationItem } from '@/types/navigation'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { PublicNavbar } from '@/components/layout/public-navbar'
import { BlogErrorBoundary } from '@/features/blog/components/blog-error-boundary'
import { BlogList } from '@/features/blog/components/blog-list'
import { BlogSearch } from '@/features/blog/components/blog-search'
import { TagFilter } from '@/features/blog/components/tag-filter'
import { useBlogTags } from '@/features/blog/hooks/use-blog-posts'
import { useBlogSearch } from '@/features/blog/hooks/use-blog-search'

export const Route = createFileRoute('/blogs/')({
  component: BlogsPage,
  head: () => ({
    meta: [
      {
        title: 'Blog - Read Our Latest Posts',
        description:
          'Explore our collection of articles, tutorials, and insights on various topics.',
      },
      {
        property: 'og:title',
        content: 'Blog - Read Our Latest Posts',
      },
      {
        property: 'og:description',
        content:
          'Explore our collection of articles, tutorials, and insights on various topics.',
      },
    ],
  }),
})

function BlogsPage() {
  const navigation: NavigationItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blogs', highlight: true },
    { name: 'Badges', href: '/design-system/badges' },
  ]

  const {
    searchQuery,
    selectedTags,
    currentPage,
    totalPages,
    posts,
    totalPosts,
    isLoading,
    error,
    handleSearchChange,
    handleTagToggle,
    handlePageChange,
  } = useBlogSearch()

  const { data: tagsData } = useBlogTags()
  const tags = tagsData || []

  if (error) {
    return (
      <>
        <PublicNavbar items={navigation} />
        <div className='container mx-auto px-4 py-16 text-center'>
          <h2 className='mb-4 text-2xl font-bold'>Something went wrong</h2>
          <p className='text-muted-foreground'>
            Unable to load blog posts. Please try again later.
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <PublicNavbar items={navigation} />
      <BlogErrorBoundary>
        <div className='container mx-auto px-4 py-8'>
          {/* Header */}
          <header className='mb-12 text-center'>
            <h1 className='mb-4 text-4xl font-bold tracking-tight lg:text-5xl'>
              Our Blog
            </h1>
            <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
              Discover articles, tutorials, and insights on various topics
            </p>
          </header>

          {/* Search and filters */}
          <div className='mb-8 space-y-4'>
            <div className='mx-auto max-w-md'>
              <BlogSearch value={searchQuery} onChange={handleSearchChange} />
            </div>

            {tags.length > 0 && (
              <TagFilter
                tags={tags}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                className='justify-center'
              />
            )}
          </div>

          {/* Results count */}
          {(searchQuery || selectedTags.length > 0) && !isLoading && (
            <p className='text-muted-foreground mb-6 text-center text-sm'>
              Found {totalPosts} {totalPosts === 1 ? 'post' : 'posts'}
            </p>
          )}

          {/* Blog posts grid */}
          <BlogList posts={posts} loading={isLoading} />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className='mt-12'>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={
                      currentPage === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                    size='default'
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1
                  // Show first page, last page, current page, and adjacent pages
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === currentPage}
                          className='cursor-pointer'
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  return null
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                    size='default'
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </BlogErrorBoundary>
    </>
  )
}
