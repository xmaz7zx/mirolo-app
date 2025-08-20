'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Plus, Users, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_TABS } from '@/lib/constants'

const navItems = [
  {
    key: NAV_TABS.HOME,
    href: '/dashboard',
    icon: Home,
    label: 'Home',
  },
  {
    key: NAV_TABS.SEARCH,
    href: '/suche',
    icon: Search,
    label: 'Suchen',
  },
  {
    key: NAV_TABS.CREATE,
    href: '/rezept/neu',
    icon: Plus,
    label: 'Erstellen',
    special: true, // Makes the button more prominent
  },
  {
    key: NAV_TABS.DISCOVER,
    href: '/entdecken',
    icon: Users,
    label: 'Entdecken',
  },
  {
    key: NAV_TABS.PROFILE,
    href: '/profil',
    icon: User,
    label: 'Profil',
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  // Don't show navigation on auth pages
  if (pathname?.startsWith('/auth')) {
    return null
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="container-mobile">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ key, href, icon: Icon, label, special }) => {
            const active = isActive(href)
            
            return (
              <Link
                key={key}
                href={href}
                className={cn(
                  'nav-item tap-target',
                  active && 'active',
                  special && 'relative'
                )}
              >
                {special ? (
                  <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg">
                    <Icon size={20} />
                  </div>
                ) : (
                  <>
                    <Icon size={20} />
                    <span className="text-xs font-medium">{label}</span>
                  </>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}