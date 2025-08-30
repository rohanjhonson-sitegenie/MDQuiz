import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'

interface CalendarTooltipContentProps
  extends React.ComponentProps<typeof TooltipPrimitive.Content> {
  children: React.ReactNode
}

export function CalendarTooltipContent({
  className,
  children,
  sideOffset = 0,
  ...props
}: CalendarTooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md border px-3 py-1.5 text-xs text-balance',
          className
        )}
        {...props}
      >
        {children}
        {/* No arrow */}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}
