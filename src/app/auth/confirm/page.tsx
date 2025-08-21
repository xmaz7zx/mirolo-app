'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<string>('Lade...')

  useEffect(() => {
    const confirmAuth = async () => {
      try {
        setStatus('Suche nach Authentifizierungscode...')
        const code = searchParams.get('code')
        
        if (!code) {
          setStatus('Fehler: Kein Code gefunden')
          return
        }

        setStatus('Code gefunden, erstelle Session...')
        const supabase = createClient()
        const { data: session, error: authError } = await supabase.auth.exchangeCodeForSession(code)

        if (authError) {
          console.error('Auth error:', authError)
          setStatus(`Fehler: ${authError.message}`)
          return
        }

        if (session) {
          setStatus('Erfolg! Weiterleitung...')
          setTimeout(() => {
            router.push('/dashboard')
          }, 1000)
        } else {
          setStatus('Fehler: Keine Session erstellt')
        }
      } catch (err: any) {
        console.error('Confirmation error:', err)
        setStatus(`Unerwarteter Fehler: ${err.message}`)
      }
    }

    confirmAuth()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-md p-6">
        <h1 className="text-xl font-bold mb-4">Authentifizierung</h1>
        <div className="p-4 bg-gray-100 rounded-lg">
          <p className="text-sm">{status}</p>
        </div>
        <button
          onClick={() => router.push('/auth')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Zurück zur Anmeldung
        </button>
      </div>
    </div>
  )
}