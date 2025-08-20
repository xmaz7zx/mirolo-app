'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading'
import { Sparkles, Clock, Users, ChefHat, Utensils } from 'lucide-react'
import { CUISINES } from '@/lib/constants'
import type { Difficulty } from '@/types'
import type { GeneratedRecipe } from '@/lib/ai'

interface AIRecipeGeneratorProps {
  onRecipeGenerated: (recipe: GeneratedRecipe) => void
  className?: string
}

export default function AIRecipeGenerator({ onRecipeGenerated, className }: AIRecipeGeneratorProps) {
  const [idea, setIdea] = useState('')
  const [servings, setServings] = useState(4)
  const [maxTime, setMaxTime] = useState(60)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [cuisine, setCuisine] = useState('Deutsch')
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
  const [availableIngredients, setAvailableIngredients] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const toggleDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions(prev => 
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    )
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea: idea.trim(),
          servings,
          maxTime,
          difficulty,
          cuisine,
          dietaryRestrictions,
          availableIngredients: availableIngredients.split(',').map(i => i.trim()).filter(Boolean),
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

  const exampleIdeas = [
    'Schnelle Pasta mit Gemüse',
    'Asiatisches Curry',
    'Gesunder Salat mit Protein',
    'Comfort Food für kalte Tage',
    'Dessert ohne Backen',
    'Low-Carb Abendessen'
  ]

  return (
    <div className={`card-mirolo ${className || ''}`}>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
          <Sparkles size={16} className="text-primary-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">KI-Rezept Generator</h2>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Recipe Idea */}
        <div>
          <label htmlFor="idea" className="block text-sm font-medium text-foreground mb-2">
            Deine Rezeptidee *
          </label>
          <Input
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="z.B. Cremige Pilzpasta mit Kräutern"
            required
            minLength={3}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {exampleIdeas.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setIdea(example)}
                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Servings */}
          <div>
            <label htmlFor="servings" className="block text-sm font-medium text-foreground mb-2">
              <Users size={14} className="inline mr-1" />
              Portionen
            </label>
            <Input
              id="servings"
              type="number"
              min="1"
              max="12"
              value={servings}
              onChange={(e) => setServings(parseInt(e.target.value) || 4)}
            />
          </div>

          {/* Max Time */}
          <div>
            <label htmlFor="maxTime" className="block text-sm font-medium text-foreground mb-2">
              <Clock size={14} className="inline mr-1" />
              Max. Zeit (Min)
            </label>
            <Input
              id="maxTime"
              type="number"
              min="10"
              max="180"
              step="5"
              value={maxTime}
              onChange={(e) => setMaxTime(parseInt(e.target.value) || 60)}
            />
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <ChefHat size={14} className="inline mr-1" />
            Schwierigkeit
          </label>
          <div className="grid grid-cols-3 gap-2">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDifficulty(option.value)}
                className={`p-3 text-center border rounded-lg transition-colors ${
                  difficulty === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cuisine */}
        <div>
          <label htmlFor="cuisine" className="block text-sm font-medium text-foreground mb-2">
            <Utensils size={14} className="inline mr-1" />
            Küche
          </label>
          <select
            id="cuisine"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {CUISINES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Ernährungsweise (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleDietaryRestriction(option)}
                className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                  dietaryRestrictions.includes(option)
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
          <label htmlFor="ingredients" className="block text-sm font-medium text-foreground mb-2">
            Verfügbare Zutaten (optional)
          </label>
          <Input
            id="ingredients"
            value={availableIngredients}
            onChange={(e) => setAvailableIngredients(e.target.value)}
            placeholder="z.B. Nudeln, Tomaten, Basilikum (durch Komma getrennt)"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Die KI wird versuchen, diese Zutaten zu verwenden
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <Button
          type="submit"
          disabled={loading || idea.trim().length < 3}
          className="w-full h-12 text-base"
        >
          {loading ? (
            <>
              <LoadingSpinner className="mr-2" />
              Rezept wird erstellt...
            </>
          ) : (
            <>
              <Sparkles size={18} className="mr-2" />
              Rezept mit KI erstellen
            </>
          )}
        </Button>
      </form>

      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <Sparkles size={12} className="inline mr-1" />
          Unsere KI erstellt personalisierte Rezepte basierend auf deinen Angaben. 
          Du kannst das Ergebnis anschließend bearbeiten und speichern.
        </p>
      </div>
    </div>
  )
}