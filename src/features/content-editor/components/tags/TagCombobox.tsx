import { useState, useCallback, useRef, useEffect } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useBlogTags } from '@/api/hooks/blogs/useBlogTags'
import { useCreateTag } from '@/api/hooks/blogs/useCreateTag'
import { useTagSearch } from '@/api/hooks/blogs/useTagSearch'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { TagPill } from './TagPill'

interface TagComboboxProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
}

export function TagCombobox({
  value = [],
  onChange,
  placeholder = 'Select tags...',
  maxTags = 10,
}: TagComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch all tags for initial display
  const { data: allTags } = useBlogTags()

  // Search tags based on query
  const { data: searchResults, isLoading } = useTagSearch({
    query: debouncedQuery,
    enabled: debouncedQuery.length > 0,
  })

  // Create tag mutation
  const createTagMutation = useCreateTag()

  // Use search results if available, otherwise show all tags
  const displayTags = debouncedQuery ? searchResults : allTags
  const tags = displayTags || []

  // Check if the search query matches any existing tag
  const exactMatch = tags.find(
    (tag) => tag.name.toLowerCase() === searchQuery.toLowerCase()
  )

  const handleSelect = useCallback(
    (tagName: string) => {
      if (!value.includes(tagName) && value.length < maxTags) {
        onChange([...value, tagName])
      }
      setSearchQuery('')
      setOpen(false)
    },
    [value, onChange, maxTags]
  )

  const handleRemove = useCallback(
    (tagName: string) => {
      onChange(value.filter((t) => t !== tagName))
    },
    [value, onChange]
  )

  const handleCreateTag = useCallback(async () => {
    if (searchQuery && !exactMatch) {
      try {
        const newTag = await createTagMutation.mutateAsync(searchQuery)
        handleSelect(newTag.name)
      } catch {
        // Failed to create tag
      }
    }
  }, [searchQuery, exactMatch, createTagMutation, handleSelect])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && searchQuery && !exactMatch && open) {
        e.preventDefault()
        handleCreateTag()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, searchQuery, exactMatch, handleCreateTag])

  return (
    <div className='space-y-2'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            aria-label='Select tags'
            className='w-full justify-between font-normal'
            disabled={value.length >= maxTags}
          >
            <span className='text-muted-foreground'>
              {value.length === 0
                ? placeholder
                : `${value.length} tag${value.length === 1 ? '' : 's'} selected`}
            </span>
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0' align='start'>
          <Command shouldFilter={false}>
            <CommandInput
              ref={inputRef}
              placeholder='Search or create tags...'
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && searchQuery ? (
                <CommandEmpty>Searching...</CommandEmpty>
              ) : tags.length === 0 && searchQuery ? (
                <CommandEmpty>
                  <button
                    className='hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm'
                    onClick={handleCreateTag}
                  >
                    <Plus className='h-4 w-4' />
                    Create "{searchQuery}"
                  </button>
                </CommandEmpty>
              ) : tags.length === 0 ? (
                <CommandEmpty>No tags found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {!exactMatch && searchQuery && (
                    <CommandItem onSelect={handleCreateTag} className='gap-2'>
                      <Plus className='h-4 w-4' />
                      Create "{searchQuery}"
                    </CommandItem>
                  )}
                  {tags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => handleSelect(tag.name)}
                      disabled={value.includes(tag.name)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value.includes(tag.name) ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {tag.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {value.map((tag) => (
            <TagPill key={tag} tag={tag} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  )
}
