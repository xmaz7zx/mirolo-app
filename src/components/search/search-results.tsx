'use client'

import { Button } from '@/components/ui/button'
import RecipeCard from '@/components/recipe/recipe-card'
import { LoadingSpinner } from '@/components/ui/loading'
import { Search, AlertCircle, RefreshCw, ChefHat, Sparkles } from 'lucide-react'
import Link from 'next/link'
import type { Recipe } from '@/types'

interface SearchResultsProps {
  query: string
  results: Recipe[]
  isLoading: boolean
  error: any
  hasActiveSearch: boolean
  onRetry: () => void
  className?: string
}

export default function SearchResults({
  query,
  results,
  isLoading,
  error,
  hasActiveSearch,
  onRetry,
  className
}: SearchResultsProps) {

  // Loading state
  if (isLoading) {
    return (
      <div className={`${className || ''}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground mt-4">
              Rezepte werden gesucht...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`${className || ''}`}>
        <div className="text-center py-12">
          <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Fehler beim Suchen
          </h3>
          <p className="text-muted-foreground mb-6">
            Die Suche konnte nicht durchgeführt werden. Bitte versuche es erneut.
          </p>
          <Button onClick={onRetry}>
            <RefreshCw size={16} className="mr-2" />
            Erneut versuchen
          </Button>
        </div>
      </div>
    )
  }

  // No active search - show welcome state
  if (!hasActiveSearch) {
    return (
      <div className={`${className || ''}`}>
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Rezepte entdecken
          </h2>
          
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Suche nach Rezepten, Zutaten oder Küchenstilen. 
            Verwende Filter um genau das zu finden, wonach du suchst.
          </p>

          {/* Quick Search Suggestions */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Beliebte Suchbegriffe:
            </h3>
            
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Pasta', 'Vegetarisch', 'Schnell & Einfach', 
                'Italienisch', 'Dessert', 'Low Carb',
                'One Pot', 'Grillen', 'Comfort Food'
              ].map((term) => (
                <Link 
                  key={term} 
                  href={`/suche?q=${encodeURIComponent(term)}`}
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs hover:bg-primary/10 hover:border-primary hover:text-primary"
                  >
                    {term}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Alternative Actions */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <Link href="/entdecken">
                <Button variant="outline" className="w-full">
                  <Sparkles size={16} className="mr-2" />
                  Rezepte entdecken
                </Button>
              </Link>
              
              <Link href="/rezept/neu">
                <Button className="w-full">
                  <ChefHat size={16} className="mr-2" />
                  Eigenes Rezept
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No results found
  if (results.length === 0) {
    return (
      <div className={`${className || ''}`}>
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-muted-foreground" />
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Keine Rezepte gefunden
          </h3>
          
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {query 
              ? `Für "${query}" wurden keine passenden Rezepte gefunden.`
              : 'Mit den gewählten Filtern wurden keine Rezepte gefunden.'
            }
          </p>

          {/* Search Tips */}
          <div className="text-left max-w-md mx-auto mb-8 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-foreground mb-2 text-sm">
              Suchtipps:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Überprüfe die Schreibweise</li>
              <li>• Verwende allgemeinere Suchbegriffe</li>
              <li>• Reduziere die aktiven Filter</li>
              <li>• Suche nach Zutaten statt Rezeptnamen</li>
            </ul>
          </div>

          {/* Alternative Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/entdecken">
              <Button variant="outline">
                <Sparkles size={16} className="mr-2" />
                Beliebte Rezepte ansehen
              </Button>
            </Link>
            
            <Link href="/rezept/neu">
              <Button>
                <ChefHat size={16} className="mr-2" />
                Eigenes Rezept erstellen
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Results found
  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Suchergebnisse
        </h2>
        
        <span className="text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? 'Rezept' : 'Rezepte'}
        </span>
      </div>

      {/* Search Query Highlight */}
      {query && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-primary">
            <strong>Suche nach:</strong> "{query}"
          </p>
        </div>
      )}

      {/* Recipe Grid */}
      <div className="grid gap-6">
        {results.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            className="hover:shadow-lg transition-shadow"
          />
        ))}
      </div>

      {/* Load More (if pagination is implemented) */}
      {results.length >= 20 && (
        <div className="text-center pt-6">
          <Button variant="outline" size="lg">
            Mehr Rezepte laden
          </Button>
        </div>
      )}
    </div>
  )
}