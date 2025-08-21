import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    console.log('Callback hit with URL:', request.url)
    
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    
    console.log('Code parameter:', code ? 'present' : 'missing')
    
    if (!code) {
      console.log('No code, redirecting to error')
      return NextResponse.redirect(new URL('/auth/error?message=No code provided', url.origin))
    }

    // Create response for cookie handling
    const response = NextResponse.redirect(new URL('/dashboard', url.origin))
    const cookieStore = cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name,
              value,
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            })
          },
          remove(name: string, options: any) {
            response.cookies.delete({
              name,
              ...options,
            })
          },
        },
      }
    )

    console.log('Exchanging code for session...')
    const { data: session, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Session exchange error:', error)
      return NextResponse.redirect(new URL(`/auth/error?message=${encodeURIComponent(error.message)}`, url.origin))
    }

    if (!session) {
      console.log('No session created')
      return NextResponse.redirect(new URL('/auth/error?message=No session created', url.origin))
    }

    console.log('Session created successfully, redirecting to dashboard')
    return response
    
  } catch (error: any) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL(`/auth/error?message=Internal server error`, url.origin))
  }
}