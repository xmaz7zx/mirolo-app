'use client'

import Link from 'next/link'
import { Heart, Clock, Users, ChefHat, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToggleFavorite } from '@/hooks/useRecipes'
import { formatCookingTime, getDifficultyColor, getDifficultyText } from '@/lib/utils'
import type { Recipe, RecipeWithDetails } from '@/types'

interface RecipeCardProps {
  recipe: Recipe | RecipeWithDetails
  onToggleFavorite?: () => void
  className?: string
}

export default function RecipeCard({ recipe, onToggleFavorite, className }: RecipeCardProps) {
  const toggleFavorite = useToggleFavorite()

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking heart
    e.stopPropagation()
    
    if (onToggleFavorite) {
      onToggleFavorite()
    } else {
      toggleFavorite.mutate(recipe.id)
    }
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // TODO: Implement menu functionality
  }

  const mainPhoto = 'photos' in recipe ? recipe.photos?.find(p => p.photo_type === 'main') : null

  return (
    <Link href={`/rezept/${recipe.id}`} className={`block ${className || ''}`}>
      <div className="recipe-card group">
        {/* Image */}
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 relative overflow-hidden">
          {mainPhoto ? (
            <img 
              src={mainPhoto.photo_url}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl opacity-50">🍳</span>
            </div>
          )}

          {/* Overlay Actions */}
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              disabled={toggleFavorite.isPending}
              className={`w-8 h-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90 ${
                recipe.is_favorite ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart size={16} fill={recipe.is_favorite ? 'currentColor' : 'none'} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleMenuClick}
              className="w-8 h-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90 text-muted-foreground"
            >
              <MoreVertical size={16} />
            </Button>
          </div>

          {/* Difficulty Badge */}
          {recipe.difficulty && (
            <div className="absolute bottom-2 left-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                {getDifficultyText(recipe.difficulty)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>

          {recipe.summary && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {recipe.summary}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {recipe.total_minutes && (
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{formatCookingTime(recipe.total_minutes)}</span>
                </div>
              )}

              {recipe.servings && (
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  <span>{recipe.servings} Portionen</span>
                </div>
              )}

              {recipe.cuisine && (
                <span className="px-2 py-1 bg-muted rounded-full">
                  {recipe.cuisine}
                </span>
              )}
            </div>

            {/* Author */}
            {'profile' in recipe && recipe.profile && (
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  {recipe.profile.avatar_url ? (
                    <img 
                      src={recipe.profile.avatar_url}
                      alt={recipe.profile.display_name || 'User'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-primary text-xs">
                      {recipe.profile.display_name?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <span className="text-xs">
                  {recipe.profile.display_name || 'Unbekannt'}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {'tags' in recipe && recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {recipe.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {tag.name}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                  +{recipe.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}