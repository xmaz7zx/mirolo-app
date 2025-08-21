'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading'

export default function AuthConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const confirmAuth = async () => {
      try {
        const code = searchParams.get('code')
        
        if (!code) {
          setError('Kein Authentifizierungscode gefunden')
          setLoading(false)
          return
        }

        const supabase = createClient()
        const { data: session, error: authError } = await supabase.auth.exchangeCodeForSession(code)

        if (authError) {
          console.error('Auth error:', authError)
          setError(`Authentifizierung fehlgeschlagen: ${authError.message}`)
          setLoading(false)
          return
        }

        if (session) {
          // Success - redirect to dashboard
          router.push('/dashboard')
        } else {
          setError('Keine Session erstellt')
          setLoading(false)
        }
      } catch (err: any) {
        console.error('Confirmation error:', err)
        setError('Ein unerwarteter Fehler ist aufgetreten')
        setLoading(false)
      }
    }

    confirmAuth()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">
            Anmeldung wird verarbeitet...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5C2.962 18.333 3.924 20 5.464 20z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Anmeldefehler
          </h1>
          <p className="text-muted-foreground mb-6">
            {error}
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Zurück zur Anmeldung
          </button>
        </div>
      </div>
    )
  }

  return null
}