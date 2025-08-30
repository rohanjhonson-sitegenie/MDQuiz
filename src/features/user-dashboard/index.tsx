import {
  IconBell,
  IconCalendar,
  IconMessage,
  IconUser,
} from '@tabler/icons-react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useAuthStore } from '@/stores/authStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export default function UserDashboard() {
  const { user } = useAuthStore((state) => state.auth)

  const chartData = [
    { date: 'Jan 23', SolarPanels: 2890, Inverters: 2338 },
    { date: 'Feb 23', SolarPanels: 2756, Inverters: 2103 },
    { date: 'Mar 23', SolarPanels: 3322, Inverters: 2194 },
    { date: 'Apr 23', SolarPanels: 3470, Inverters: 2108 },
    { date: 'May 23', SolarPanels: 3475, Inverters: 1812 },
    { date: 'Jun 23', SolarPanels: 3129, Inverters: 1726 },
  ]

  const topNav = [
    {
      title: 'Overview',
      href: '/user',
      isActive: true,
      disabled: false,
    },
    {
      title: 'Activity',
      href: '/user/activity',
      isActive: false,
      disabled: true,
    },
    {
      title: 'Reports',
      href: '/user/reports',
      isActive: false,
      disabled: true,
    },
  ]

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Welcome back,{' '}
            {user?.displayName || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <Badge variant='secondary'>User Portal</Badge>
        </div>
        <p className='text-muted-foreground mb-4'>
          Here's what's happening with your account today.
        </p>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Tasks
              </CardTitle>
              <IconCalendar className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>12</div>
              <p className='text-muted-foreground text-xs'>+2 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Messages</CardTitle>
              <IconMessage className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>5</div>
              <p className='text-muted-foreground text-xs'>3 unread messages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Notifications
              </CardTitle>
              <IconBell className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>8</div>
              <p className='text-muted-foreground text-xs'>
                View all notifications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Profile Status
              </CardTitle>
              <IconUser className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>Active</div>
              <p className='text-muted-foreground text-xs'>Last login: Today</p>
            </CardContent>
          </Card>
        </div>

        <div className='mt-6 grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>
                Your activity for the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id='colorSolar' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#8884d8' stopOpacity={0.8} />
                      <stop offset='95%' stopColor='#8884d8' stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id='colorInverters'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='5%' stopColor='#82ca9d' stopOpacity={0.8} />
                      <stop offset='95%' stopColor='#82ca9d' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    className='stroke-muted'
                  />
                  <XAxis
                    dataKey='date'
                    stroke='#888888'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke='#888888'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Area
                    type='monotone'
                    dataKey='SolarPanels'
                    stroke='#8884d8'
                    fillOpacity={1}
                    fill='url(#colorSolar)'
                  />
                  <Area
                    type='monotone'
                    dataKey='Inverters'
                    stroke='#82ca9d'
                    fillOpacity={1}
                    fill='url(#colorInverters)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and actions</CardDescription>
            </CardHeader>
            <CardContent className='grid gap-2'>
              <Button variant='outline' className='justify-start'>
                <IconCalendar className='mr-2 h-4 w-4' />
                View My Tasks
              </Button>
              <Button variant='outline' className='justify-start'>
                <IconMessage className='mr-2 h-4 w-4' />
                Check Messages
              </Button>
              <Button variant='outline' className='justify-start'>
                <IconUser className='mr-2 h-4 w-4' />
                Update Profile
              </Button>
              <Button variant='outline' className='justify-start'>
                <IconBell className='mr-2 h-4 w-4' />
                Notification Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center'>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm font-medium'>Task completed</p>
                  <p className='text-muted-foreground text-sm'>
                    You completed "Update user documentation"
                  </p>
                </div>
                <div className='text-muted-foreground ml-auto text-sm'>
                  2 hours ago
                </div>
              </div>
              <div className='flex items-center'>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm font-medium'>New message received</p>
                  <p className='text-muted-foreground text-sm'>
                    From: Support Team
                  </p>
                </div>
                <div className='text-muted-foreground ml-auto text-sm'>
                  5 hours ago
                </div>
              </div>
              <div className='flex items-center'>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm font-medium'>Profile updated</p>
                  <p className='text-muted-foreground text-sm'>
                    You updated your profile picture
                  </p>
                </div>
                <div className='text-muted-foreground ml-auto text-sm'>
                  Yesterday
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
