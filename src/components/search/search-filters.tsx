'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Clock, ChefHat, MapPin, Tag, ArrowUpDown } from 'lucide-react'
import { getDifficultyText } from '@/lib/utils'
import type { SearchFilters, Difficulty } from '@/types'

interface SearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onClose: () => void
  className?: string
}

const CUISINES = [
  'Deutsch', 'Italienisch', 'Französisch', 'Spanisch', 'Griechisch',
  'Asiatisch', 'Chinesisch', 'Japanisch', 'Koreanisch', 'Thai',
  'Indisch', 'Mexikanisch', 'Amerikanisch', 'Mediterran',
  'Vegetarisch', 'Vegan', 'Glutenfrei'
]

const POPULAR_TAGS = [
  'schnell', 'einfach', 'gesund', 'low-carb', 'high-protein',
  'comfort-food', 'party', 'familie', 'romantisch', 'festlich',
  'meal-prep', 'one-pot', 'backfreundlich', 'grillen', 'dessert'
]

const TIME_OPTIONS = [
  { value: 15, label: 'Bis 15 Min' },
  { value: 30, label: 'Bis 30 Min' },
  { value: 45, label: 'Bis 45 Min' },
  { value: 60, label: 'Bis 1 Stunde' },
  { value: 120, label: 'Bis 2 Stunden' }
]

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevanz' },
  { value: 'newest', label: 'Neueste zuerst' },
  { value: 'oldest', label: 'Älteste zuerst' },
  { value: 'rating', label: 'Bewertung' },
  { value: 'time_asc', label: 'Zeit ↑' },
  { value: 'time_desc', label: 'Zeit ↓' },
  { value: 'difficulty_asc', label: 'Einfachste zuerst' },
  { value: 'difficulty_desc', label: 'Schwierigste zuerst' }
]

export default function SearchFilters({
  filters,
  onFiltersChange,
  onClose,
  className
}: SearchFiltersProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const toggleCuisine = (cuisine: string) => {
    const newCuisines = filters.cuisine.includes(cuisine)
      ? filters.cuisine.filter(c => c !== cuisine)
      : [...filters.cuisine, cuisine]
    
    onFiltersChange({ ...filters, cuisine: newCuisines })
  }

  const toggleDifficulty = (difficulty: Difficulty) => {
    const newDifficulties = filters.difficulty.includes(difficulty)
      ? filters.difficulty.filter(d => d !== difficulty)
      : [...filters.difficulty, difficulty]
    
    onFiltersChange({ ...filters, difficulty: newDifficulties })
  }

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    
    onFiltersChange({ ...filters, tags: newTags })
  }

  const setMaxTime = (time: number | null) => {
    onFiltersChange({ ...filters, maxTime: time })
  }

  const setSortBy = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      cuisine: [],
      difficulty: [],
      maxTime: null,
      tags: [],
      sortBy: 'relevance'
    })
  }

  const hasActiveFilters = filters.cuisine.length > 0 || 
                          filters.difficulty.length > 0 || 
                          filters.maxTime !== null || 
                          filters.tags.length > 0 ||
                          filters.sortBy !== 'relevance'

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section)
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">Filter</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              {[...filters.cuisine, ...filters.difficulty, ...filters.tags].length + 
               (filters.maxTime ? 1 : 0) + (filters.sortBy !== 'relevance' ? 1 : 0)}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Zurücksetzen
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <button
          onClick={() => toggleSection('sort')}
          className="flex items-center gap-2 w-full text-left"
        >
          <ArrowUpDown size={14} className="text-muted-foreground" />
          <span className="text-sm font-medium">Sortierung</span>
        </button>
        
        {activeSection === 'sort' && (
          <Select value={filters.sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Max Time */}
      <div className="space-y-2">
        <button
          onClick={() => toggleSection('time')}
          className="flex items-center gap-2 w-full text-left"
        >
          <Clock size={14} className="text-muted-foreground" />
          <span className="text-sm font-medium">Zubereitungszeit</span>
          {filters.maxTime && (
            <Badge variant="secondary" className="text-xs">
              ≤ {filters.maxTime} Min
            </Badge>
          )}
        </button>

        {activeSection === 'time' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {TIME_OPTIONS.map(option => (
                <Button
                  key={option.value}
                  variant={filters.maxTime === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMaxTime(option.value)}
                  className="text-xs justify-start"
                >
                  {option.label}
                </Button>
              ))}
            </div>
            {filters.maxTime && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMaxTime(null)}
                className="w-full text-xs"
              >
                Zeit-Filter entfernen
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <button
          onClick={() => toggleSection('difficulty')}
          className="flex items-center gap-2 w-full text-left"
        >
          <ChefHat size={14} className="text-muted-foreground" />
          <span className="text-sm font-medium">Schwierigkeit</span>
          {filters.difficulty.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.difficulty.length}
            </Badge>
          )}
        </button>

        {activeSection === 'difficulty' && (
          <div className="space-y-2">
            {DIFFICULTIES.map(difficulty => (
              <div key={difficulty} className="flex items-center space-x-2">
                <Checkbox
                  id={difficulty}
                  checked={filters.difficulty.includes(difficulty)}
                  onCheckedChange={() => toggleDifficulty(difficulty)}
                />
                <label 
                  htmlFor={difficulty}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {getDifficultyText(difficulty)}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cuisine */}
      <div className="space-y-2">
        <button
          onClick={() => toggleSection('cuisine')}
          className="flex items-center gap-2 w-full text-left"
        >
          <MapPin size={14} className="text-muted-foreground" />
          <span className="text-sm font-medium">Küche & Ernährung</span>
          {filters.cuisine.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.cuisine.length}
            </Badge>
          )}
        </button>

        {activeSection === 'cuisine' && (
          <div className="max-h-48 overflow-y-auto space-y-2">
            {CUISINES.map(cuisine => (
              <div key={cuisine} className="flex items-center space-x-2">
                <Checkbox
                  id={cuisine}
                  checked={filters.cuisine.includes(cuisine)}
                  onCheckedChange={() => toggleCuisine(cuisine)}
                />
                <label 
                  htmlFor={cuisine}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {cuisine}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <button
          onClick={() => toggleSection('tags')}
          className="flex items-center gap-2 w-full text-left"
        >
          <Tag size={14} className="text-muted-foreground" />
          <span className="text-sm font-medium">Tags</span>
          {filters.tags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.tags.length}
            </Badge>
          )}
        </button>

        {activeSection === 'tags' && (
          <div className="max-h-48 overflow-y-auto space-y-2">
            {POPULAR_TAGS.map(tag => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={tag}
                  checked={filters.tags.includes(tag)}
                  onCheckedChange={() => toggleTag(tag)}
                />
                <label 
                  htmlFor={tag}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {tag}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Aktive Filter:</p>
          <div className="flex flex-wrap gap-1">
            {filters.cuisine.map(cuisine => (
              <Badge key={cuisine} variant="secondary" className="text-xs">
                {cuisine}
                <button
                  onClick={() => toggleCuisine(cuisine)}
                  className="ml-1 hover:text-destructive"
                >
                  <X size={10} />
                </button>
              </Badge>
            ))}
            {filters.difficulty.map(difficulty => (
              <Badge key={difficulty} variant="secondary" className="text-xs">
                {getDifficultyText(difficulty)}
                <button
                  onClick={() => toggleDifficulty(difficulty)}
                  className="ml-1 hover:text-destructive"
                >
                  <X size={10} />
                </button>
              </Badge>
            ))}
            {filters.maxTime && (
              <Badge variant="secondary" className="text-xs">
                ≤ {filters.maxTime} Min
                <button
                  onClick={() => setMaxTime(null)}
                  className="ml-1 hover:text-destructive"
                >
                  <X size={10} />
                </button>
              </Badge>
            )}
            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X size={10} />
                </button>
              </Badge>
            ))}
            {filters.sortBy !== 'relevance' && (
              <Badge variant="secondary" className="text-xs">
                {SORT_OPTIONS.find(o => o.value === filters.sortBy)?.label}
                <button
                  onClick={() => setSortBy('relevance')}
                  className="ml-1 hover:text-destructive"
                >
                  <X size={10} />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}