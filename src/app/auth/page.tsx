'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthContext } from '@/components/providers/auth-provider'
import { LoadingSpinner } from '@/components/ui/loading'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  
  const { signInWithEmail, signUp, user, loading: authLoading } = useAuthContext()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      router.push(redirectTo)
    }
  }, [user, authLoading, router, redirectTo])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        await signUp(email, displayName)
      } else {
        await signInWithEmail(email)
      }
      setEmailSent(true)
    } catch (error: any) {
      setError(error.message || 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">M</span>
          </div>
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
              <CheckCircle size={28} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              E-Mail gesendet!
            </h1>
            <p className="text-muted-foreground">
              Wir haben dir einen magischen Link an <strong>{email}</strong> gesendet.
            </p>
          </div>

          <div className="card-mirolo">
            <div className="flex items-center gap-3 mb-4 p-4 bg-primary/10 rounded-lg">
              <Mail size={20} className="text-primary flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Prüfe deine E-Mails</p>
                <p className="text-muted-foreground">
                  Klicke auf den Link in der E-Mail, um dich anzumelden.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Keine E-Mail erhalten? Prüfe deinen Spam-Ordner oder versuche es erneut.
              </p>
              
              <Button
                variant="outline"
                onClick={() => {
                  setEmailSent(false)
                  setEmail('')
                  setError('')
                }}
                className="w-full"
              >
                Erneut versuchen
              </Button>

              <Link href="/" className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft size={16} className="mr-2" />
                  Zurück zur Startseite
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
              <span className="text-primary-foreground font-bold text-xl">M</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isSignUp ? 'Willkommen bei Mirolo' : 'Willkommen zurück'}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp 
              ? 'Erstelle dein kostenloses Konto und beginne deine Kochreise'
              : 'Melde dich an und entdecke neue Rezepte'
            }
          </p>
        </div>

        {/* Auth Form */}
        <div className="card-mirolo">
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-1">
                  Dein Name (optional)
                </label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="z.B. Maria Schmidt"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                E-Mail-Adresse
              </label>
              <Input
                id="email"
                type="email"
                placeholder="deine@email.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !isValidEmail(email)}
              className="w-full"
            >
              {loading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  {isSignUp ? 'Registrierung...' : 'Anmeldung...'}
                </>
              ) : (
                <>
                  <Mail size={16} className="mr-2" />
                  {isSignUp ? 'Kostenlos registrieren' : 'Mit Magic Link anmelden'}
                </>
              )}
            </Button>
          </form>

          {/* Toggle Sign In/Up */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {isSignUp ? 'Bereits ein Konto?' : 'Noch kein Konto?'}
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setEmail('')
                setDisplayName('')
              }}
              className="text-primary hover:text-primary/80"
            >
              {isSignUp ? 'Jetzt anmelden' : 'Kostenlos registrieren'}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Durch die Anmeldung stimmst du unseren{' '}
            <Link href="/datenschutz" className="text-primary hover:underline">
              Datenschutzbestimmungen
            </Link>{' '}
            und{' '}
            <Link href="/agb" className="text-primary hover:underline">
              AGB
            </Link>{' '}
            zu.
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground">
              <ArrowLeft size={16} className="mr-2" />
              Zurück zur Startseite
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}