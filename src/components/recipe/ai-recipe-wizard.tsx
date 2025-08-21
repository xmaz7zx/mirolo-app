'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading'
import { Sparkles, ArrowLeft, ArrowRight, Users, Clock, ChefHat, Utensils, Check } from 'lucide-react'
import { CUISINES } from '@/lib/constants'
import type { Difficulty } from '@/types'
import type { GeneratedRecipe } from '@/lib/ai'

interface AIRecipeWizardProps {
  onRecipeGenerated: (recipe: GeneratedRecipe) => void
  onCancel: () => void
  className?: string
}

interface WizardState {
  step: number
  idea: string
  servings: number
  maxTime: number
  difficulty: Difficulty
  cuisine: string
  dietaryRestrictions: string[]
  availableIngredients: string
}

const TOTAL_STEPS = 3

export default function AIRecipeWizard({ onRecipeGenerated, onCancel, className }: AIRecipeWizardProps) {
  const [state, setState] = useState<WizardState>({
    step: 1,
    idea: '',
    servings: 4,
    maxTime: 60,
    difficulty: 'medium',
    cuisine: 'Deutsch',
    dietaryRestrictions: [],
    availableIngredients: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const exampleIdeas = [
    'Schnelle Pasta mit Gemüse',
    'Asiatisches Curry',
    'Gesunder Salat mit Protein',
    'Comfort Food für kalte Tage',
    'Dessert ohne Backen',
    'Low-Carb Abendessen'
  ]

  const dietaryOptions = [
    'Vegetarisch',
    'Vegan', 
    'Glutenfrei',
    'Laktosefrei',
    'Low Carb',
    'Keto',
    'Paleo'
  ]

  const difficultyOptions: { value: Difficulty; label: string; description: string }[] = [
    { value: 'easy', label: 'Einfach', description: 'Schnell und unkompliziert' },
    { value: 'medium', label: 'Mittel', description: 'Etwas mehr Aufwand' },
    { value: 'hard', label: 'Schwer', description: 'Für erfahrene Köche' },
  ]

  const updateState = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (state.step < TOTAL_STEPS) {
      updateState({ step: state.step + 1 })
    }
  }

  const prevStep = () => {
    if (state.step > 1) {
      updateState({ step: state.step - 1 })
    }
  }

  const canContinue = () => {
    switch (state.step) {
      case 1: return state.idea.trim().length >= 3
      case 2: return true
      case 3: return true
      default: return false
    }
  }

  const toggleDietaryRestriction = (restriction: string) => {
    const current = state.dietaryRestrictions
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction]
    updateState({ dietaryRestrictions: updated })
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea: state.idea.trim(),
          servings: state.servings,
          maxTime: state.maxTime,
          difficulty: state.difficulty,
          cuisine: state.cuisine,
          dietaryRestrictions: state.dietaryRestrictions,
          availableIngredients: state.availableIngredients.split(',').map(i => i.trim()).filter(Boolean),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler bei der Rezept-Generierung')
      }

      onRecipeGenerated(data.recipe)
    } catch (error: any) {
      setError(error.message || 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles size={28} className="text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Was soll gekocht werden?</h2>
        <p className="text-muted-foreground">Beschreibe deine Rezeptidee in wenigen Worten</p>
      </div>

      <div>
        <Input
          value={state.idea}
          onChange={(e) => updateState({ idea: e.target.value })}
          placeholder="z.B. Cremige Pilzpasta mit Kräutern"
          className="text-lg h-14 text-center"
          autoFocus
        />
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-3 text-center">Oder wähle eine Inspiration:</p>
        <div className="grid grid-cols-2 gap-3">
          {exampleIdeas.map((example, index) => (
            <button
              key={index}
              onClick={() => updateState({ idea: example })}
              className="p-3 text-sm bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors text-left"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Grundeinstellungen</h2>
        <p className="text-muted-foreground">Wie soll dein Rezept werden?</p>
      </div>

      {/* Servings and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <Users size={16} className="inline mr-2" />
            Portionen
          </label>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updateState({ servings: Math.max(1, state.servings - 1) })}
              className="h-12 w-12"
            >
              -
            </Button>
            <span className="text-xl font-semibold w-8 text-center">{state.servings}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updateState({ servings: Math.min(12, state.servings + 1) })}
              className="h-12 w-12"
            >
              +
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <Clock size={16} className="inline mr-2" />
            Max. Zeit (Min)
          </label>
          <select
            value={state.maxTime}
            onChange={(e) => updateState({ maxTime: parseInt(e.target.value) })}
            className="w-full h-12 px-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={15}>15 Min</option>
            <option value={30}>30 Min</option>
            <option value={45}>45 Min</option>
            <option value={60}>1 Stunde</option>
            <option value={90}>1,5 Stunden</option>
            <option value={120}>2 Stunden</option>
          </select>
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          <ChefHat size={16} className="inline mr-2" />
          Schwierigkeit
        </label>
        <div className="space-y-3">
          {difficultyOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateState({ difficulty: option.value })}
              className={`w-full p-4 text-left border-2 rounded-xl transition-colors ${
                state.difficulty === option.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-sm mt-1">{option.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Feineinstellungen</h2>
        <p className="text-muted-foreground">Optional - für ein perfekteres Ergebnis</p>
      </div>

      {/* Cuisine */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          <Utensils size={16} className="inline mr-2" />
          Küche
        </label>
        <select
          value={state.cuisine}
          onChange={(e) => updateState({ cuisine: e.target.value })}
          className="w-full h-12 px-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {CUISINES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Dietary Restrictions */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Ernährungsweise (optional)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {dietaryOptions.map((option) => (
            <button
              key={option}
              onClick={() => toggleDietaryRestriction(option)}
              className={`p-3 text-sm border-2 rounded-lg transition-colors ${
                state.dietaryRestrictions.includes(option)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Available Ingredients */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Verfügbare Zutaten (optional)
        </label>
        <Input
          value={state.availableIngredients}
          onChange={(e) => updateState({ availableIngredients: e.target.value })}
          placeholder="z.B. Nudeln, Tomaten, Basilikum"
          className="h-12"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Durch Komma getrennt - die KI wird versuchen, diese zu verwenden
        </p>
      </div>
    </div>
  )

  return (
    <div className={`max-w-md mx-auto ${className || ''}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Schritt {state.step} von {TOTAL_STEPS}</span>
          <span className="text-sm text-muted-foreground">{Math.round((state.step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(state.step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {state.step === 1 && renderStep1()}
        {state.step === 2 && renderStep2()}
        {state.step === 3 && renderStep3()}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-6">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-6 border-t border-border">
        {state.step > 1 ? (
          <Button variant="outline" onClick={prevStep} className="flex-1 h-12">
            <ArrowLeft size={16} className="mr-2" />
            Zurück
          </Button>
        ) : (
          <Button variant="outline" onClick={onCancel} className="flex-1 h-12">
            Abbrechen
          </Button>
        )}

        {state.step < TOTAL_STEPS ? (
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
            onClick={handleGenerate}
            disabled={loading || !canContinue()}
            className="flex-1 h-12"
          >
            {loading ? (
              <>
                <LoadingSpinner className="mr-2" />
                Erstelle...
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-2" />
                Rezept erstellen
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}