'use client'

import RecipeCard from '@/components/recipe/recipe-card'
import { LoadingSpinner } from '@/components/ui/loading'
import { TrendingUp, Fire } from 'lucide-react'
import type { Recipe } from '@/types'

interface TrendingRecipesProps {
  recipes: Recipe[]
  isLoading: boolean
  className?: string
}

export default function TrendingRecipes({
  recipes,
  isLoading,
  className
}: TrendingRecipesProps) {

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className || ''}`}>
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-orange-500" />
          <h2 className="text-xl font-semibold text-foreground">
            Im Trend
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
          <TrendingUp size={20} className="text-orange-500" />
          <h2 className="text-xl font-semibold text-foreground">
            Im Trend
          </h2>
        </div>

        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Momentan keine Trend-Rezepte verfügbar
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-orange-500" />
          <h2 className="text-xl font-semibold text-foreground">
            Im Trend
          </h2>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Letzte 7 Tage
        </div>
      </div>

      {/* Trending Recipes Grid */}
      <div className="space-y-4">
        {recipes.slice(0, 5).map((recipe, index) => (
          <div key={recipe.id} className="relative">
            {/* Trending Badge */}
            {index < 3 && (
              <div className="absolute top-4 left-4 z-10">
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                  index === 0 
                    ? 'bg-orange-500 text-white' 
                    : index === 1
                    ? 'bg-orange-400 text-white'
                    : 'bg-orange-300 text-orange-900'
                }`}>
                  <Fire size={10} />
                  #{index + 1} Trend
                </div>
              </div>
            )}

            <RecipeCard
              recipe={recipe}
              className={index < 3 ? 'border border-orange-200 bg-orange-50/30' : ''}
            />
          </div>
        ))}
      </div>

      {/* View All Trending */}
      <div className="text-center pt-2">
        <button className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1 mx-auto">
          <Fire size={14} />
          Alle Trend-Rezepte ansehen
        </button>
      </div>
    </div>
  )
}