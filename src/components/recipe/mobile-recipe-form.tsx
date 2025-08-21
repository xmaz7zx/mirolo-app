'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading'
import { Plus, ArrowLeft, ArrowRight, Save, Users, Clock, ChefHat, Utensils, FileText, Lightbulb, Camera } from 'lucide-react'
import { useCreateRecipe, useUpdateRecipe } from '@/hooks/useRecipes'
import { CUISINES } from '@/lib/constants'
import type { Difficulty, Ingredient, RecipeStep, RecipeTip } from '@/types'
import type { GeneratedRecipe } from '@/lib/ai'
import type { Recipe } from '@/types'

interface MobileRecipeFormProps {
  initialRecipe?: GeneratedRecipe | Recipe
  onSave?: (recipe: Recipe) => void
  onCancel?: () => void
  className?: string
}

interface FormData {
  // Basic Info
  title: string
  summary: string
  servings: number
  totalMinutes: number
  difficulty: Difficulty
  cuisine: string
  
  // Content
  ingredients: Ingredient[]
  steps: RecipeStep[]
  tips: RecipeTip[]
}

const TOTAL_STEPS = 4
const STEP_NAMES = ['Grunddaten', 'Zutaten', 'Zubereitung', 'Fertig']

export default function MobileRecipeForm({ initialRecipe, onSave, onCancel, className }: MobileRecipeFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    summary: '',
    servings: 4,
    totalMinutes: 30,
    difficulty: 'medium',
    cuisine: 'Deutsch',
    ingredients: [{ id: '1', name: '', amount: 0, unit: 'g', category: 'main' }],
    steps: [{ id: '1', number: 1, instruction: '', duration: 0 }],
    tips: []
  })

  const createRecipe = useCreateRecipe()
  const updateRecipe = useUpdateRecipe()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Load initial data
  useEffect(() => {
    if (initialRecipe) {
      setFormData({
        title: initialRecipe.title || '',
        summary: initialRecipe.summary || '',
        servings: initialRecipe.servings || 4,
        totalMinutes: initialRecipe.total_minutes || 30,
        difficulty: initialRecipe.difficulty || 'medium',
        cuisine: initialRecipe.cuisine || 'Deutsch',
        ingredients: Array.isArray(initialRecipe.ingredients) 
          ? initialRecipe.ingredients 
          : [{ id: '1', name: '', amount: 0, unit: 'g', category: 'main' }],
        steps: Array.isArray(initialRecipe.steps) 
          ? initialRecipe.steps 
          : [{ id: '1', number: 1, instruction: '', duration: 0 }],
        tips: Array.isArray(initialRecipe.tips) ? initialRecipe.tips : []
      })
    }
  }, [initialRecipe])

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: '',
      amount: 0,
      unit: 'g',
      category: 'main'
    }
    updateFormData({ ingredients: [...formData.ingredients, newIngredient] })
  }

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    const updated = formData.ingredients.map(ing => 
      ing.id === id ? { ...ing, ...updates } : ing
    )
    updateFormData({ ingredients: updated })
  }

  const removeIngredient = (id: string) => {
    if (formData.ingredients.length > 1) {
      updateFormData({ ingredients: formData.ingredients.filter(ing => ing.id !== id) })
    }
  }

  const addStep = () => {
    const newStep: RecipeStep = {
      id: Date.now().toString(),
      number: formData.steps.length + 1,
      instruction: '',
      duration: 0
    }
    updateFormData({ steps: [...formData.steps, newStep] })
  }

  const updateStep = (id: string, updates: Partial<RecipeStep>) => {
    const updated = formData.steps.map(step => 
      step.id === id ? { ...step, ...updates } : step
    )
    updateFormData({ steps: updated })
  }

  const removeStep = (id: string) => {
    if (formData.steps.length > 1) {
      const filtered = formData.steps.filter(step => step.id !== id)
      const renumbered = filtered.map((step, index) => ({ ...step, number: index + 1 }))
      updateFormData({ steps: renumbered })
    }
  }

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim().length >= 3
      case 2:
        return formData.ingredients.some(ing => ing.name.trim().length > 0)
      case 3:
        return formData.steps.some(step => step.instruction.trim().length > 0)
      case 4:
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const recipeData = {
        title: formData.title,
        summary: formData.summary,
        servings: formData.servings,
        total_minutes: formData.totalMinutes,
        difficulty: formData.difficulty,
        cuisine: formData.cuisine,
        ingredients: formData.ingredients,
        steps: formData.steps,
        tips: formData.tips,
        is_public: false
      }

      let savedRecipe: Recipe
      if (initialRecipe && 'id' in initialRecipe) {
        savedRecipe = await updateRecipe.mutateAsync({
          id: initialRecipe.id,
          updates: recipeData
        })
      } else {
        savedRecipe = await createRecipe.mutateAsync(recipeData)
      }

      onSave?.(savedRecipe)
    } catch (error: any) {
      setError(error.message || 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={28} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Grunddaten</h2>
        <p className="text-muted-foreground">Die wichtigsten Informationen zu deinem Rezept</p>
      </div>

      <div className="space-y-4">
        <div>
          <Input
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder="Rezept-Titel"
            className="text-lg h-14 text-center"
            autoFocus
          />
        </div>

        <div>
          <textarea
            value={formData.summary}
            onChange={(e) => updateFormData({ summary: e.target.value })}
            placeholder="Kurze Beschreibung (optional)"
            className="w-full h-20 p-3 border border-input rounded-md bg-background text-foreground resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Users size={16} className="inline mr-2" />
              Portionen
            </label>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateFormData({ servings: Math.max(1, formData.servings - 1) })}
                className="h-12 w-12"
              >
                -
              </Button>
              <span className="text-xl font-semibold w-8 text-center">{formData.servings}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateFormData({ servings: Math.min(12, formData.servings + 1) })}
                className="h-12 w-12"
              >
                +
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Clock size={16} className="inline mr-2" />
              Zeit (Min)
            </label>
            <Input
              type="number"
              value={formData.totalMinutes}
              onChange={(e) => updateFormData({ totalMinutes: parseInt(e.target.value) || 0 })}
              className="h-12 text-center"
              min="1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <ChefHat size={16} className="inline mr-2" />
              Schwierigkeit
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => updateFormData({ difficulty: e.target.value as Difficulty })}
              className="w-full h-12 px-3 border border-input rounded-md bg-background text-foreground"
            >
              <option value="easy">Einfach</option>
              <option value="medium">Mittel</option>
              <option value="hard">Schwer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Utensils size={16} className="inline mr-2" />
              Küche
            </label>
            <select
              value={formData.cuisine}
              onChange={(e) => updateFormData({ cuisine: e.target.value })}
              className="w-full h-12 px-3 border border-input rounded-md bg-background text-foreground"
            >
              {CUISINES.slice(0, 8).map((cuisine) => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus size={28} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Zutaten</h2>
        <p className="text-muted-foreground">Was wird für dein Rezept benötigt?</p>
      </div>

      <div className="space-y-4">
        {formData.ingredients.map((ingredient, index) => (
          <div key={ingredient.id} className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <Input
                value={ingredient.name}
                onChange={(e) => updateIngredient(ingredient.id, { name: e.target.value })}
                placeholder="Zutat eingeben"
                className="h-12"
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(ingredient.id, { amount: parseFloat(e.target.value) || 0 })}
                  placeholder="Menge"
                  className="w-20"
                  min="0"
                  step="0.1"
                />
                <select
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(ingredient.id, { unit: e.target.value })}
                  className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                  <option value="Stück">Stück</option>
                  <option value="EL">EL</option>
                  <option value="TL">TL</option>
                  <option value="Prise">Prise</option>
                </select>
              </div>
            </div>
            {formData.ingredients.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeIngredient(ingredient.id)}
                className="text-destructive mt-1"
              >
                ×
              </Button>
            )}
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addIngredient}
          className="w-full h-12"
        >
          <Plus size={16} className="mr-2" />
          Zutat hinzufügen
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <ChefHat size={28} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Zubereitung</h2>
        <p className="text-muted-foreground">Schritt-für-Schritt Anleitung</p>
      </div>

      <div className="space-y-4">
        {formData.steps.map((step, index) => (
          <div key={step.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                {step.number}
              </div>
              <span className="font-medium">Schritt {step.number}</span>
              {formData.steps.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStep(step.id)}
                  className="text-destructive ml-auto"
                >
                  ×
                </Button>
              )}
            </div>
            <textarea
              value={step.instruction}
              onChange={(e) => updateStep(step.id, { instruction: e.target.value })}
              placeholder="Beschreibe diesen Zubereitungsschritt..."
              className="w-full h-24 p-3 border border-input rounded-md bg-background text-foreground resize-none"
            />
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addStep}
          className="w-full h-12"
        >
          <Plus size={16} className="mr-2" />
          Schritt hinzufügen
        </Button>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Save size={28} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Fast geschafft!</h2>
        <p className="text-muted-foreground">Überprüfe dein Rezept und speichere es</p>
      </div>

      <div className="card-mirolo">
        <h3 className="font-semibold text-lg mb-2">{formData.title || 'Unbenanntes Rezept'}</h3>
        <p className="text-muted-foreground mb-4">{formData.summary || 'Keine Beschreibung'}</p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span><Users size={14} className="inline mr-1" />{formData.servings}</span>
          <span><Clock size={14} className="inline mr-1" />{formData.totalMinutes} Min</span>
          <span><ChefHat size={14} className="inline mr-1" />{formData.difficulty}</span>
        </div>

        <div className="space-y-3">
          <div>
            <span className="font-medium">Zutaten: </span>
            <span className="text-muted-foreground">{formData.ingredients.filter(i => i.name.trim()).length}</span>
          </div>
          <div>
            <span className="font-medium">Schritte: </span>
            <span className="text-muted-foreground">{formData.steps.filter(s => s.instruction.trim()).length}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium text-foreground mb-2 flex items-center">
          <Lightbulb size={16} className="mr-2" />
          Nach dem Speichern kannst du:
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Fotos zu deinem Rezept hinzufügen</li>
          <li>• Weitere Details bearbeiten</li>
          <li>• Das Rezept mit anderen teilen</li>
        </ul>
      </div>
    </div>
  )

  return (
    <div className={`max-w-md mx-auto ${className || ''}`}>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{STEP_NAMES[currentStep - 1]}</span>
          <span className="text-sm text-muted-foreground">{currentStep} / {TOTAL_STEPS}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-6">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-6 border-t border-border">
        <Button 
          variant="outline" 
          onClick={currentStep === 1 ? onCancel : prevStep}
          className="flex-1 h-12"
        >
          <ArrowLeft size={16} className="mr-2" />
          {currentStep === 1 ? 'Abbrechen' : 'Zurück'}
        </Button>

        {currentStep < TOTAL_STEPS ? (
          <Button 
            onClick={nextStep} 
            disabled={!canContinue()}
            className="flex-1 h-12"
          >
            Weiter
            <ArrowRight size={16} className="ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleSave}
            disabled={saving || !canContinue()}
            className="flex-1 h-12"
          >
            {saving ? (
              <>
                <LoadingSpinner className="mr-2" />
                Speichere...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Rezept speichern
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}