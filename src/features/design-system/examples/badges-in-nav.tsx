import {
  Home,
  Users,
  Settings,
  FileText,
  Bell,
  Mail,
  MessageSquare,
  Activity,
  Package,
  CreditCard,
} from 'lucide-react'
import { Badge, NotificationBadge, StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const sidebarItems = [
  { icon: Home, label: 'Dashboard', count: 0 },
  { icon: Users, label: 'Users', count: 3 },
  { icon: MessageSquare, label: 'Messages', count: 12 },
  { icon: FileText, label: 'Documents', count: 0 },
  { icon: Settings, label: 'Settings', count: 1 },
]

const tabItems = [
  { label: 'Overview', count: 0 },
  { label: 'Analytics', count: 0 },
  { label: 'Reports', count: 5, variant: 'warning' as const },
  { label: 'Notifications', count: 8, variant: 'error' as const },
]

const menuItems = [
  { icon: Activity, label: 'Activity', status: 'active' as const },
  {
    icon: Package,
    label: 'Inventory',
    badge: 'Low Stock',
    variant: 'warning' as const,
  },
  {
    icon: CreditCard,
    label: 'Billing',
    badge: 'Update Required',
    variant: 'error' as const,
  },
]

export function BadgesInNav() {
  return (
    <div className='space-y-6'>
      {/* Sidebar Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Sidebar Navigation</CardTitle>
          <CardDescription>
            Badge usage in sidebar navigation with notification counts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='w-64 space-y-1'>
            {sidebarItems.map((item) => (
              <Button
                key={item.label}
                variant='ghost'
                className='relative w-full justify-start'
              >
                <item.icon className='mr-2 h-4 w-4' />
                {item.label}
                {item.count > 0 && (
                  <Badge variant='error' size='sm' className='ml-auto'>
                    {item.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Tab Navigation</CardTitle>
          <CardDescription>
            Badges integrated with tab navigation for alerts and counts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='overview' className='w-full'>
            <TabsList className='grid w-full grid-cols-4'>
              {tabItems.map((tab) => (
                <TabsTrigger
                  key={tab.label}
                  value={tab.label.toLowerCase()}
                  className='relative'
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <Badge
                      variant={tab.variant || 'neutral'}
                      size='sm'
                      className='ml-2'
                      emphasis='medium'
                    >
                      {tab.count}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Header Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Header Navigation</CardTitle>
          <CardDescription>
            Common header navigation pattern with notification badges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='bg-muted flex items-center justify-between rounded-lg p-4'>
            <div className='flex items-center gap-2'>
              <span className='text-lg font-semibold'>Logo</span>
              <Badge variant='brand' size='sm' emphasis='light'>
                v2.0
              </Badge>
            </div>
            <div className='flex items-center gap-2'>
              <div className='relative'>
                <Button variant='ghost' size='icon'>
                  <Bell className='h-4 w-4' />
                </Button>
                <NotificationBadge count={3} />
              </div>
              <div className='relative'>
                <Button variant='ghost' size='icon'>
                  <Mail className='h-4 w-4' />
                </Button>
                <NotificationBadge count={7} />
              </div>
              <div className='relative'>
                <Button variant='ghost' size='icon'>
                  <MessageSquare className='h-4 w-4' />
                </Button>
                <NotificationBadge count={1} dot />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu with Status */}
      <Card>
        <CardHeader>
          <CardTitle>Menu with Status Indicators</CardTitle>
          <CardDescription>
            Navigation menu items with various badge types and status
            indicators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {menuItems.map((item) => (
              <div
                key={item.label}
                className='hover:bg-muted flex items-center justify-between rounded-lg p-3 transition-colors'
              >
                <div className='flex items-center gap-3'>
                  <item.icon className='text-muted-foreground h-5 w-5' />
                  <span className='font-medium'>{item.label}</span>
                </div>
                {item.status ? (
                  <StatusBadge
                    status={item.status}
                    size='sm'
                    showIcon={false}
                  />
                ) : item.badge ? (
                  <Badge variant={item.variant} size='sm' emphasis='medium'>
                    {item.badge}
                  </Badge>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
