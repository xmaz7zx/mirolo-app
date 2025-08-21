import { NextResponse } from 'next/server'

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

    console.log('Redirecting to confirm page with code')
    return NextResponse.redirect(new URL(`/auth/confirm?code=${encodeURIComponent(code)}`, url.origin))
    
  } catch (error) {
    console.error('Callback error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}