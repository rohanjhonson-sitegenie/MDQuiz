import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Profile } from '../data/schema'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface UsersContextType {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: Profile | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Profile | null>>
  dialogsActions: {
    handleInviteOpen: () => void
    handleEditOpen: (row: Profile) => void
    handleDeleteOpen: (row: Profile) => void
  }
}

const UsersContext = React.createContext<UsersContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function UsersProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Profile | null>(null)

  const dialogsActions = {
    handleInviteOpen: () => setOpen('invite'),
    handleEditOpen: (row: Profile) => {
      setCurrentRow(row)
      setOpen('edit')
    },
    handleDeleteOpen: (row: Profile) => {
      setCurrentRow(row)
      setOpen('delete')
    },
  }

  return (
    <UsersContext
      value={{ open, setOpen, currentRow, setCurrentRow, dialogsActions }}
    >
      {children}
    </UsersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsersContext = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsersContext has to be used within <UsersContext>')
  }

  return usersContext
}

// Keep the old hook name for backward compatibility
// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = useUsersContext
