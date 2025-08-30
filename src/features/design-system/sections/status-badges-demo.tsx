import { StatusBadge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function StatusBadgesDemo() {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Status Badges</CardTitle>
          <CardDescription>
            Specialized badges for displaying user, organization, and system
            statuses.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* User Status */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>User Status</h4>
            <div className='flex flex-wrap gap-2'>
              <StatusBadge status='active' />
              <StatusBadge status='inactive' />
              <StatusBadge status='suspended' />
              <StatusBadge status='invited' />
              <StatusBadge status='pending' />
            </div>
          </div>

          {/* Without Icons */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Without Icons</h4>
            <div className='flex flex-wrap gap-2'>
              <StatusBadge status='active' showIcon={false} />
              <StatusBadge status='inactive' showIcon={false} />
              <StatusBadge status='suspended' showIcon={false} />
              <StatusBadge status='invited' showIcon={false} />
              <StatusBadge status='pending' showIcon={false} />
            </div>
          </div>

          {/* Different Sizes */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Different Sizes</h4>
            <div className='flex items-center gap-2'>
              <StatusBadge status='active' size='sm' />
              <StatusBadge status='active' size='md' />
              <StatusBadge status='active' size='lg' />
            </div>
          </div>

          {/* Different Emphasis */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Different Emphasis</h4>
            <div className='flex flex-wrap gap-2'>
              <StatusBadge status='active' emphasis='heavy' />
              <StatusBadge status='active' emphasis='medium' />
              <StatusBadge status='active' emphasis='light' />
            </div>
          </div>

          {/* Custom Labels */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Custom Labels</h4>
            <div className='flex flex-wrap gap-2'>
              <StatusBadge status='active'>Online</StatusBadge>
              <StatusBadge status='inactive'>Away</StatusBadge>
              <StatusBadge status='suspended'>Blocked</StatusBadge>
              <StatusBadge status='invited'>New User</StatusBadge>
              <StatusBadge status='pending'>Verifying...</StatusBadge>
            </div>
          </div>

          {/* Animated Status */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Animated Status</h4>
            <div className='flex flex-wrap gap-2'>
              <StatusBadge status='active' pulse>
                Live
              </StatusBadge>
              <StatusBadge status='pending' shimmer>
                Processing
              </StatusBadge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
