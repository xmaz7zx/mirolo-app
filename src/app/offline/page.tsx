'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { WifiOff, RefreshCw, Home, Book } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload()
    }
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            isOnline ? 'bg-green-100' : 'bg-muted'
          }`}>
            <WifiOff size={32} className={isOnline ? 'text-green-600' : 'text-muted-foreground'} />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isOnline ? 'Verbindung wiederhergestellt!' : 'Du bist offline'}
          </h1>
          
          <p className="text-muted-foreground">
            {isOnline 
              ? 'Du kannst jetzt wieder online gehen.'
              : 'Deine gespeicherten Rezepte sind weiterhin verfügbar.'
            }
          </p>
        </div>

        <div className="card-mirolo">
          <div className="space-y-4">
            {isOnline ? (
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw size={16} className="mr-2" />
                Seite neu laden
              </Button>
            ) : (
              <>
                <div className="p-4 bg-primary/10 rounded-lg mb-4">
                  <h3 className="font-medium text-foreground mb-2">Verfügbar offline:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Deine gespeicherten Rezepte</li>
                    <li>• Favoriten ansehen</li>
                    <li>• Portionen umrechnen</li>
                    <li>• Timer verwenden</li>
                  </ul>
                </div>

                <Button onClick={handleGoHome} className="w-full">
                  <Home size={16} className="mr-2" />
                  Zur Startseite
                </Button>

                <Link href="/dashboard" className="block">
                  <Button variant="outline" className="w-full">
                    <Book size={16} className="mr-2" />
                    Meine Rezepte
                  </Button>
                </Link>
              </>
            )}

            <Button 
              variant="ghost" 
              onClick={handleRetry}
              disabled={!isOnline}
              className="w-full"
            >
              <RefreshCw size={16} className="mr-2" />
              Erneut versuchen
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs text-muted-foreground">
            {isOnline 
              ? '🟢 Online - Alle Features verfügbar'
              : '🔴 Offline - Eingeschränkte Funktionen'
            }
          </p>
        </div>
      </div>
    </div>
  )
}