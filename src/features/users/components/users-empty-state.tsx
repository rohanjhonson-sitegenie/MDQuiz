import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUsersContext } from '../context/users-context'

export function UsersEmptyState() {
  const { dialogsActions } = useUsersContext()

  return (
    <div className='flex flex-col items-center justify-center space-y-4 rounded-md border border-dashed p-8'>
      <Users className='text-muted-foreground/50 h-10 w-10' />
      <div className='text-center'>
        <h3 className='text-lg font-semibold'>No users found</h3>
        <p className='text-muted-foreground text-sm'>
          Get started by inviting your first user.
        </p>
      </div>
      <Button onClick={() => dialogsActions.handleInviteOpen()}>
        Invite User
      </Button>
    </div>
  )
}
