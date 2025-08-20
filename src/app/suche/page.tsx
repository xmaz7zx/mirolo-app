'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import SearchHeader from '@/components/search/search-header'
import SearchFilters from '@/components/search/search-filters'
import SearchResults from '@/components/search/search-results'
import { useAdvancedSearchRecipes } from '@/hooks/useRecipes'
import type { SearchFilters as SearchFiltersType } from '@/types'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState<SearchFiltersType>({
    cuisine: [],
    difficulty: [],
    maxTime: null,
    tags: [],
    sortBy: 'relevance'
  })
  const [showFilters, setShowFilters] = useState(false)

  const { 
    data: searchResults,
    isLoading,
    error,
    refetch
  } = useAdvancedSearchRecipes({
    query: searchQuery,
    filters,
    enabled: searchQuery.length > 0 || Object.values(filters).some(v => 
      Array.isArray(v) ? v.length > 0 : v !== null && v !== 'relevance'
    )
  })

  // Update search query from URL params
  useEffect(() => {
    const query = searchParams.get('q')
    if (query && query !== searchQuery) {
      setSearchQuery(query)
    }
  }, [searchParams, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Update URL without navigation
    const newUrl = new URL(window.location.href)
    if (query) {
      newUrl.searchParams.set('q', query)
    } else {
      newUrl.searchParams.delete('q')
    }
    window.history.replaceState({}, '', newUrl.toString())
  }

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setFilters({
      cuisine: [],
      difficulty: [],
      maxTime: null,
      tags: [],
      sortBy: 'relevance'
    })
    // Clear URL params
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('q')
    window.history.replaceState({}, '', newUrl.toString())
  }

  const hasActiveSearch = searchQuery.length > 0 || Object.values(filters).some(v => 
    Array.isArray(v) ? v.length > 0 : v !== null && v !== 'relevance'
  )

  const resultCount = searchResults?.length || 0

  return (
    <MainLayout
      headerProps={{
        title: 'Suchen',
        showBack: true,
      }}
      noPadding
    >
      <div className="container-mobile">
        {/* Search Header */}
        <div className="py-4 border-b border-border">
          <SearchHeader
            query={searchQuery}
            onSearch={handleSearch}
            onToggleFilters={() => setShowFilters(!showFilters)}
            hasActiveFilters={Object.values(filters).some(v => 
              Array.isArray(v) ? v.length > 0 : v !== null && v !== 'relevance'
            )}
            resultCount={hasActiveSearch ? resultCount : null}
            onClear={hasActiveSearch ? clearSearch : undefined}
          />
        </div>

        {/* Search Filters */}
        {showFilters && (
          <div className="py-4 border-b border-border bg-background/95">
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClose={() => setShowFilters(false)}
            />
          </div>
        )}

        {/* Search Results */}
        <div className="py-4">
          <SearchResults
            query={searchQuery}
            results={searchResults || []}
            isLoading={isLoading}
            error={error}
            hasActiveSearch={hasActiveSearch}
            onRetry={refetch}
          />
        </div>
      </div>
    </MainLayout>
  )
}