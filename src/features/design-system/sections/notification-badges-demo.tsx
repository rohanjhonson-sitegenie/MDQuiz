import { Bell, Mail, MessageSquare, ShoppingCart } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NotificationBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function NotificationBadgesDemo() {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Notification Badges</CardTitle>
          <CardDescription>
            Counter badges for displaying notifications, unread counts, and
            alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Counter Examples */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Counter Badges</h4>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <Button variant='outline' size='icon'>
                  <Bell className='h-4 w-4' />
                </Button>
                <NotificationBadge count={3} />
              </div>
              <div className='relative'>
                <Button variant='outline' size='icon'>
                  <Mail className='h-4 w-4' />
                </Button>
                <NotificationBadge count={12} />
              </div>
              <div className='relative'>
                <Button variant='outline' size='icon'>
                  <MessageSquare className='h-4 w-4' />
                </Button>
                <NotificationBadge count={99} />
              </div>
              <div className='relative'>
                <Button variant='outline' size='icon'>
                  <ShoppingCart className='h-4 w-4' />
                </Button>
                <NotificationBadge count={150} max={99} />
              </div>
            </div>
          </div>

          {/* Dot Indicators */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Dot Indicators</h4>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <Button variant='outline' size='icon'>
                  <Bell className='h-4 w-4' />
                </Button>
                <NotificationBadge count={1} dot />
              </div>
              <div className='relative'>
                <Avatar>
                  <AvatarImage src='https://github.com/shadcn.png' />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <NotificationBadge count={1} dot />
              </div>
              <div className='relative'>
                <span className='text-sm font-medium'>Messages</span>
                <NotificationBadge count={5} dot />
              </div>
            </div>
          </div>

          {/* Different Variants */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Different Variants</h4>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <Button variant='outline' size='icon'>
                  <Bell className='h-4 w-4' />
                </Button>
                <NotificationBadge count={3} variant='error' />
              </div>
              <div className='relative'>
                <Button variant='outline' size='icon'>
                  <Mail className='h-4 w-4' />
                </Button>
                <NotificationBadge count={5} variant='warning' />
              </div>
              <div className='relative'>
                <Button variant='outline' size='icon'>
                  <MessageSquare className='h-4 w-4' />
                </Button>
                <NotificationBadge count={2} variant='informative' />
              </div>
            </div>
          </div>

          {/* Show Zero */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Show Zero State</h4>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <Button variant='outline' size='icon'>
                  <Bell className='h-4 w-4' />
                </Button>
                <NotificationBadge count={0} showZero />
              </div>
              <div className='relative'>
                <Button variant='outline' size='icon'>
                  <ShoppingCart className='h-4 w-4' />
                </Button>
                <NotificationBadge count={0} showZero variant='neutral' />
              </div>
            </div>
          </div>

          {/* Animated Notifications */}
          <div>
            <h4 className='mb-3 text-sm font-medium'>Animated Notifications</h4>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <Button variant='outline' size='icon'>
                  <Bell className='h-4 w-4' />
                </Button>
                <NotificationBadge count={3} pulse />
              </div>
              <div className='relative'>
                <Button variant='outline' size='icon'>
                  <Mail className='h-4 w-4' />
                </Button>
                <NotificationBadge count={1} dot pulse />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
