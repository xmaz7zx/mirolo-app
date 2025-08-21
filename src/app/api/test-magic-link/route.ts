import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    console.log('=== MAGIC LINK TEST ===')
    console.log('Email:', email)
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
    
    const redirectUrl = 'https://mirolo-app.vercel.app/auth-callback.html'
    console.log('Using redirect URL:', redirectUrl)
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() { return null },
          set() {},
          remove() {},
        },
      }
    )
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })
    
    console.log('Supabase response:', { data, error })
    
    return NextResponse.json({
      success: !error,
      email,
      redirectUrl,
      environment: process.env.NODE_ENV,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      error: error?.message,
      data
    })
    
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}