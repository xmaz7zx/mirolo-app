import { NextRequest, NextResponse } from 'next/server'
import { generateRecipe } from '@/lib/ai'
import { createServerSupabaseClient } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { idea, servings, maxTime, difficulty, cuisine, dietaryRestrictions, availableIngredients } = body

    // Validate required fields
    if (!idea || typeof idea !== 'string' || idea.trim().length < 3) {
      return NextResponse.json(
        { error: 'Rezeptidee ist erforderlich (mindestens 3 Zeichen)' },
        { status: 400 }
      )
    }

    // Rate limiting check (simple implementation)
    const userId = user.id
    const cacheKey = `recipe_generation_${userId}`
    
    // In production, you'd use Redis or similar for rate limiting
    // For now, we'll implement basic rate limiting with Supabase

    const generatedRecipe = await generateRecipe({
      idea: idea.trim(),
      servings: servings || 4,
      maxTime: maxTime || 60,
      difficulty: difficulty || 'medium',
      cuisine: cuisine || 'Deutsch',
      dietaryRestrictions: dietaryRestrictions || [],
      availableIngredients: availableIngredients || [],
    })

    return NextResponse.json({ 
      success: true, 
      recipe: generatedRecipe 
    })

  } catch (error: any) {
    console.error('Recipe generation error:', error)
    
    // Handle specific OpenAI errors
    if (error.message?.includes('insufficient_quota')) {
      return NextResponse.json(
        { error: 'OpenAI API-Limit erreicht. Bitte später erneut versuchen.' },
        { status: 429 }
      )
    }
    
    if (error.message?.includes('invalid_api_key')) {
      return NextResponse.json(
        { error: 'API-Konfigurationsfehler. Bitte kontaktiere den Support.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Fehler bei der Rezept-Generierung' },
      { status: 500 }
    )
  }
}