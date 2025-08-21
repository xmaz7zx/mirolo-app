import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    console.log('Auth callback - code:', code ? 'present' : 'missing')
    console.log('Auth callback - origin:', origin)

    if (code) {
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
              try {
                cookieStore.set({
                  name,
                  value,
                  ...options,
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax',
                })
              } catch (error) {
                console.error('Cookie set error:', error)
              }
            },
            remove(name: string, options: any) {
              try {
                cookieStore.delete({
                  name,
                  ...options,
                })
              } catch (error) {
                console.error('Cookie remove error:', error)
              }
            },
          },
        }
      )

      console.log('Exchanging code for session...')
      const { data: session, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Session exchange error:', error)
        return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`)
      }

      if (session) {
        console.log('Session created successfully')
        
        // Create proper redirect response
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        let redirectUrl: string
        if (isLocalEnv) {
          redirectUrl = `${origin}${next}`
        } else if (forwardedHost) {
          redirectUrl = `https://${forwardedHost}${next}`
        } else {
          redirectUrl = `${origin}${next}`
        }
        
        console.log('Redirecting to:', redirectUrl)
        return NextResponse.redirect(redirectUrl)
      }
    }

    console.log('No code provided or session creation failed')
    return NextResponse.redirect(`${origin}/auth/error?message=Authentication failed`)
  } catch (error) {
    console.error('Auth callback error:', error)
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/auth/error?message=Internal server error`)
  }
}