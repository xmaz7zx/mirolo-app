import { NextResponse } from 'next/server'

export async function GET() {
  const anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return NextResponse.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
    key_length: anon_key?.length || 0,
    key_has_newlines: anon_key?.includes('\n') || false,
    key_has_carriage_returns: anon_key?.includes('\r') || false,
    key_has_spaces: anon_key?.includes(' ') || false,
    key_starts_with: anon_key?.substring(0, 20) || 'not set',
    key_ends_with: anon_key?.substring(anon_key.length - 20) || 'not set',
    full_key: anon_key || 'not set',
    expected_length: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuY3l6c3pqY2ZvZmlmbWVmc21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Nzk2MTgsImV4cCI6MjA3MTI1NTYxOH0.G25p9fFYkuJxQNBfF8ibqwIW832gBQwxs2nyk8ldnkk'.length,
    keys_match: anon_key === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuY3l6c3pqY2ZvZmlmbWVmc21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Nzk2MTgsImV4cCI6MjA3MTI1NTYxOH0.G25p9fFYkuJxQNBfF8ibqwIW832gBQwxs2nyk8ldnkk'
  })
}