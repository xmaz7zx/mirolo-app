import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const createServerSupabaseClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

export async function getUser() {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      ...user,
      profile,
    }
  } catch (error) {
    return null
  }
}

export async function getSession() {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    return null
  }
}

// Client-side auth helpers
export const signInWithEmail = async (email: string) => {
  const { createClient } = await import('@/lib/supabase')
  const supabase = createClient()
  
  // Get the correct base URL for redirects
  const getBaseUrl = () => {
    // If NEXT_PUBLIC_APP_URL is set, use it
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL
    }
    
    // Otherwise, use the current window location (client-side)
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    
    // Fallback for server-side
    return 'https://mirolo-63c8w6s76-xmaz7zxs-projects.vercel.app'
  }
  
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getBaseUrl()}/auth/callback`,
    },
  })
}

export const signOut = async () => {
  const { createClient } = await import('@/lib/supabase')
  const supabase = createClient()
  
  return await supabase.auth.signOut()
}

export const updateProfile = async (updates: {
  display_name?: string
  avatar_url?: string
  bio?: string
}) => {
  const { createClient } = await import('@/lib/supabase')
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  return await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()
}