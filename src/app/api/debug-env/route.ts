import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
    supabase_key_first_10: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) || 'not set',
    app_url: process.env.NEXT_PUBLIC_APP_URL || 'not set',
    openai_key_exists: !!process.env.OPENAI_API_KEY,
    node_env: process.env.NODE_ENV,
    all_env_keys: Object.keys(process.env).filter(key => key.includes('NEXT_PUBLIC')),
  })
}