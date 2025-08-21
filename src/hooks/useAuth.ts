'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { Profile } from '@/types'

export interface AuthUser extends User {
  profile?: Profile
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await createClient().auth.getSession()
        
        if (session?.user) {
          const userWithProfile = await getUserWithProfile(session.user)
          setUser(userWithProfile)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = createClient().auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userWithProfile = await getUserWithProfile(session.user)
          setUser(userWithProfile)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const getUserWithProfile = async (user: User): Promise<AuthUser> => {
    try {
      const { data: profile } = await createClient()
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      return {
        ...user,
        profile: profile || undefined,
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      return user
    }
  }

  const signInWithEmail = async (email: string) => {
    const { data, error } = await createClient().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://mirolo-app.vercel.app/auth-callback.html',
      },
    })

    if (error) throw error
    return data
  }

  const signUp = async (email: string, displayName?: string) => {
    const { data, error } = await createClient().auth.signUp({
      email,
      password: Math.random().toString(36), // Temporary password for OTP signup
      options: {
        emailRedirectTo: 'https://mirolo-app.vercel.app/auth-callback.html',
        data: {
          display_name: displayName,
        },
      },
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await createClient().auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await createClient()
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    // Update local user state
    setUser(prev => prev ? { ...prev, profile: data } : null)
    return data
  }

  return {
    user,
    loading,
    signInWithEmail,
    signUp,
    signOut,
    updateProfile,
  }
}