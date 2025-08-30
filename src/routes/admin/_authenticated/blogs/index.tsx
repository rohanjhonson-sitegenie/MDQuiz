import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableSkeleton } from '@/components/ui/data-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from '@/features/content-editor/components/columns'
import { useBlogPosts } from '@/features/content-editor/hooks/useBlogPosts'

export const Route = createFileRoute('/admin/_authenticated/blogs/')({
  component: BlogsList,
})

function BlogsList() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const { data, isLoading } = useBlogPosts({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  })

  const posts = data?.posts || []
  const totalCount = data?.total || 0
  const pageCount = Math.ceil(totalCount / pagination.pageSize)

  const handlePaginationChange = (newPagination: {
    pageIndex: number
    pageSize: number
  }) => {
    setPagination(newPagination)
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Blog Posts</h2>
            <p className='text-muted-foreground'>
              Create and manage your blog content
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Link to='/admin/blogs/new'>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                New Post
              </Button>
            </Link>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <DataTableSkeleton columns={6} rows={10} />
          ) : (
            <DataTable
              data={posts}
              columns={columns}
              enableRowSelection={false}
              manualPagination
              pageCount={pageCount}
              totalCount={totalCount}
              pageIndex={pagination.pageIndex}
              pageSize={pagination.pageSize}
              onPaginationChange={handlePaginationChange}
            />
          )}
        </div>
      </Main>
    </>
  )
}
