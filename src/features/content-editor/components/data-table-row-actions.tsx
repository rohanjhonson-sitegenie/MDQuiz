import { Link } from '@tanstack/react-router'
import { Row } from '@tanstack/react-table'
import { BlogListItem } from '@/types/app.types'
import { MoreHorizontal, Edit, Copy, Trash, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useBlogActions } from '../hooks/useBlogActions'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const blog = row.original as BlogListItem
  const { duplicatePost, deletePost } = useBlogActions()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <Link to='/admin/blogs/$id/edit' params={{ id: blog.id }}>
          <DropdownMenuItem>
            <Edit className='mr-2 h-3.5 w-3.5' />
            Edit
          </DropdownMenuItem>
        </Link>
        <Link to='/blogs/$slug' params={{ slug: blog.slug }} target='_blank'>
          <DropdownMenuItem>
            <Eye className='mr-2 h-3.5 w-3.5' />
            View
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={() => duplicatePost(blog.id)}>
          <Copy className='mr-2 h-3.5 w-3.5' />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => deletePost(blog.id)}
          className='text-red-600'
        >
          <Trash className='mr-2 h-3.5 w-3.5' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
