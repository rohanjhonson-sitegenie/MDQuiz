import { format } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { ColumnDef } from '@tanstack/react-table'
import { BlogListItem } from '@/types/app.types'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table'

export const columns: ColumnDef<BlogListItem>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => {
      const title = row.getValue('title') as string
      return (
        <Link
          to='/admin/blogs/$id/edit'
          params={{ id: row.original.id }}
          className='hover:underline'
        >
          <p className='font-medium'>{title}</p>
        </Link>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'draft',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Status'
        className='text-center'
      />
    ),
    cell: ({ row }) => {
      const isDraft = row.getValue('draft') as boolean
      return (
        <div className='text-center'>
          <Badge variant={isDraft ? 'secondary' : 'success'} emphasis='light'>
            {isDraft ? 'Draft' : 'Published'}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'author',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Author' />
    ),
    cell: ({ row }) => row.getValue('author'),
    enableSorting: true,
  },
  {
    accessorKey: 'tags',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tags' />
    ),
    cell: ({ row }) => {
      const tags = row.original.tags || []
      return (
        <div className='flex flex-wrap gap-1'>
          {tags.map((tag) => (
            <Badge key={tag.id} variant='outline' className='text-xs'>
              {tag.name}
            </Badge>
          ))}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'publishedAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Published'
        className='text-center'
      />
    ),
    cell: ({ row }) => {
      const date = row.getValue('publishedAt') as Date
      const isDraft = row.original.draft
      return (
        <div className='text-center'>
          {isDraft ? '-' : date ? format(new Date(date), 'MMM d, yyyy') : '-'}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'readingTime',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Reading Time'
        className='text-center'
      />
    ),
    cell: ({ row }) => {
      const time = row.getValue('readingTime') as number
      return <div className='text-center'>{time ? `${time} min` : '-'}</div>
    },
    enableSorting: true,
  },
]
