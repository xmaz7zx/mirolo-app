'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading'
import PhotoManager from '@/components/photo/photo-manager'
import { Plus, Minus, GripVertical, X, Clock, Users, ChefHat, Save } from 'lucide-react'
import { useRecipeStore } from '@/store/recipe-store'
import { useCreateRecipe, useUpdateRecipe } from '@/hooks/useRecipes'
import { CUISINES, UNITS, INGREDIENT_CATEGORIES } from '@/lib/constants'
import type { Difficulty } from '@/types'
import type { GeneratedRecipe } from '@/lib/ai'
import type { Recipe } from '@/types'

interface RecipeFormProps {
  initialRecipe?: GeneratedRecipe | Recipe
  onSave?: (recipe: Recipe) => void
  className?: string
}

export default function RecipeForm({ initialRecipe, onSave, className }: RecipeFormProps) {
  const {
    currentRecipe,
    setCurrentRecipe,
    updateCurrentRecipe,
    addIngredient,
    updateIngredient,
    removeIngredient,
    addStep,
    updateStep,
    removeStep,
    addTip,
    updateTip,
    removeTip,
  } = useRecipeStore()

  const createRecipe = useCreateRecipe()
  const updateRecipe = useUpdateRecipe()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Load initial recipe data
  useEffect(() => {
    if (initialRecipe) {
      setCurrentRecipe({
        title: initialRecipe.title || '',
        summary: initialRecipe.summary || '',
        cuisine: initialRecipe.cuisine || 'Deutsch',
        difficulty: initialRecipe.difficulty || 'medium',
        servings: initialRecipe.servings || 4,
        totalMinutes: 'totalMinutes' in initialRecipe ? initialRecipe.totalMinutes : initialRecipe.total_minutes || 30,
        activeMinutes: 'activeMinutes' in initialRecipe ? initialRecipe.activeMinutes : initialRecipe.active_minutes || 20,
        ingredients: initialRecipe.ingredients || [],
        steps: initialRecipe.steps || [],
        tips: initialRecipe.tips || [],
        tags: [],
      })
    }
  }, [initialRecipe, setCurrentRecipe])

  const difficultyOptions: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: 'Einfach' },
    { value: 'medium', label: 'Mittel' },
    { value: 'hard', label: 'Schwer' },
  ]

  const handleSave = async () => {
    if (!currentRecipe.title?.trim()) {
      setError('Rezepttitel ist erforderlich')
      return
    }

    if (!currentRecipe.ingredients || currentRecipe.ingredients.length === 0) {
      setError('Mindestens eine Zutat ist erforderlich')
      return
    }

    if (!currentRecipe.steps || currentRecipe.steps.length === 0) {
      setError('Mindestens ein Zubereitungsschritt ist erforderlich')
      return
    }

    setSaving(true)
    setError('')

    try {
      const recipeData = {
        title: currentRecipe.title.trim(),
        summary: currentRecipe.summary?.trim() || null,
        cuisine: currentRecipe.cuisine || null,
        difficulty: currentRecipe.difficulty || null,
        servings: currentRecipe.servings || null,
        total_minutes: currentRecipe.totalMinutes || null,
        active_minutes: currentRecipe.activeMinutes || null,
        ingredients: currentRecipe.ingredients || [],
        steps: currentRecipe.steps || [],
        tips: currentRecipe.tips || [],
        is_public: false,
      }

      let savedRecipe: Recipe

      if ('id' in initialRecipe!) {
        // Update existing recipe
        const result = await updateRecipe.mutateAsync({
          id: (initialRecipe as Recipe).id,
          updates: recipeData
        })
        savedRecipe = result
      } else {
        // Create new recipe
        const result = await createRecipe.mutateAsync(recipeData)
        savedRecipe = result
      }

      onSave?.(savedRecipe)
    } catch (error: any) {
      setError(error.message || 'Fehler beim Speichern des Rezepts')
    } finally {
      setSaving(false)
    }
  }

  const addNewIngredient = () => {
    addIngredient({
      name: '',
      amount: 1,
      unit: 'g',
      category: 'Sonstiges',
    })
  }

  const addNewStep = () => {
    addStep({
      instruction: '',
      duration: undefined,
      temperature: undefined,
    })
  }

  const addNewTip = () => {
    addTip({
      content: '',
      type: 'preparation',
    })
  }

  return (
    <div className={`space-y-8 ${className || ''}`}>
      {/* Basic Information */}
      <div className="card-mirolo">
        <h2 className="text-lg font-semibold text-foreground mb-4">Grundinformationen</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
              Rezepttitel *
            </label>
            <Input
              id="title"
              value={currentRecipe.title || ''}
              onChange={(e) => updateCurrentRecipe({ title: e.target.value })}
              placeholder="z.B. Cremige Pilzpasta"
              required
            />
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-foreground mb-1">
              Kurzbeschreibung
            </label>
            <Input
              id="summary"
              value={currentRecipe.summary || ''}
              onChange={(e) => updateCurrentRecipe({ summary: e.target.value })}
              placeholder="z.B. Ein cremiges und herzhaftes Pasta-Gericht"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cuisine" className="block text-sm font-medium text-foreground mb-1">
                Küche
              </label>
              <select
                id="cuisine"
                value={currentRecipe.cuisine || 'Deutsch'}
                onChange={(e) => updateCurrentRecipe({ cuisine: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CUISINES.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-foreground mb-1">
                Schwierigkeit
              </label>
              <select
                id="difficulty"
                value={currentRecipe.difficulty || 'medium'}
                onChange={(e) => updateCurrentRecipe({ difficulty: e.target.value as Difficulty })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {difficultyOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="servings" className="block text-sm font-medium text-foreground mb-1">
                <Users size={14} className="inline mr-1" />
                Portionen
              </label>
              <Input
                id="servings"
                type="number"
                min="1"
                max="20"
                value={currentRecipe.servings || 4}
                onChange={(e) => updateCurrentRecipe({ servings: parseInt(e.target.value) || 4 })}
              />
            </div>

            <div>
              <label htmlFor="totalTime" className="block text-sm font-medium text-foreground mb-1">
                <Clock size={14} className="inline mr-1" />
                Gesamtzeit (Min)
              </label>
              <Input
                id="totalTime"
                type="number"
                min="5"
                max="300"
                value={currentRecipe.totalMinutes || 30}
                onChange={(e) => updateCurrentRecipe({ totalMinutes: parseInt(e.target.value) || 30 })}
              />
            </div>

            <div>
              <label htmlFor="activeTime" className="block text-sm font-medium text-foreground mb-1">
                <ChefHat size={14} className="inline mr-1" />
                Arbeitszeit (Min)
              </label>
              <Input
                id="activeTime"
                type="number"
                min="5"
                max="180"
                value={currentRecipe.activeMinutes || 20}
                onChange={(e) => updateCurrentRecipe({ activeMinutes: parseInt(e.target.value) || 20 })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="card-mirolo">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Zutaten</h2>
          <Button onClick={addNewIngredient} size="sm">
            <Plus size={16} className="mr-1" />
            Zutat
          </Button>
        </div>

        <div className="space-y-3">
          {currentRecipe.ingredients?.map((ingredient, index) => (
            <div key={ingredient.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <GripVertical size={16} className="text-muted-foreground cursor-move" />
              
              <div className="grid grid-cols-12 gap-2 flex-1">
                <Input
                  className="col-span-2"
                  type="number"
                  min="0"
                  step="0.1"
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(ingredient.id, { 
                    amount: parseFloat(e.target.value) || 0 
                  })}
                  placeholder="Menge"
                />
                
                <select
                  className="col-span-2 px-2 py-1 border border-input rounded-md bg-background text-sm"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(ingredient.id, { unit: e.target.value })}
                >
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                
                <Input
                  className="col-span-6"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(ingredient.id, { name: e.target.value })}
                  placeholder="Zutat"
                />
                
                <select
                  className="col-span-2 px-2 py-1 border border-input rounded-md bg-background text-sm"
                  value={ingredient.category || 'Sonstiges'}
                  onChange={(e) => updateIngredient(ingredient.id, { category: e.target.value })}
                >
                  {INGREDIENT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeIngredient(ingredient.id)}
                className="p-2 text-destructive hover:text-destructive"
              >
                <X size={16} />
              </Button>
            </div>
          ))}

          {(!currentRecipe.ingredients || currentRecipe.ingredients.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Noch keine Zutaten hinzugefügt</p>
              <Button onClick={addNewIngredient} variant="outline" className="mt-2">
                <Plus size={16} className="mr-2" />
                Erste Zutat hinzufügen
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="card-mirolo">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Zubereitung</h2>
          <Button onClick={addNewStep} size="sm">
            <Plus size={16} className="mr-1" />
            Schritt
          </Button>
        </div>

        <div className="space-y-4">
          {currentRecipe.steps?.map((step, index) => (
            <div key={step.id} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                {step.number}
              </div>
              
              <div className="flex-1 space-y-3">
                <textarea
                  value={step.instruction}
                  onChange={(e) => updateStep(step.id, { instruction: e.target.value })}
                  placeholder="Beschreibe diesen Zubereitungsschritt..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={3}
                />
                
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      value={step.duration || ''}
                      onChange={(e) => updateStep(step.id, { 
                        duration: parseInt(e.target.value) || undefined 
                      })}
                      placeholder="Dauer (Min)"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      max="300"
                      value={step.temperature || ''}
                      onChange={(e) => updateStep(step.id, { 
                        temperature: parseInt(e.target.value) || undefined 
                      })}
                      placeholder="Temperatur (°C)"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(step.id)}
                    className="p-2 text-destructive hover:text-destructive"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {(!currentRecipe.steps || currentRecipe.steps.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Noch keine Zubereitungsschritte hinzugefügt</p>
              <Button onClick={addNewStep} variant="outline" className="mt-2">
                <Plus size={16} className="mr-2" />
                Ersten Schritt hinzufügen
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="card-mirolo">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Tipps (optional)</h2>
          <Button onClick={addNewTip} size="sm" variant="outline">
            <Plus size={16} className="mr-1" />
            Tipp
          </Button>
        </div>

        <div className="space-y-3">
          {currentRecipe.tips?.map((tip) => (
            <div key={tip.id} className="flex gap-3 p-3 border border-border rounded-lg">
              <div className="flex-1 space-y-2">
                <textarea
                  value={tip.content}
                  onChange={(e) => updateTip(tip.id, { content: e.target.value })}
                  placeholder="Teile einen hilfreichen Tipp..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={2}
                />
                
                <select
                  value={tip.type}
                  onChange={(e) => updateTip(tip.id, { type: e.target.value as any })}
                  className="px-2 py-1 border border-input rounded-md bg-background text-sm"
                >
                  <option value="preparation">Vorbereitung</option>
                  <option value="cooking">Kochen</option>
                  <option value="serving">Servieren</option>
                  <option value="storage">Aufbewahrung</option>
                </select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTip(tip.id)}
                className="p-2 text-destructive hover:text-destructive"
              >
                <X size={16} />
              </Button>
            </div>
          ))}

          {(!currentRecipe.tips || currentRecipe.tips.length === 0) && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              <p>Keine Tipps hinzugefügt</p>
            </div>
          )}
        </div>
      </div>

      {/* Photos */}
      {'id' in (initialRecipe || {}) && (
        <PhotoManager
          recipeId={(initialRecipe as Recipe).id}
          canEdit={true}
        />
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving || !currentRecipe.title?.trim()}
          className="flex-1 h-12"
        >
          {saving ? (
            <>
              <LoadingSpinner className="mr-2" />
              Speichere...
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Rezept speichern
            </>
          )}
        </Button>
      </div>
    </div>
  )
}