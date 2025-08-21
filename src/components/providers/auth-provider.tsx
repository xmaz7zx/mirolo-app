'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth, AuthUser } from '@/hooks/useAuth-new'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signInWithEmail: (email: string) => Promise<any>
  signUp: (email: string, displayName?: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}