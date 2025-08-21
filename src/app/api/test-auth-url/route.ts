import { NextResponse } from 'next/server'

export async function GET() {
  // Simulate what the signInWithEmail function would do
  const getBaseUrl = () => {
    return 'https://mirolo-app.vercel.app'
  }

  const redirectUrl = `${getBaseUrl()}/auth-callback.html`
  
  return NextResponse.json({
    baseUrl: getBaseUrl(),
    redirectUrl: redirectUrl,
    nodeEnv: process.env.NODE_ENV,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    timestamp: new Date().toISOString()
  })
}