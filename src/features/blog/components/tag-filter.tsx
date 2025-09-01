import React from 'react'
import type { BlogTag } from '@/types/app.types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface TagFilterProps {
  tags: BlogTag[]
  selectedTags: string[]
  onTagToggle: (tagId: string) => void
  className?: string
}

export const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  selectedTags,
  onTagToggle,
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <span className='text-sm font-medium'>Filter by tags:</span>
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.id)
        return (
          <Badge
            key={tag.id}
            variant={isSelected ? 'default' : 'outline'}
            className='hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors'
            onClick={() => onTagToggle(tag.id)}
          >
            {tag.name}
          </Badge>
        )
      })}
      {selectedTags.length > 0 && (
        <Badge
          variant='secondary'
          className='cursor-pointer'
          onClick={() => selectedTags.forEach(onTagToggle)}
        >
          Clear all
        </Badge>
      )}
    </div>
  )
}
