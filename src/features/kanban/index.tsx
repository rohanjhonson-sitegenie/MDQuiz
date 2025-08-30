import { Star, Users, Filter, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { KanbanBoard } from './components/kanban-board'
import KanbanProvider from './context/kanban-provider'

export default function Kanban() {
  return (
    <KanbanProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='bg-muted/20 flex h-full flex-col p-0'>
        <div className='bg-background flex items-center justify-between border-b px-6 py-2'>
          <div className='flex items-center gap-4'>
            <h1 className='text-lg font-semibold'>Project Board</h1>
            <Button variant='ghost' size='icon'>
              <Star className='h-4 w-4' />
            </Button>
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='ghost' size='sm'>
              <Users className='mr-2 h-4 w-4' />
              Share
            </Button>
            <Button variant='ghost' size='sm'>
              <Filter className='mr-2 h-4 w-4' />
              Filter
            </Button>
            <Button variant='ghost' size='icon'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='flex-1 overflow-hidden'>
          <KanbanBoard />
        </div>
      </Main>
    </KanbanProvider>
  )
}
