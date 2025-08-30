import { DataTable } from '@/components/ui/data-table'
import { Profile } from '../data/schema'
import { columns } from './users-columns'

interface UsersTableProps {
  data: Profile[]
  manualPagination?: boolean
  pageCount?: number
  totalCount?: number
  pageIndex?: number
  pageSize?: number
  onPaginationChange?: (pagination: {
    pageIndex: number
    pageSize: number
  }) => void
}

export function UsersTable({
  data,
  manualPagination,
  pageCount,
  totalCount,
  pageIndex,
  pageSize,
  onPaginationChange,
}: UsersTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      manualPagination={manualPagination}
      pageCount={pageCount}
      totalCount={totalCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPaginationChange={onPaginationChange}
      enableRowSelection={false}
    />
  )
}
