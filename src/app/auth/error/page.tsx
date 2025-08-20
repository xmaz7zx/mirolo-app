'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Ein unbekannter Fehler ist aufgetreten'

  const errorMessages: Record<string, string> = {
    'Authentication failed': 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.',
    'Invalid email': 'Ungültige E-Mail-Adresse.',
    'Email not confirmed': 'Bitte bestätige deine E-Mail-Adresse.',
    'Invalid credentials': 'Ungültige Anmeldedaten.',
    'Too many requests': 'Zu viele Anfragen. Bitte warte einen Moment.',
    'User not found': 'Benutzer nicht gefunden.',
    'Email already exists': 'E-Mail-Adresse bereits registriert.',
  }

  const displayMessage = errorMessages[message] || message

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <AlertCircle size={28} className="text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Anmeldung fehlgeschlagen
          </h1>
          <p className="text-muted-foreground">
            Es gab ein Problem bei der Anmeldung
          </p>
        </div>

        <div className="card-mirolo">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive mb-1">Fehler</p>
                <p className="text-sm text-destructive/80">{displayMessage}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/auth" className="block">
              <Button className="w-full">
                <RefreshCw size={16} className="mr-2" />
                Erneut versuchen
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft size={16} className="mr-2" />
                Zur Startseite
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Falls das Problem weiterhin besteht, kontaktiere uns unter{' '}
            <a
              href="mailto:support@mirolo.app"
              className="text-primary hover:underline"
            >
              support@mirolo.app
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}