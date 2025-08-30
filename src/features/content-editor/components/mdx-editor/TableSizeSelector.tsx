import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface TableSizeSelectorProps {
  onSelect: (rows: number, cols: number) => void
  maxRows?: number
  maxCols?: number
}

export const TableSizeSelector: React.FC<TableSizeSelectorProps> = ({
  onSelect,
  maxRows = 10,
  maxCols = 10,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    row: number
    col: number
  } | null>(null)

  const handleCellClick = (row: number, col: number) => {
    onSelect(row + 1, col + 1)
  }

  const handleMouseEnter = (row: number, col: number) => {
    setHoveredCell({ row, col })
  }

  const handleMouseLeave = () => {
    setHoveredCell(null)
  }

  return (
    <div className='p-4'>
      <div className='text-muted-foreground mb-2 text-sm'>
        {hoveredCell
          ? `${hoveredCell.row + 1} × ${hoveredCell.col + 1}`
          : 'Select table size'}
      </div>
      <div
        className='grid gap-1'
        style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRows }).map((_, row) =>
          Array.from({ length: maxCols }).map((_, col) => (
            <button
              key={`${row}-${col}`}
              className={cn(
                'border-input hover:border-primary h-6 w-6 border transition-colors',
                hoveredCell && row <= hoveredCell.row && col <= hoveredCell.col
                  ? 'bg-primary/20 border-primary'
                  : 'bg-background'
              )}
              onMouseEnter={() => handleMouseEnter(row, col)}
              onClick={() => handleCellClick(row, col)}
              aria-label={`Select ${row + 1} by ${col + 1} table`}
            />
          ))
        )}
      </div>
    </div>
  )
}
