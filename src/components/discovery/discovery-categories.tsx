'use client'

import { Button } from '@/components/ui/button'

const CATEGORIES = [
  { id: 'alle', label: 'Alle', emoji: '🍽️' },
  { id: 'italienisch', label: 'Italienisch', emoji: '🍝' },
  { id: 'asiatisch', label: 'Asiatisch', emoji: '🍜' },
  { id: 'deutsch', label: 'Deutsch', emoji: '🥨' },
  { id: 'vegetarisch', label: 'Vegetarisch', emoji: '🥗' },
  { id: 'dessert', label: 'Dessert', emoji: '🍰' },
  { id: 'schnell', label: 'Schnell', emoji: '⚡' },
  { id: 'gesund', label: 'Gesund', emoji: '🥑' },
]

interface DiscoveryCategoriesProps {
  selectedCategory: string | null
  onCategorySelect: (category: string | null) => void
  className?: string
}

export default function DiscoveryCategories({
  selectedCategory,
  onCategorySelect,
  className
}: DiscoveryCategoriesProps) {

  const handleCategorySelect = (categoryId: string) => {
    if (categoryId === 'alle') {
      onCategorySelect(null)
    } else {
      onCategorySelect(categoryId === selectedCategory ? null : categoryId)
    }
  }

  return (
    <div className={`space-y-3 ${className || ''}`}>
      <h2 className="text-lg font-semibold text-foreground">
        Kategorien
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATEGORIES.map((category) => {
          const isSelected = category.id === 'alle' 
            ? selectedCategory === null 
            : selectedCategory === category.id
          
          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => handleCategorySelect(category.id)}
              className="h-auto p-4 flex-col gap-2 text-xs"
            >
              <span className="text-lg">{category.emoji}</span>
              <span>{category.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}