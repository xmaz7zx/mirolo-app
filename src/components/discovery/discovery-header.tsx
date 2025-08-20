'use client'

import { Button } from '@/components/ui/button'
import { Search, Sparkles, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function DiscoveryHeader() {
  return (
    <div className="text-center space-y-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto">
        <Sparkles size={32} className="text-primary" />
      </div>
      
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Rezepte entdecken
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Entdecke neue Lieblingsrezepte von unserer Community. 
          Lass dich von kreativen Ideen und beliebten Gerichten inspirieren.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link href="/suche">
          <Button variant="outline" className="w-full sm:w-auto">
            <Search size={16} className="mr-2" />
            Rezepte suchen
          </Button>
        </Link>
        
        <Link href="/rezept/neu">
          <Button className="w-full sm:w-auto">
            <TrendingUp size={16} className="mr-2" />
            Eigenes Rezept teilen
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">1.2k+</div>
          <div className="text-xs text-muted-foreground">Rezepte</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">250+</div>
          <div className="text-xs text-muted-foreground">Köche</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">5k+</div>
          <div className="text-xs text-muted-foreground">Bewertungen</div>
        </div>
      </div>
    </div>
  )
}