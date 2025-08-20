import OpenAI from 'openai'
import { AI_CONFIG } from '@/lib/constants'
import { Ingredient, RecipeStep, RecipeTip, NutritionInfo, Difficulty } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface RecipeGenerationRequest {
  idea: string
  servings?: number
  maxTime?: number
  difficulty?: Difficulty
  cuisine?: string
  dietaryRestrictions?: string[]
  availableIngredients?: string[]
}

export interface GeneratedRecipe {
  title: string
  summary: string
  cuisine: string
  difficulty: Difficulty
  servings: number
  totalMinutes: number
  activeMinutes: number
  ingredients: Ingredient[]
  steps: RecipeStep[]
  tips: RecipeTip[]
  nutrition?: NutritionInfo
}

const RECIPE_GENERATION_PROMPT = `Du bist ein erfahrener Koch und Rezeptentwickler. Erstelle ein detailliertes, authentisches deutsches Rezept basierend auf der gegebenen Idee.

Wichtige Regeln:
- Verwende deutsche Begriffe und Maßeinheiten (g, kg, ml, l, TL, EL)
- Schreibe klare, verständliche Anweisungen
- Berücksichtige die angegebenen Parameter (Portionen, Zeit, Schwierigkeit)
- Gib realistische Zeiten und Nährwerte an
- Verwende authentische Zutaten und Techniken

Antworte NUR mit einem gültigen JSON-Objekt in diesem Format:

{
  "title": "Rezeptname",
  "summary": "Kurze Beschreibung des Gerichts (max. 200 Zeichen)",
  "cuisine": "Deutsche Küche/Italienisch/etc.",
  "difficulty": "easy|medium|hard",
  "servings": 4,
  "totalMinutes": 45,
  "activeMinutes": 30,
  "ingredients": [
    {
      "id": "1",
      "name": "Zutat",
      "amount": 500,
      "unit": "g",
      "category": "Gemüse"
    }
  ],
  "steps": [
    {
      "id": "1", 
      "number": 1,
      "instruction": "Detaillierte Anweisung...",
      "duration": 10,
      "temperature": 180
    }
  ],
  "tips": [
    {
      "id": "1",
      "content": "Hilfreicher Tipp...",
      "type": "preparation|cooking|serving|storage"
    }
  ],
  "nutrition": {
    "calories": 350,
    "protein": 25,
    "carbs": 35,
    "fat": 12,
    "fiber": 8,
    "sugar": 6,
    "sodium": 800
  }
}`

export const generateRecipe = async (request: RecipeGenerationRequest): Promise<GeneratedRecipe> => {
  try {
    const prompt = `${RECIPE_GENERATION_PROMPT}

Rezeptidee: "${request.idea}"
Parameter:
- Portionen: ${request.servings || 4}
- Maximale Zeit: ${request.maxTime || 60} Minuten
- Schwierigkeit: ${request.difficulty || 'medium'}
- Küche: ${request.cuisine || 'Deutsch'}
- Diätanforderungen: ${request.dietaryRestrictions?.join(', ') || 'Keine'}
- Verfügbare Zutaten: ${request.availableIngredients?.join(', ') || 'Flexibel'}

Erstelle ein passendes Rezept:`

    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: AI_CONFIG.MAX_TOKENS,
      temperature: AI_CONFIG.TEMPERATURE,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const recipe = JSON.parse(content) as GeneratedRecipe
    
    // Validate and add IDs if missing
    recipe.ingredients = recipe.ingredients.map((ingredient, index) => ({
      ...ingredient,
      id: ingredient.id || `ingredient-${index + 1}`,
    }))

    recipe.steps = recipe.steps.map((step, index) => ({
      ...step,
      id: step.id || `step-${index + 1}`,
      number: step.number || index + 1,
    }))

    recipe.tips = recipe.tips?.map((tip, index) => ({
      ...tip,
      id: tip.id || `tip-${index + 1}`,
    })) || []

    return recipe
  } catch (error) {
    console.error('Recipe generation failed:', error)
    
    if (error instanceof Error) {
      throw new Error(`Rezept-Generierung fehlgeschlagen: ${error.message}`)
    }
    
    throw new Error('Rezept-Generierung fehlgeschlagen. Bitte versuche es erneut.')
  }
}

export const improveRecipe = async (
  originalRecipe: Partial<GeneratedRecipe>,
  improvements: string
): Promise<GeneratedRecipe> => {
  try {
    const prompt = `Verbessere das folgende Rezept basierend auf den gegebenen Verbesserungsvorschlägen:

Ursprüngliches Rezept:
${JSON.stringify(originalRecipe, null, 2)}

Verbesserungsvorschläge:
"${improvements}"

Erstelle eine verbesserte Version des Rezepts. Behalte die grundlegende Struktur bei, aber passe Zutaten, Schritte und Details entsprechend den Vorschlägen an.

${RECIPE_GENERATION_PROMPT.split('\n').slice(-20).join('\n')}`

    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: AI_CONFIG.MAX_TOKENS,
      temperature: AI_CONFIG.TEMPERATURE,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    return JSON.parse(content) as GeneratedRecipe
  } catch (error) {
    console.error('Recipe improvement failed:', error)
    throw new Error('Rezept-Verbesserung fehlgeschlagen. Bitte versuche es erneut.')
  }
}

export const generateRecipeVariations = async (
  baseRecipe: Partial<GeneratedRecipe>,
  variationType: 'vegetarian' | 'vegan' | 'gluten-free' | 'quick' | 'healthy'
): Promise<GeneratedRecipe> => {
  const variationPrompts = {
    vegetarian: 'Erstelle eine vegetarische Variante dieses Rezepts',
    vegan: 'Erstelle eine vegane Variante dieses Rezepts',
    'gluten-free': 'Erstelle eine glutenfreie Variante dieses Rezepts',
    quick: 'Erstelle eine schnelle Variante dieses Rezepts (max. 30 Min)',
    healthy: 'Erstelle eine gesündere, kalorienreduzierte Variante'
  }

  try {
    const prompt = `${variationPrompts[variationType]}:

Basis-Rezept:
${JSON.stringify(baseRecipe, null, 2)}

${RECIPE_GENERATION_PROMPT.split('\n').slice(-20).join('\n')}`

    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: AI_CONFIG.MAX_TOKENS,
      temperature: AI_CONFIG.TEMPERATURE,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    return JSON.parse(content) as GeneratedRecipe
  } catch (error) {
    console.error('Recipe variation failed:', error)
    throw new Error('Rezept-Variante konnte nicht erstellt werden. Bitte versuche es erneut.')
  }
}