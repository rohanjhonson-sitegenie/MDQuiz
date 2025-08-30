import { useState } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DeleteBlogPostDialogProps {
  title: string
  slug: string
  onDelete: () => void
  isDeleting?: boolean
}

export function DeleteBlogPostDialog({
  title,
  slug,
  onDelete,
  isDeleting = false,
}: DeleteBlogPostDialogProps) {
  const [confirmationText, setConfirmationText] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = () => {
    if (confirmationText === slug) {
      onDelete()
      setIsOpen(false)
      setConfirmationText('')
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant='destructive' size='sm'>
          <Trash2 className='mr-2 h-4 w-4' />
          Delete Post
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className='flex items-center gap-2'>
            <div className='bg-destructive/10 flex h-10 w-10 items-center justify-center rounded-full'>
              <AlertTriangle className='text-destructive h-5 w-5' />
            </div>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the blog
            post "{title}" and remove all associated data including images and
            tags.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='confirm-delete'>
              Type the slug below to confirm
            </Label>
            <div className='bg-muted cursor-text rounded px-2 py-1 font-mono text-sm font-semibold select-text'>
              {slug}
            </div>
          </div>
          <Input
            id='confirm-delete'
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder='Enter the blog post slug'
            className='font-mono'
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={confirmationText !== slug || isDeleting}
            variant='destructive'
            asChild
          >
            <AlertDialogAction>
              {isDeleting ? 'Deleting...' : 'Delete Post'}
            </AlertDialogAction>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
