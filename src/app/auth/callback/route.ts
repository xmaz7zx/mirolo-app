import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    
    if (!code) {
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=No code provided`)
    }

    // Simple redirect to a client-side page that will handle the auth
    return NextResponse.redirect(`${requestUrl.origin}/auth/confirm?code=${code}`)
  } catch (error: any) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${request.url.split('?')[0].replace('/auth/callback', '/auth/error')}?message=Server error`)
  }
}