import { useState } from 'react'
import { useProfiles } from '@/api/hooks'
import type { ProfileFilters } from '@/api/types'
import { AsyncDataWrapper, DataTableSkeleton } from '@/components/ui/data-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from './components/users-dialogs'
import { UsersEmptyState } from './components/users-empty-state'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'

export default function Users() {
  const [filters] = useState<ProfileFilters>({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const { data, isLoading, error, refetch } = useProfiles({
    ...filters,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  })

  const profiles = data?.profiles || []
  const totalCount = data?.total || 0
  const pageCount = Math.ceil(totalCount / pagination.pageSize)

  const handlePaginationChange = (newPagination: {
    pageIndex: number
    pageSize: number
  }) => {
    setPagination(newPagination)
  }

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <AsyncDataWrapper
            data={profiles}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            renderSkeleton={<DataTableSkeleton columns={6} rows={10} />}
            renderEmpty={() => <UsersEmptyState />}
          >
            {(profiles) => (
              <UsersTable
                data={profiles}
                manualPagination
                pageCount={pageCount}
                totalCount={totalCount}
                pageIndex={pagination.pageIndex}
                pageSize={pagination.pageSize}
                onPaginationChange={handlePaginationChange}
              />
            )}
          </AsyncDataWrapper>
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
