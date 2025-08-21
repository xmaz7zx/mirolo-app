'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, ArrowLeft, ArrowRight, Users, Clock, ChefHat, Zap } from 'lucide-react'
import { CUISINES } from '@/lib/constants'
import { useStreamingRecipeGeneration } from '@/hooks/useStreamingRecipeGeneration'
import type { Difficulty } from '@/types'
import type { GeneratedRecipe } from '@/lib/ai'

interface FastAIRecipeWizardProps {
  onRecipeGenerated: (recipe: GeneratedRecipe) => void
  onCancel: () => void
  className?: string
}

interface QuickWizardState {
  step: number
  idea: string
  servings: number
  maxTime: number
  difficulty: Difficulty
  cuisine: string
}

const TOTAL_STEPS = 2 // Reduziert von 3 auf 2 für Speed

export default function FastAIRecipeWizard({ onRecipeGenerated, onCancel, className }: FastAIRecipeWizardProps) {
  const [state, setState] = useState<QuickWizardState>({
    step: 1,
    idea: '',
    servings: 4,
    maxTime: 30, // Default auf 30min für schnellere Rezepte
    difficulty: 'easy', // Default auf easy
    cuisine: 'Deutsch'
  })

  const { isStreaming, progress, currentContent, recipe, error, generateRecipe, reset } = useStreamingRecipeGeneration()

  const popularIdeas = [
    'Pasta mit Gemüse',
    'Schnelles Curry',
    'Pfannengericht',
    'Salat mit Protein',
    'Wrap oder Bowl',
    'Suppe'
  ]

  const quickOptions = {
    servings: [2, 4, 6],
    time: [15, 30, 45],
    difficulty: [
      { value: 'easy' as Difficulty, label: 'Einfach', emoji: '😊' },
      { value: 'medium' as Difficulty, label: 'Mittel', emoji: '👨‍🍳' },
    ]
  }

  const updateState = (updates: Partial<QuickWizardState>) => {
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
      default: return false
    }
  }

  const handleGenerate = async () => {
    generateRecipe({
      idea: state.idea.trim(),
      servings: state.servings,
      maxTime: state.maxTime,
      difficulty: state.difficulty,
      cuisine: state.cuisine
    })
  }

  // Wenn fertig generiert, weiterleiten
  if (recipe) {
    onRecipeGenerated(recipe)
    return null
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap size={28} className="text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Schneller KI-Koch</h2>
        <p className="text-muted-foreground">Was soll gekocht werden?</p>
      </div>

      <div>
        <Input
          value={state.idea}
          onChange={(e) => updateState({ idea: e.target.value })}
          placeholder="z.B. Pasta mit Tomaten"
          className="text-lg h-14 text-center"
          autoFocus
        />
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-3 text-center">Beliebte Ideen:</p>
        <div className="grid grid-cols-2 gap-3">
          {popularIdeas.map((idea, index) => (
            <button
              key={index}
              onClick={() => updateState({ idea })}
              className="p-3 text-sm bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors text-center font-medium"
            >
              {idea}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Einstellungen</h2>
        <p className="text-muted-foreground">Schnell konfiguriert</p>
      </div>

      {/* Quick Servings */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          <Users size={16} className="inline mr-2" />
          Portionen
        </label>
        <div className="grid grid-cols-3 gap-3">
          {quickOptions.servings.map(size => (
            <button
              key={size}
              onClick={() => updateState({ servings: size })}
              className={`h-12 rounded-lg border-2 font-medium transition-colors ${
                state.servings === size
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Time */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          <Clock size={16} className="inline mr-2" />
          Zeit (Minuten)
        </label>
        <div className="grid grid-cols-3 gap-3">
          {quickOptions.time.map(time => (
            <button
              key={time}
              onClick={() => updateState({ maxTime: time })}
              className={`h-12 rounded-lg border-2 font-medium transition-colors ${
                state.maxTime === time
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {time}min
            </button>
          ))}
        </div>
      </div>

      {/* Quick Difficulty */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          <ChefHat size={16} className="inline mr-2" />
          Schwierigkeit
        </label>
        <div className="grid grid-cols-2 gap-3">
          {quickOptions.difficulty.map(diff => (
            <button
              key={diff.value}
              onClick={() => updateState({ difficulty: diff.value })}
              className={`h-12 rounded-lg border-2 font-medium transition-colors ${
                state.difficulty === diff.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="mr-2">{diff.emoji}</span>
              {diff.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderGenerating = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto">
        <Sparkles size={28} className="text-primary-foreground animate-pulse" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Rezept wird erstellt...</h2>
        <p className="text-muted-foreground">{state.idea}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-primary to-primary/70 h-3 rounded-full transition-all duration-300"
          style={{ width: `${Math.max(progress * 100, 10)}%` }}
        />
      </div>

      {/* Live Preview */}
      {currentContent && (
        <div className="bg-muted/50 rounded-lg p-4 text-left">
          <p className="text-sm text-muted-foreground mb-2">Vorschau:</p>
          <div className="bg-background rounded p-3 font-mono text-xs max-h-32 overflow-y-auto">
            {currentContent.slice(0, 200)}...
          </div>
        </div>
      )}

      <Button
        variant="ghost"
        onClick={() => {
          reset()
          updateState({ step: 1 })
        }}
        disabled={isStreaming}
        className="text-muted-foreground"
      >
        Abbrechen
      </Button>
    </div>
  )

  if (isStreaming || currentContent) {
    return (
      <div className={`max-w-md mx-auto ${className || ''}`}>
        <div className="min-h-[400px] flex items-center justify-center">
          {renderGenerating()}
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-md mx-auto ${className || ''}`}>
      {/* Simplified Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {state.step === 1 ? 'Was kochen?' : 'Einstellungen'}
          </span>
          <span className="text-sm text-muted-foreground">{state.step} / {TOTAL_STEPS}</span>
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
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-6">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="mt-2"
          >
            Erneut versuchen
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-6 border-t border-border">
        <Button 
          variant="outline" 
          onClick={state.step === 1 ? onCancel : prevStep}
          className="flex-1 h-12"
        >
          <ArrowLeft size={16} className="mr-2" />
          {state.step === 1 ? 'Abbrechen' : 'Zurück'}
        </Button>

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
            disabled={!canContinue()}
            className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Zap size={16} className="mr-2" />
            Schnell erstellen
          </Button>
        )}
      </div>
    </div>
  )
}