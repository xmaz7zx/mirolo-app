'use client'

import { useState, useCallback } from 'react'
import type { GeneratedRecipe } from '@/lib/ai'

interface StreamingState {
  isStreaming: boolean
  progress: number
  currentContent: string
  recipe: GeneratedRecipe | null
  error: string | null
}

interface StreamingHookResult extends StreamingState {
  generateRecipe: (params: {
    idea: string
    servings?: number
    maxTime?: number
    difficulty?: string
    cuisine?: string
  }) => void
  reset: () => void
}

export function useStreamingRecipeGeneration(): StreamingHookResult {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    progress: 0,
    currentContent: '',
    recipe: null,
    error: null
  })

  const reset = useCallback(() => {
    setState({
      isStreaming: false,
      progress: 0,
      currentContent: '',
      recipe: null,
      error: null
    })
  }, [])

  const generateRecipe = useCallback(async (params: {
    idea: string
    servings?: number
    maxTime?: number
    difficulty?: string
    cuisine?: string
  }) => {
    reset()
    
    setState(prev => ({ ...prev, isStreaming: true }))

    try {
      const response = await fetch('/api/generate-recipe-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error('Network error')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No reader available')
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'chunk') {
                setState(prev => ({
                  ...prev,
                  progress: data.progress || 0,
                  currentContent: data.content || ''
                }))
              } else if (data.type === 'complete') {
                setState(prev => ({
                  ...prev,
                  isStreaming: false,
                  progress: 1,
                  recipe: data.recipe
                }))
              } else if (data.type === 'error') {
                setState(prev => ({
                  ...prev,
                  isStreaming: false,
                  error: data.error
                }))
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError)
            }
          }
        }
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: error.message || 'Fehler bei der Rezept-Generierung'
      }))
    }
  }, [reset])

  return {
    ...state,
    generateRecipe,
    reset
  }
}