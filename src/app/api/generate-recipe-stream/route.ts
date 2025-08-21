import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createServerSupabaseClient } from '@/lib/auth'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Optimierter, kürzerer Prompt für bessere Performance
const STREAMING_RECIPE_PROMPT = `Du bist ein Rezeptexperte. Erstelle ein deutsches Rezept als JSON.

Format:
{
  "title": "Name",
  "summary": "Kurze Beschreibung",
  "difficulty": "easy|medium|hard",
  "servings": 4,
  "totalMinutes": 30,
  "ingredients": [{"id": "1", "name": "Zutat", "amount": 200, "unit": "g"}],
  "steps": [{"id": "1", "number": 1, "instruction": "Schritt...", "duration": 5}],
  "tips": [{"id": "1", "content": "Tipp", "type": "preparation"}]
}`

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { idea, servings = 4, maxTime = 60, difficulty = 'medium', cuisine = 'Deutsch' } = await request.json()

    if (!idea || idea.trim().length < 3) {
      return new Response('Invalid recipe idea', { status: 400 })
    }

    // Kurzer, fokussierter Prompt
    const prompt = `${STREAMING_RECIPE_PROMPT}

Rezept: "${idea}"
Portionen: ${servings}, Zeit: max ${maxTime}min, Level: ${difficulty}, Küche: ${cuisine}

JSON:`

    // Stream response für bessere UX
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Schnelleres Modell
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500, // Reduziert für Speed
      temperature: 0.7,
      response_format: { type: 'json_object' },
      stream: true,
    })

    // Transform stream to readable stream
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let buffer = ''

        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              buffer += content
              
              // Send progressive updates
              const data = JSON.stringify({
                type: 'chunk',
                content: buffer,
                progress: Math.min(buffer.length / 800, 1) // Rough progress estimate
              })
              
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Try to parse final JSON
          try {
            const recipe = JSON.parse(buffer)
            
            // Add missing IDs
            if (recipe.ingredients) {
              recipe.ingredients = recipe.ingredients.map((ing: any, i: number) => ({
                ...ing,
                id: ing.id || `ing-${i + 1}`,
                category: ing.category || 'main'
              }))
            }

            if (recipe.steps) {
              recipe.steps = recipe.steps.map((step: any, i: number) => ({
                ...step,
                id: step.id || `step-${i + 1}`,
                number: i + 1
              }))
            }

            recipe.tips = recipe.tips || []
            recipe.cuisine = cuisine

            // Send final recipe
            const finalData = JSON.stringify({
              type: 'complete',
              recipe: recipe
            })
            
            controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
          } catch (parseError) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              error: 'Fehler beim Parsen des Rezepts'
            })}\n\n`))
          }

          controller.close()
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: 'Fehler bei der Generierung'
          })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error: any) {
    console.error('Streaming generation error:', error)
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}