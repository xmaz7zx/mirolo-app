'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react'

interface SearchHeaderProps {
  query: string
  onSearch: (query: string) => void
  onToggleFilters: () => void
  hasActiveFilters: boolean
  resultCount: number | null
  onClear?: () => void
  className?: string
}

export default function SearchHeader({
  query,
  onSearch,
  onToggleFilters,
  hasActiveFilters,
  resultCount,
  onClear,
  className
}: SearchHeaderProps) {
  const [localQuery, setLocalQuery] = useState(query)

  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localQuery.trim())
  }

  const handleClear = () => {
    setLocalQuery('')
    onSearch('')
    onClear?.()
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Rezepte, Zutaten, Küche suchen..."
            className="pl-10 pr-10"
            autoFocus
          />
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <Button type="submit" className="px-4">
          <Search size={16} />
        </Button>
      </form>

      {/* Filter Toggle & Results */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className={`relative ${hasActiveFilters ? 'border-primary text-primary' : ''}`}
        >
          <SlidersHorizontal size={14} className="mr-2" />
          Filter
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          )}
        </Button>

        {/* Result Count */}
        {resultCount !== null && (
          <span className="text-sm text-muted-foreground">
            {resultCount === 0 
              ? 'Keine Rezepte gefunden'
              : `${resultCount} ${resultCount === 1 ? 'Rezept' : 'Rezepte'} gefunden`
            }
          </span>
        )}
      </div>

      {/* Active Search Summary */}
      {(query || hasActiveFilters) && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Suche nach:</span>
          {query && (
            <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
              "{query}"
            </span>
          )}
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
              mit Filtern
            </span>
          )}
          {onClear && (
            <Button variant="ghost" size="sm" onClick={onClear} className="text-xs h-6 px-2">
              <X size={12} className="mr-1" />
              Zurücksetzen
            </Button>
          )}
        </div>
      )}
    </div>
  )
}