'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthContext } from '@/components/providers/auth-provider'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

// Routes that don't require authentication
const publicRoutes = ['/', '/auth']

// Routes that redirect to dashboard if authenticated
const guestOnlyRoutes = ['/auth']

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // Check if current route requires authentication
    const isPublicRoute = publicRoutes.some(route => pathname === route)
    const isGuestOnlyRoute = guestOnlyRoutes.some(route => pathname?.startsWith(route))

    if (!user && !isPublicRoute && requireAuth) {
      // User is not authenticated and trying to access protected route
      router.push('/auth')
      return
    }

    if (user && isGuestOnlyRoute) {
      // User is authenticated and trying to access guest-only route
      router.push('/dashboard')
      return
    }
  }, [user, loading, pathname, router, requireAuth])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">M</span>
          </div>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Mirolo wird geladen...</p>
        </div>
      </div>
    )
  }

  // Check authentication requirements
  const isPublicRoute = publicRoutes.some(route => pathname === route)
  
  if (!user && !isPublicRoute && requireAuth) {
    return null // Will redirect via useEffect
  }

  return <>{children}</>
}