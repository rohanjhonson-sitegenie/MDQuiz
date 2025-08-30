import { Table } from '@tanstack/react-table'
import { DataTableFacetedFilter } from './data-table-faceted-filter'

interface UsersTableFiltersProps<TData> {
  table: Table<TData>
}

export function UsersTableFilters<TData>({
  table,
}: UsersTableFiltersProps<TData>) {
  return (
    <div className='flex gap-x-2'>
      {table.getColumn('role') && (
        <DataTableFacetedFilter
          column={table.getColumn('role')}
          title='Role'
          options={[
            { label: 'User', value: 'user' },
            { label: 'Admin', value: 'admin' },
          ]}
        />
      )}
    </div>
  )
}
