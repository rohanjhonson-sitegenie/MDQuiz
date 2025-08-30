export interface NavigationItem {
  name: string
  href: string
  highlight?: boolean
  isHashLink?: boolean
}

export interface PublicNavbarProps {
  items: NavigationItem[]
  logoText?: string
  showAuthButtons?: boolean
  className?: string
}
