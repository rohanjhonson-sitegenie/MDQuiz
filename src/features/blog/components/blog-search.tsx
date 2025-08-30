import React from 'react'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface BlogSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const BlogSearch: React.FC<BlogSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search blog posts...',
}) => {
  return (
    <div className='relative'>
      <SearchIcon className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
      <Input
        type='search'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className='pl-9'
      />
    </div>
  )
}
