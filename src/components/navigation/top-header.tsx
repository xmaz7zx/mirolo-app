'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Bell, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthContext } from '@/components/providers/auth-provider'

interface TopHeaderProps {
  title?: string
  showBack?: boolean
  showNotifications?: boolean
  showSettings?: boolean
  action?: React.ReactNode
}

export default function TopHeader({
  title,
  showBack = false,
  showNotifications = false,
  showSettings = false,
  action,
}: TopHeaderProps) {
  const pathname = usePathname()
  const { user } = useAuthContext()

  // Don't show header on auth pages and landing
  if (pathname?.startsWith('/auth') || pathname === '/') {
    return null
  }

  // Default titles based on route
  const getDefaultTitle = () => {
    if (pathname === '/dashboard') return 'Meine Rezepte'
    if (pathname === '/suche') return 'Rezepte suchen'
    if (pathname?.startsWith('/rezept/neu')) return 'Neues Rezept'
    if (pathname === '/entdecken') return 'Entdecken'
    if (pathname === '/profil') return 'Profil'
    return 'Mirolo'
  }

  const displayTitle = title || getDefaultTitle()

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border safe-area-top">
      <div className="container-mobile">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left side */}
          <div className="flex items-center gap-2">
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="p-2"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            
            {!showBack && (
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">M</span>
                </div>
              </Link>
            )}
          </div>

          {/* Center - Title */}
          <div className="flex-1 text-center">
            <h1 className="font-semibold text-foreground truncate">
              {displayTitle}
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {action}
            
            {showNotifications && (
              <Button variant="ghost" size="sm" className="p-2 relative">
                <Bell size={20} />
                {/* Notification badge */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></div>
              </Button>
            )}
            
            {showSettings && (
              <Link href="/profil/einstellungen">
                <Button variant="ghost" size="sm" className="p-2">
                  <Settings size={20} />
                </Button>
              </Link>
            )}

            {user && (
              <Link href="/profil">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {user.profile?.avatar_url ? (
                    <img
                      src={user.profile.avatar_url}
                      alt={user.profile.display_name || 'Avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">
                      {user.profile?.display_name?.[0] || user.email?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}