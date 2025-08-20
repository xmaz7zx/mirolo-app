'use client'

import RecipeCard from '@/components/recipe/recipe-card'
import { LoadingSpinner } from '@/components/ui/loading'
import { Star, TrendingUp } from 'lucide-react'
import type { Recipe } from '@/types'

interface FeaturedRecipesProps {
  recipes: Recipe[]
  isLoading: boolean
  className?: string
}

export default function FeaturedRecipes({
  recipes,
  isLoading,
  className
}: FeaturedRecipesProps) {

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className || ''}`}>
        <div className="flex items-center gap-2">
          <Star size={20} className="text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Empfehlung des Tages
          </h2>
        </div>

        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className={`space-y-4 ${className || ''}`}>
        <div className="flex items-center gap-2">
          <Star size={20} className="text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Empfehlung des Tages
          </h2>
        </div>

        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Momentan keine empfohlenen Rezepte verfügbar
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div className="flex items-center gap-2">
        <Star size={20} className="text-primary" />
        <h2 className="text-xl font-semibold text-foreground">
          Empfehlung des Tages
        </h2>
      </div>

      {/* Featured Recipe (first one) */}
      {recipes[0] && (
        <div className="relative">
          {/* Featured Badge */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Star size={12} fill="currentColor" />
              Empfohlen
            </div>
          </div>

          <RecipeCard
            recipe={recipes[0]}
            className="border-2 border-primary/20 shadow-lg"
          />
        </div>
      )}

      {/* Additional Featured Recipes */}
      {recipes.length > 1 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {recipes.slice(1, 3).map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              className="border border-primary/10"
            />
          ))}
        </div>
      )}

      {/* More Featured Link */}
      {recipes.length > 3 && (
        <div className="text-center pt-2">
          <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 mx-auto">
            <TrendingUp size={14} />
            Weitere Empfehlungen ansehen
          </button>
        </div>
      )}
    </div>
  )
}