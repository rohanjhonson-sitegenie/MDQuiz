import { Github, Linkedin, Twitter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface TeamMember {
  name: string
  role: string
  avatar: string
  initials: string
  bio: string
  social: {
    twitter: string
    linkedin: string
    github: string
  }
}

interface TeamProps {
  badge?: string
  heading?: string
  description?: string
  team?: TeamMember[]
}

export function Team({ badge, heading, description, team }: TeamProps = {}) {
  const teamData = team || []

  return (
    <section id='team' className='container py-12 sm:py-16'>
      <div className='mx-auto max-w-[58rem] text-center'>
        <Badge variant='outline' className='mb-4'>
          {badge}
        </Badge>
        <h2 className='font-heading text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl'>
          {heading}
        </h2>
        <p className='text-muted-foreground mt-6 text-lg sm:text-xl'>
          {description}
        </p>
      </div>

      <div className='mx-auto mt-16 max-w-7xl'>
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {teamData.map((member, index) => (
            <Card
              key={member.name}
              className={cn(
                'group border-muted/50 bg-background/50 relative overflow-hidden backdrop-blur transition-all hover:shadow-lg',
                'animate-in fade-in-50 slide-in-from-bottom-5'
              )}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both',
              }}
            >
              <CardContent className='p-6'>
                <div className='flex flex-col items-center text-center'>
                  <div className='relative mb-4'>
                    <Avatar className='ring-background group-hover:ring-primary/20 h-24 w-24 ring-4 transition-all'>
                      <AvatarImage
                        src={member.avatar}
                        alt={member.name}
                        className='object-cover'
                      />
                      <AvatarFallback className='text-lg font-semibold'>
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className='absolute -bottom-2 left-1/2 -translate-x-1/2'>
                      <Badge variant='secondary' className='text-xs'>
                        {member.role.split(' ')[0]}
                      </Badge>
                    </div>
                  </div>

                  <h3 className='text-lg font-semibold'>{member.name}</h3>
                  <p className='text-muted-foreground text-sm'>{member.role}</p>
                  <p className='text-muted-foreground/80 mt-2 text-sm'>
                    {member.bio}
                  </p>

                  <div className='mt-4 flex gap-3'>
                    <a
                      href={member.social.twitter}
                      className='text-muted-foreground hover:text-primary transition-colors'
                      aria-label={`${member.name} on Twitter`}
                    >
                      <Twitter className='h-4 w-4' />
                    </a>
                    <a
                      href={member.social.linkedin}
                      className='text-muted-foreground hover:text-primary transition-colors'
                      aria-label={`${member.name} on LinkedIn`}
                    >
                      <Linkedin className='h-4 w-4' />
                    </a>
                    <a
                      href={member.social.github}
                      className='text-muted-foreground hover:text-primary transition-colors'
                      aria-label={`${member.name} on GitHub`}
                    >
                      <Github className='h-4 w-4' />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
