'use client'

import { ReactNode } from 'react'
import TopHeader from '@/components/navigation/top-header'
import BottomNav from '@/components/navigation/bottom-nav'

interface MainLayoutProps {
  children: ReactNode
  headerProps?: {
    title?: string
    showBack?: boolean
    showNotifications?: boolean
    showSettings?: boolean
    action?: ReactNode
  }
  className?: string
  noPadding?: boolean
}

export default function MainLayout({
  children,
  headerProps,
  className,
  noPadding = false,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopHeader {...headerProps} />
      
      <main className={`pb-20 ${!noPadding ? 'pt-4' : ''} ${className || ''}`}>
        {noPadding ? (
          children
        ) : (
          <div className="container-mobile">
            {children}
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  )
}