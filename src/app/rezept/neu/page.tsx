'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import AIRecipeWizard from '@/components/recipe/ai-recipe-wizard'
import RecipeForm from '@/components/recipe/recipe-form'
import { Button } from '@/components/ui/button'
import { Sparkles, Edit3, ArrowLeft } from 'lucide-react'
import type { GeneratedRecipe } from '@/lib/ai'
import type { Recipe } from '@/types'

type Mode = 'choose' | 'ai' | 'manual' | 'edit'

export default function NewRecipePage() {
  const [mode, setMode] = useState<Mode>('choose')
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if AI mode is requested via URL param
  useEffect(() => {
    if (searchParams.get('ai') === 'true') {
      setMode('ai')
    }
  }, [searchParams])

  const handleRecipeGenerated = (recipe: GeneratedRecipe) => {
    setGeneratedRecipe(recipe)
    setMode('edit')
  }

  const handleRecipeSaved = (recipe: Recipe) => {
    router.push(`/rezept/${recipe.id}`)
  }

  const handleBack = () => {
    if (mode === 'edit' && generatedRecipe) {
      setMode('ai')
    } else if (mode === 'ai' || mode === 'manual') {
      setMode('choose')
    } else {
      router.push('/dashboard')
    }
  }

  const getHeaderTitle = () => {
    switch (mode) {
      case 'choose': return 'Neues Rezept'
      case 'ai': return 'KI-Rezept erstellen'
      case 'manual': return 'Manuell erstellen'
      case 'edit': return 'Rezept bearbeiten'
      default: return 'Neues Rezept'
    }
  }

  return (
    <MainLayout
      headerProps={{
        title: getHeaderTitle(),
        showBack: mode !== 'choose',
        action: mode !== 'choose' ? (
          <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
            <ArrowLeft size={20} />
          </Button>
        ) : undefined
      }}
    >
      {mode === 'choose' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Wie möchtest du dein Rezept erstellen?
            </h1>
            <p className="text-muted-foreground">
              Wähle die für dich passende Methode
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <button
              onClick={() => setMode('ai')}
              className="w-full p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl text-left hover:from-primary/20 hover:to-primary/10 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles size={24} className="text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Mit KI erstellen
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Beschreibe deine Idee und lass unsere KI ein vollständiges Rezept erstellen. 
                    Du kannst es anschließend bearbeiten und anpassen.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <span className="bg-primary/20 px-2 py-1 rounded-full">Empfohlen</span>
                    <span className="bg-primary/20 px-2 py-1 rounded-full">Schnell</span>
                    <span className="bg-primary/20 px-2 py-1 rounded-full">Personalisiert</span>
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode('manual')}
              className="w-full p-6 bg-card border border-border rounded-xl text-left hover:bg-accent transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Edit3 size={24} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Manuell erstellen
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Erstelle dein Rezept von Grund auf selbst. Perfect für eigene Kreationen 
                    oder wenn du bereits ein fertiges Rezept hast.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="bg-muted px-2 py-1 rounded-full">Vollständige Kontrolle</span>
                    <span className="bg-muted px-2 py-1 rounded-full">Eigene Rezepte</span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">💡 Tipp</h4>
            <p className="text-sm text-muted-foreground">
              Egal welche Methode du wählst - du kannst dein Rezept jederzeit bearbeiten, 
              Fotos hinzufügen und mit anderen teilen. Alle Rezepte werden automatisch gespeichert.
            </p>
          </div>
        </div>
      )}

      {mode === 'ai' && (
        <AIRecipeWizard 
          onRecipeGenerated={handleRecipeGenerated} 
          onCancel={() => setMode('choose')}
        />
      )}

      {mode === 'manual' && (
        <RecipeForm onSave={handleRecipeSaved} />
      )}

      {mode === 'edit' && generatedRecipe && (
        <div className="space-y-6">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">KI-generiert</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Dein Rezept wurde erfolgreich erstellt! Du kannst es jetzt bearbeiten und anpassen, 
              bevor du es speicherst.
            </p>
          </div>

          <RecipeForm 
            initialRecipe={generatedRecipe}
            onSave={handleRecipeSaved}
          />
        </div>
      )}
    </MainLayout>
  )
}