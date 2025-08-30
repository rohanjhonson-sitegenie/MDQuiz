import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Badge,
  BadgeGroup,
  RemovableBadge,
  EventBadge,
  BadgeDot,
} from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function BadgeCompositions() {
  const [tags, setTags] = useState([
    'React',
    'TypeScript',
    'TailwindCSS',
    'Shadcn UI',
    'Vite',
  ])

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Badge Compositions</CardTitle>
          <CardDescription>
            Complex badge patterns and compositions for various use cases.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Badge Groups */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Badge Groups</h4>
            <div className='space-y-2'>
              <BadgeGroup gap='sm'>
                <Badge variant='informative' size='sm'>
                  React
                </Badge>
                <Badge variant='informative' size='sm'>
                  Vue
                </Badge>
                <Badge variant='informative' size='sm'>
                  Angular
                </Badge>
                <Badge variant='informative' size='sm'>
                  Svelte
                </Badge>
              </BadgeGroup>
              <BadgeGroup gap='md' max={3}>
                <Badge variant='neutral'>JavaScript</Badge>
                <Badge variant='neutral'>TypeScript</Badge>
                <Badge variant='neutral'>Python</Badge>
                <Badge variant='neutral'>Go</Badge>
                <Badge variant='neutral'>Rust</Badge>
              </BadgeGroup>
            </div>
          </div>

          {/* Removable Badges */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Removable Badges</h4>
            <BadgeGroup>
              {tags.map((tag, index) => (
                <RemovableBadge
                  key={tag}
                  variant='secondary'
                  onRemove={() => removeTag(index)}
                >
                  {tag}
                </RemovableBadge>
              ))}
            </BadgeGroup>
            {tags.length === 0 && (
              <p className='text-muted-foreground text-sm'>All tags removed!</p>
            )}
          </div>

          {/* Event Badges */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Event Badges</h4>
            <div className='flex flex-wrap gap-2'>
              <EventBadge type='class' />
              <EventBadge type='meeting' status='tentative' />
              <EventBadge type='deadline' status='pending' />
              <EventBadge type='tournament' />
              <EventBadge type='holiday' status='confirmed' />
              <EventBadge type='appointment' status='cancelled' />
            </div>
          </div>

          {/* Badge with Dot Indicator */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Dot Indicators</h4>
            <div className='flex items-center gap-6'>
              <div className='relative'>
                <Avatar>
                  <AvatarImage src='https://github.com/shadcn.png' />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <BadgeDot variant='success' position='bottom-right' />
              </div>
              <div className='relative'>
                <Button variant='outline'>Settings</Button>
                <BadgeDot variant='error' pulse />
              </div>
              <div className='relative inline-block'>
                <span className='text-sm font-medium'>System Status</span>
                <BadgeDot
                  variant='warning'
                  position='top-left'
                  size='microdot'
                />
              </div>
            </div>
          </div>

          {/* Mixed Emphasis */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Mixed Emphasis Levels</h4>
            <BadgeGroup>
              <Badge variant='success' emphasis='heavy'>
                Featured
              </Badge>
              <Badge variant='informative' emphasis='medium'>
                Popular
              </Badge>
              <Badge variant='neutral' emphasis='light'>
                Standard
              </Badge>
              <Badge variant='warning' emphasis='light'>
                Beta
              </Badge>
            </BadgeGroup>
          </div>

          {/* Category Badges */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Category System</h4>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground w-20 text-sm'>
                  Priority:
                </span>
                <BadgeGroup gap='sm'>
                  <Badge variant='error' size='sm'>
                    Critical
                  </Badge>
                  <Badge variant='warning' size='sm'>
                    High
                  </Badge>
                  <Badge variant='informative' size='sm'>
                    Medium
                  </Badge>
                  <Badge variant='neutral' size='sm'>
                    Low
                  </Badge>
                </BadgeGroup>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground w-20 text-sm'>
                  Status:
                </span>
                <BadgeGroup gap='sm'>
                  <Badge variant='neutral' emphasis='light' size='sm'>
                    Draft
                  </Badge>
                  <Badge variant='informative' emphasis='medium' size='sm'>
                    In Review
                  </Badge>
                  <Badge variant='success' emphasis='heavy' size='sm'>
                    Published
                  </Badge>
                  <Badge variant='neutral' emphasis='light' size='sm'>
                    Archived
                  </Badge>
                </BadgeGroup>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
