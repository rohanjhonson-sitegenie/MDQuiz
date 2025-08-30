import { Link } from '@tanstack/react-router'
import {
  Sparkles,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FooterLink {
  name: string
  href: string
}

interface FooterLinkSection {
  title: string
  links: FooterLink[]
}

interface SocialLink {
  name: string
  href: string
  icon: string
}

interface NewsletterData {
  title: string
  placeholder: string
}

export interface FooterMDXData {
  description: string
  newsletter: NewsletterData
  links: FooterLinkSection[]
  social: SocialLink[]
  copyright: string
  builtWith: string
  starOnGithub: string
}

interface FooterProps {
  footerData?: FooterMDXData
  className?: string
}

export function Footer({ footerData, className }: FooterProps = {}) {
  const iconMap = {
    Github,
    Twitter,
    Linkedin,
    Youtube,
  } as const

  const socialLinks =
    footerData?.social?.map((social) => ({
      ...social,
      icon: iconMap[social.icon as keyof typeof iconMap] || Github,
    })) || []

  return (
    <footer
      className={`bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t backdrop-blur ${className || ''}`}
    >
      <div className='container py-12 md:py-16 lg:py-20'>
        <div className='grid gap-8 lg:grid-cols-5'>
          <div className='lg:col-span-2'>
            <Link to='/' className='flex items-center space-x-2'>
              <div className='bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg'>
                <Sparkles className='h-5 w-5' />
              </div>
              <span className='text-lg font-bold'>CT-Boilerplate</span>
            </Link>
            <p className='text-muted-foreground mt-4 max-w-xs text-sm'>
              {footerData?.description}
            </p>

            <div className='mt-6'>
              <h4 className='mb-3 text-sm font-semibold'>
                {footerData?.newsletter?.title}
              </h4>
              <form className='flex max-w-sm gap-2'>
                <Input
                  type='email'
                  placeholder={footerData?.newsletter?.placeholder}
                  className='flex-1'
                />
                <Button size='sm'>
                  <Mail className='h-4 w-4' />
                </Button>
              </form>
            </div>

            <div className='mt-6 flex gap-4'>
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-muted-foreground hover:text-primary transition-colors'
                    aria-label={social.name}
                  >
                    <Icon className='h-5 w-5' />
                  </a>
                )
              })}
            </div>
          </div>

          <div className='grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-3'>
            {footerData?.links?.map((section) => (
              <div key={section.title}>
                <h3 className='mb-4 text-sm font-semibold'>{section.title}</h3>
                <ul className='space-y-3'>
                  {section.links.map((link) => (
                    <li key={link.name}>
                      {link.href.startsWith('#') ? (
                        <a
                          href={link.href}
                          className='text-muted-foreground hover:text-primary text-sm transition-colors'
                          onClick={(e) => {
                            e.preventDefault()
                            const element = document.querySelector(link.href)
                            element?.scrollIntoView({ behavior: 'smooth' })
                          }}
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className='text-muted-foreground hover:text-primary text-sm transition-colors'
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-12 border-t pt-8'>
          <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
            <div className='flex flex-col items-center gap-2 md:flex-row md:gap-4'>
              <p className='text-muted-foreground text-sm'>
                © {new Date().getFullYear()} CT-Boilerplate.{' '}
                {footerData?.copyright}
              </p>
              <div className='text-muted-foreground hidden md:block'>•</div>
              <p className='text-muted-foreground text-sm'>
                {footerData?.builtWith}
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <Button variant='ghost' size='sm' asChild>
                <a
                  href='https://github.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='gap-2'
                >
                  <Github className='h-4 w-4' />
                  {footerData?.starOnGithub}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
