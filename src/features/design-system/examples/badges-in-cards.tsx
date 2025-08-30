import { Users, MapPin, Calendar } from 'lucide-react'
import { Badge, EventBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const features = [
  {
    title: 'Advanced Analytics',
    description: 'Get detailed insights into your application performance.',
    status: 'new',
    category: 'analytics',
  },
  {
    title: 'Team Collaboration',
    description: 'Work together seamlessly with your team members.',
    status: 'popular',
    category: 'collaboration',
  },
  {
    title: 'API Integration',
    description: 'Connect with third-party services and APIs.',
    status: 'beta',
    category: 'integration',
  },
]

const events = [
  {
    title: 'Team Meeting',
    type: 'meeting' as const,
    status: 'confirmed' as const,
    date: 'Today, 2:00 PM',
    attendees: 8,
    location: 'Conference Room A',
  },
  {
    title: 'Project Deadline',
    type: 'deadline' as const,
    status: 'pending' as const,
    date: 'Tomorrow, 11:59 PM',
    priority: 'high',
  },
  {
    title: 'Annual Tournament',
    type: 'tournament' as const,
    status: 'confirmed' as const,
    date: 'Next Week',
    participants: 32,
    location: 'Sports Complex',
  },
]

const pricingPlans = [
  {
    name: 'Basic',
    price: '$9',
    features: ['10 Projects', '2 Team Members', 'Basic Support'],
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    features: [
      'Unlimited Projects',
      '10 Team Members',
      'Priority Support',
      'Advanced Analytics',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Everything in Pro',
      'Unlimited Team Members',
      'Dedicated Support',
      'Custom Features',
    ],
    popular: false,
  },
]

export function BadgesInCards() {
  return (
    <div className='space-y-6'>
      {/* Feature Cards */}
      <div>
        <h3 className='mb-4 text-lg font-semibold'>Feature Cards</h3>
        <div className='grid gap-4 md:grid-cols-3'>
          {features.map((feature) => (
            <Card key={feature.title} className='relative'>
              {feature.status === 'new' && (
                <Badge
                  className='absolute top-4 right-4'
                  variant='success'
                  size='sm'
                >
                  New
                </Badge>
              )}
              {feature.status === 'popular' && (
                <Badge
                  className='absolute top-4 right-4'
                  variant='warning'
                  size='sm'
                  pulse
                >
                  Popular
                </Badge>
              )}
              {feature.status === 'beta' && (
                <Badge
                  className='absolute top-4 right-4'
                  variant='informative'
                  size='sm'
                  emphasis='medium'
                >
                  Beta
                </Badge>
              )}
              <CardHeader>
                <CardTitle className='text-lg'>{feature.title}</CardTitle>
                <div>
                  <Badge variant='neutral' size='sm' emphasis='light'>
                    {feature.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Event Cards */}
      <div>
        <h3 className='mb-4 text-lg font-semibold'>Event Cards</h3>
        <div className='grid gap-4 md:grid-cols-3'>
          {events.map((event) => (
            <Card key={event.title}>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <CardTitle className='text-lg'>{event.title}</CardTitle>
                  <EventBadge
                    type={event.type}
                    status={event.status}
                    size='sm'
                  />
                </div>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                  <Calendar className='h-3 w-3' />
                  {event.date}
                </div>
                {event.location && (
                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <MapPin className='h-3 w-3' />
                    {event.location}
                  </div>
                )}
                {event.attendees && (
                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <Users className='h-3 w-3' />
                    {event.attendees} attendees
                  </div>
                )}
                {event.participants && (
                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <Users className='h-3 w-3' />
                    {event.participants} participants
                  </div>
                )}
                {event.priority && (
                  <Badge variant='error' size='sm' emphasis='light'>
                    High Priority
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}
      <div>
        <h3 className='mb-4 text-lg font-semibold'>Pricing Cards</h3>
        <div className='grid gap-4 md:grid-cols-3'>
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular ? 'border-primary' : ''}
            >
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.popular && (
                    <Badge variant='brand' shimmer>
                      Most Popular
                    </Badge>
                  )}
                </div>
                <div className='text-3xl font-bold'>{plan.price}</div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <ul className='space-y-2 text-sm'>
                  {plan.features.map((feature) => (
                    <li key={feature} className='flex items-center gap-2'>
                      <span className='text-green-500'>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className='w-full'
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
