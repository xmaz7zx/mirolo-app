'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus, Users } from 'lucide-react'
import { scaleIngredients } from '@/lib/utils'
import type { Ingredient } from '@/types'

interface PortionScalerProps {
  originalServings: number
  currentServings: number
  onServingsChange: (servings: number) => void
  ingredients: Ingredient[]
  onIngredientsChange: (ingredients: Ingredient[]) => void
  className?: string
}

export default function PortionScaler({
  originalServings,
  currentServings,
  onServingsChange,
  ingredients,
  onIngredientsChange,
  className
}: PortionScalerProps) {
  const [customServings, setCustomServings] = useState(currentServings.toString())

  const handleServingsChange = (newServings: number) => {
    if (newServings < 1 || newServings > 50) return
    
    onServingsChange(newServings)
    setCustomServings(newServings.toString())
    
    // Scale ingredients
    const scaledIngredients = scaleIngredients(ingredients, originalServings, newServings)
    onIngredientsChange(scaledIngredients)
  }

  const handleCustomServingsSubmit = () => {
    const servings = parseInt(customServings)
    if (!isNaN(servings) && servings >= 1 && servings <= 50) {
      handleServingsChange(servings)
    } else {
      setCustomServings(currentServings.toString())
    }
  }

  const quickServings = [1, 2, 4, 6, 8, 12]

  return (
    <div className={`card-mirolo ${className || ''}`}>
      <div className="flex items-center gap-2 mb-4">
        <Users size={16} className="text-primary" />
        <h3 className="font-semibold text-foreground">Portionen anpassen</h3>
        {currentServings !== originalServings && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
            Skaliert
          </span>
        )}
      </div>

      {/* Current Servings Display */}
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-primary mb-1">
          {currentServings}
        </div>
        <div className="text-sm text-muted-foreground">
          {currentServings === 1 ? 'Portion' : 'Portionen'}
          {originalServings !== currentServings && (
            <span className="ml-2 text-xs">
              (ursprünglich {originalServings})
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Plus/Minus Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleServingsChange(Math.max(1, currentServings - 1))}
            disabled={currentServings <= 1}
            className="w-10 h-10 p-0"
          >
            <Minus size={16} />
          </Button>

          <Input
            value={customServings}
            onChange={(e) => setCustomServings(e.target.value)}
            onBlur={handleCustomServingsSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCustomServingsSubmit()
              }
            }}
            className="w-20 text-center"
            type="number"
            min="1"
            max="50"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleServingsChange(Math.min(50, currentServings + 1))}
            disabled={currentServings >= 50}
            className="w-10 h-10 p-0"
          >
            <Plus size={16} />
          </Button>
        </div>

        {/* Quick Select */}
        <div>
          <p className="text-xs text-muted-foreground text-center mb-3">Oder direkt wählen:</p>
          <div className="grid grid-cols-3 gap-2">
            {quickServings.map((servings) => (
              <Button
                key={servings}
                variant={currentServings === servings ? "default" : "outline"}
                size="sm"
                onClick={() => handleServingsChange(servings)}
                className="text-xs"
              >
                {servings}
              </Button>
            ))}
          </div>
        </div>

        {/* Reset to Original */}
        {currentServings !== originalServings && (
          <div className="pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleServingsChange(originalServings)}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              Auf ursprüngliche {originalServings} Portionen zurücksetzen
            </Button>
          </div>
        )}
      </div>

      {/* Scaling Info */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Tipp:</strong> Die Zutatenmengen werden automatisch angepasst. 
          Kochzeiten bleiben meist gleich, können aber bei größeren Mengen variieren.
        </p>
      </div>
    </div>
  )
}