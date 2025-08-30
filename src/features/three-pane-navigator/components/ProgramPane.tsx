import { forwardRef } from 'react'
import { useThreePaneNavigatorStore } from '@/stores/threePaneNavigatorStore'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { programs } from '../data/mockData'
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation'

interface ProgramPaneProps {
  onProgramSelect?: () => void
  onRightPress?: () => void
}

export const ProgramPane = forwardRef<HTMLDivElement, ProgramPaneProps>(
  ({ onProgramSelect, onRightPress }, ref) => {
    const { selectedProgramId, setSelectedProgram } =
      useThreePaneNavigatorStore()

    const handleSelectProgram = (programId: string, isKeyboard = false) => {
      setSelectedProgram(programId, isKeyboard)
      onProgramSelect?.()
    }

    const { containerRef, registerItemRef } = useKeyboardNavigation({
      items: programs,
      selectedId: selectedProgramId,
      onSelect: (id) => handleSelectProgram(id, true),
      getItemId: (program) => program.id,
      onRightPress: selectedProgramId ? onRightPress : undefined,
    })

    return (
      <div className='flex h-full flex-col overflow-hidden' ref={ref}>
        <div className='flex-shrink-0 border-b px-4 py-3'>
          <h2 className='text-lg font-semibold'>Programs</h2>
          <p className='text-muted-foreground text-sm'>
            Select a program to view courses
          </p>
        </div>

        <ScrollArea className='flex-1 overflow-y-auto'>
          <div className='p-2 pr-4' ref={containerRef} tabIndex={-1}>
            {programs.map((program) => (
              <button
                key={program.id}
                ref={(el) => registerItemRef(program.id, el)}
                onClick={() => handleSelectProgram(program.id, false)}
                className={cn(
                  'hover:bg-accent hover:text-accent-foreground mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors',
                  'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
                  selectedProgramId === program.id &&
                    'bg-accent text-accent-foreground'
                )}
                tabIndex={
                  selectedProgramId === program.id
                    ? 0
                    : !selectedProgramId && programs[0]?.id === program.id
                      ? 0
                      : -1
                }
              >
                <div className='flex items-center gap-3'>
                  <span className='text-2xl'>{program.icon}</span>
                  <div>
                    <p className='font-medium'>{program.name}</p>
                    <p className='text-muted-foreground text-xs'>
                      {program.description}
                    </p>
                  </div>
                </div>
                <Badge variant='secondary' className='ml-2'>
                  {program.courseCount}
                </Badge>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }
)

ProgramPane.displayName = 'ProgramPane'
