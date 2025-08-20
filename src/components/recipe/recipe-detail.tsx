'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import PortionScaler from './portion-scaler'
import PhotoGallery from '@/components/photo/photo-gallery'
import { useToggleFavorite } from '@/hooks/useRecipes'
import { 
  Heart, 
  Clock, 
  Users, 
  ChefHat, 
  Share2, 
  Edit, 
  MoreVertical,
  CheckCircle2,
  Circle,
  Lightbulb,
  Timer,
  Image as ImageIcon,
  Play
} from 'lucide-react'
import { formatCookingTime, getDifficultyColor, getDifficultyText } from '@/lib/utils'
import type { RecipeWithDetails, Ingredient, RecipeStep } from '@/types'

interface RecipeDetailProps {
  recipe: RecipeWithDetails
  canEdit?: boolean
  onEdit?: () => void
  className?: string
}

export default function RecipeDetail({ 
  recipe, 
  canEdit = false, 
  onEdit,
  className 
}: RecipeDetailProps) {
  const [currentServings, setCurrentServings] = useState(recipe.servings || 4)
  const [scaledIngredients, setScaledIngredients] = useState(recipe.ingredients || [])
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [showPortionScaler, setShowPortionScaler] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)

  const toggleFavorite = useToggleFavorite()

  const handleToggleFavorite = () => {
    toggleFavorite.mutate(recipe.id)
  }

  const toggleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }

  const resetSteps = () => {
    setCompletedSteps([])
  }

  const mainPhoto = recipe.photos?.find(p => p.photo_type === 'main')

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header Image */}
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl overflow-hidden relative group cursor-pointer">
        {mainPhoto ? (
          <>
            <img 
              src={mainPhoto.photo_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
              onClick={() => setSelectedPhotoIndex(0)}
            />
            {recipe.photos && recipe.photos.length > 1 && (
              <div className="absolute top-3 right-3">
                <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  <ImageIcon size={12} />
                  {recipe.photos.length}
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setSelectedPhotoIndex(0)}
              >
                <Play size={20} className="mr-2" />
                Fotos ansehen
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl mb-4 block">🍳</span>
              <p className="text-muted-foreground text-sm">Foto hinzufügen</p>
            </div>
          </div>
        )}
      </div>

      {/* Photo Thumbnails */}
      {recipe.photos && recipe.photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {recipe.photos.slice(0, 6).map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setSelectedPhotoIndex(index)}
              className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary/50 transition-colors"
            >
              <img
                src={photo.photo_url}
                alt={`Recipe photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {recipe.photos.length > 6 && (
            <button
              onClick={() => setSelectedPhotoIndex(6)}
              className="flex-shrink-0 w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground border-2 border-transparent hover:border-primary/50 transition-colors"
            >
              +{recipe.photos.length - 6}
            </button>
          )}
        </div>
      )}

      {/* Recipe Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {recipe.title}
            </h1>
            {recipe.summary && (
              <p className="text-muted-foreground leading-relaxed">
                {recipe.summary}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              disabled={toggleFavorite.isPending}
              className={recipe.is_favorite ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'}
            >
              <Heart size={20} fill={recipe.is_favorite ? 'currentColor' : 'none'} />
            </Button>

            <Button variant="ghost" size="sm">
              <Share2 size={20} />
            </Button>

            {canEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit size={20} />
              </Button>
            )}

            <Button variant="ghost" size="sm">
              <MoreVertical size={20} />
            </Button>
          </div>
        </div>

        {/* Recipe Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {recipe.total_minutes && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{formatCookingTime(recipe.total_minutes)}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{currentServings} {currentServings === 1 ? 'Portion' : 'Portionen'}</span>
          </div>

          {recipe.difficulty && (
            <div className="flex items-center gap-1">
              <ChefHat size={14} />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                {getDifficultyText(recipe.difficulty)}
              </span>
            </div>
          )}

          {recipe.cuisine && (
            <span className="px-2 py-1 bg-muted rounded-full text-xs">
              {recipe.cuisine}
            </span>
          )}
        </div>

        {/* Author Info */}
        {recipe.profile && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              {recipe.profile.avatar_url ? (
                <img 
                  src={recipe.profile.avatar_url}
                  alt={recipe.profile.display_name || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-primary font-medium text-sm">
                  {recipe.profile.display_name?.[0] || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {recipe.profile.display_name || 'Unbekannter Koch'}
              </p>
              <p className="text-xs text-muted-foreground">
                Erstellt am {new Date(recipe.created_at).toLocaleDateString('de-DE')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Portion Scaler Toggle */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowPortionScaler(!showPortionScaler)}
        >
          <Users size={16} className="mr-2" />
          Portionen anpassen
        </Button>
      </div>

      {/* Portion Scaler */}
      {showPortionScaler && (
        <PortionScaler
          originalServings={recipe.servings || 4}
          currentServings={currentServings}
          onServingsChange={setCurrentServings}
          ingredients={recipe.ingredients || []}
          onIngredientsChange={setScaledIngredients}
        />
      )}

      {/* Ingredients */}
      <div className="card-mirolo">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Zutaten
        </h2>

        <div className="space-y-2">
          {scaledIngredients.map((ingredient, index) => (
            <div key={ingredient.id || index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
              <span className="text-foreground">
                {ingredient.name}
              </span>
              <span className="text-muted-foreground font-medium">
                {ingredient.amount} {ingredient.unit}
              </span>
            </div>
          ))}
        </div>

        {(!scaledIngredients || scaledIngredients.length === 0) && (
          <p className="text-muted-foreground text-center py-4">
            Keine Zutaten verfügbar
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="card-mirolo">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Zubereitung
          </h2>
          {completedSteps.length > 0 && (
            <Button variant="ghost" size="sm" onClick={resetSteps}>
              Zurücksetzen
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {recipe.steps?.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            
            return (
              <div key={step.id} className="flex gap-4">
                <button
                  onClick={() => toggleStepComplete(step.id)}
                  className="flex-shrink-0 mt-1 text-primary hover:text-primary/80 transition-colors"
                >
                  {isCompleted ? (
                    <CheckCircle2 size={24} fill="currentColor" />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-primary">
                      Schritt {step.number}
                    </span>
                    {step.duration && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Timer size={12} />
                        <span>{step.duration} Min</span>
                      </div>
                    )}
                    {step.temperature && (
                      <span className="text-xs text-muted-foreground">
                        {step.temperature}°C
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-foreground leading-relaxed ${
                    isCompleted ? 'line-through opacity-60' : ''
                  }`}>
                    {step.instruction}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {(!recipe.steps || recipe.steps.length === 0) && (
          <p className="text-muted-foreground text-center py-4">
            Keine Zubereitungsschritte verfügbar
          </p>
        )}
      </div>

      {/* Tips */}
      {recipe.tips && recipe.tips.length > 0 && (
        <div className="card-mirolo">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Tipps & Hinweise
          </h2>

          <div className="space-y-3">
            {recipe.tips.map((tip, index) => (
              <div key={tip.id || index} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                <Lightbulb size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-foreground text-sm leading-relaxed">
                    {tip.content}
                  </p>
                  <span className="text-xs text-muted-foreground mt-1 capitalize">
                    {tip.type === 'preparation' && 'Vorbereitung'}
                    {tip.type === 'cooking' && 'Kochen'}
                    {tip.type === 'serving' && 'Servieren'}
                    {tip.type === 'storage' && 'Aufbewahrung'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition Info */}
      {recipe.nutrition && (
        <div className="card-mirolo">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Nährwerte (pro Portion)
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recipe.nutrition.calories && (
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-semibold text-primary">
                  {Math.round((recipe.nutrition.calories * currentServings) / (recipe.servings || 4))}
                </div>
                <div className="text-xs text-muted-foreground">kcal</div>
              </div>
            )}
            
            {recipe.nutrition.protein && (
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-semibold text-primary">
                  {Math.round((recipe.nutrition.protein * currentServings) / (recipe.servings || 4))}g
                </div>
                <div className="text-xs text-muted-foreground">Eiweiß</div>
              </div>
            )}

            {recipe.nutrition.carbs && (
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-semibold text-primary">
                  {Math.round((recipe.nutrition.carbs * currentServings) / (recipe.servings || 4))}g
                </div>
                <div className="text-xs text-muted-foreground">Kohlenhydrate</div>
              </div>
            )}

            {recipe.nutrition.fat && (
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-semibold text-primary">
                  {Math.round((recipe.nutrition.fat * currentServings) / (recipe.servings || 4))}g
                </div>
                <div className="text-xs text-muted-foreground">Fett</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {completedSteps.length > 0 && recipe.steps && recipe.steps.length > 0 && (
        <div className="card-mirolo">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Fortschritt
            </span>
            <span className="text-sm text-muted-foreground">
              {completedSteps.length} von {recipe.steps.length} Schritten
            </span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ 
                width: `${(completedSteps.length / recipe.steps.length) * 100}%` 
              }}
            />
          </div>

          {completedSteps.length === recipe.steps.length && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                🎉 Rezept erfolgreich abgeschlossen! Guten Appetit!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Photo Gallery Modal */}
      {selectedPhotoIndex !== null && recipe.photos && (
        <PhotoGallery
          photos={recipe.photos}
          initialIndex={selectedPhotoIndex}
          onClose={() => setSelectedPhotoIndex(null)}
        />
      )}
    </div>
  )
}