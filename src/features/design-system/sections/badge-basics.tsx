import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function BadgeBasics() {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Basic Usage</CardTitle>
          <CardDescription>
            Simple examples showing the basic badge variants and their common
            use cases.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Semantic Variants */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Semantic Variants</h4>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='informative'>Informative</Badge>
              <Badge variant='success'>Success</Badge>
              <Badge variant='warning'>Warning</Badge>
              <Badge variant='error'>Error</Badge>
              <Badge variant='neutral'>Neutral</Badge>
              <Badge variant='brand'>Brand</Badge>
            </div>
          </div>

          {/* Original Variants */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Original Variants</h4>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='default'>Default</Badge>
              <Badge variant='secondary'>Secondary</Badge>
              <Badge variant='destructive'>Destructive</Badge>
              <Badge variant='outline'>Outline</Badge>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Sizes</h4>
            <div className='flex items-center gap-2'>
              <Badge size='sm'>Small</Badge>
              <Badge size='md'>Medium</Badge>
              <Badge size='lg'>Large</Badge>
            </div>
          </div>

          {/* Emphasis Levels */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Emphasis Levels</h4>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='informative' emphasis='heavy'>
                Heavy
              </Badge>
              <Badge variant='informative' emphasis='medium'>
                Medium
              </Badge>
              <Badge variant='informative' emphasis='light'>
                Light
              </Badge>
            </div>
          </div>

          {/* With Icons */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>With Icons</h4>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='success' icon={CheckCircle}>
                Complete
              </Badge>
              <Badge variant='warning' icon={AlertTriangle}>
                Pending
              </Badge>
              <Badge variant='error' icon={XCircle} iconPosition='right'>
                Failed
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
