'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Ingredient, RecipeStep, RecipeTip, Difficulty } from '@/types'

export interface RecipeFormData {
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
  tags: string[]
}

interface RecipeStore {
  // Current recipe being created/edited
  currentRecipe: Partial<RecipeFormData>
  
  // Draft management
  draftRecipes: Record<string, Partial<RecipeFormData>>
  
  // Actions
  setCurrentRecipe: (recipe: Partial<RecipeFormData>) => void
  updateCurrentRecipe: (updates: Partial<RecipeFormData>) => void
  clearCurrentRecipe: () => void
  
  // Ingredient management
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void
  removeIngredient: (id: string) => void
  reorderIngredients: (startIndex: number, endIndex: number) => void
  
  // Step management
  addStep: (step: Omit<RecipeStep, 'id' | 'number'>) => void
  updateStep: (id: string, updates: Partial<RecipeStep>) => void
  removeStep: (id: string) => void
  reorderSteps: (startIndex: number, endIndex: number) => void
  
  // Tip management
  addTip: (tip: Omit<RecipeTip, 'id'>) => void
  updateTip: (id: string, updates: Partial<RecipeTip>) => void
  removeTip: (id: string) => void
  
  // Draft management
  saveDraft: (id: string) => void
  loadDraft: (id: string) => void
  deleteDraft: (id: string) => void
  getDraftsList: () => Array<{ id: string; title: string; updatedAt: string }>
}

const initialRecipeState: Partial<RecipeFormData> = {
  title: '',
  summary: '',
  cuisine: 'Deutsch',
  difficulty: 'medium',
  servings: 4,
  totalMinutes: 30,
  activeMinutes: 20,
  ingredients: [],
  steps: [],
  tips: [],
  tags: [],
}

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      currentRecipe: initialRecipeState,
      draftRecipes: {},

      setCurrentRecipe: (recipe) =>
        set({ currentRecipe: recipe }),

      updateCurrentRecipe: (updates) =>
        set((state) => ({
          currentRecipe: { ...state.currentRecipe, ...updates },
        })),

      clearCurrentRecipe: () =>
        set({ currentRecipe: initialRecipeState }),

      // Ingredient management
      addIngredient: (ingredient) =>
        set((state) => {
          const id = `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const newIngredient: Ingredient = { ...ingredient, id }
          
          return {
            currentRecipe: {
              ...state.currentRecipe,
              ingredients: [...(state.currentRecipe.ingredients || []), newIngredient],
            },
          }
        }),

      updateIngredient: (id, updates) =>
        set((state) => ({
          currentRecipe: {
            ...state.currentRecipe,
            ingredients: state.currentRecipe.ingredients?.map((ingredient) =>
              ingredient.id === id ? { ...ingredient, ...updates } : ingredient
            ),
          },
        })),

      removeIngredient: (id) =>
        set((state) => ({
          currentRecipe: {
            ...state.currentRecipe,
            ingredients: state.currentRecipe.ingredients?.filter(
              (ingredient) => ingredient.id !== id
            ),
          },
        })),

      reorderIngredients: (startIndex, endIndex) =>
        set((state) => {
          const ingredients = [...(state.currentRecipe.ingredients || [])]
          const [reorderedItem] = ingredients.splice(startIndex, 1)
          ingredients.splice(endIndex, 0, reorderedItem)
          
          return {
            currentRecipe: {
              ...state.currentRecipe,
              ingredients,
            },
          }
        }),

      // Step management
      addStep: (step) =>
        set((state) => {
          const id = `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const number = (state.currentRecipe.steps?.length || 0) + 1
          const newStep: RecipeStep = { ...step, id, number }
          
          return {
            currentRecipe: {
              ...state.currentRecipe,
              steps: [...(state.currentRecipe.steps || []), newStep],
            },
          }
        }),

      updateStep: (id, updates) =>
        set((state) => ({
          currentRecipe: {
            ...state.currentRecipe,
            steps: state.currentRecipe.steps?.map((step) =>
              step.id === id ? { ...step, ...updates } : step
            ),
          },
        })),

      removeStep: (id) =>
        set((state) => {
          const steps = state.currentRecipe.steps?.filter((step) => step.id !== id) || []
          // Renumber steps after removal
          const renumberedSteps = steps.map((step, index) => ({
            ...step,
            number: index + 1,
          }))
          
          return {
            currentRecipe: {
              ...state.currentRecipe,
              steps: renumberedSteps,
            },
          }
        }),

      reorderSteps: (startIndex, endIndex) =>
        set((state) => {
          const steps = [...(state.currentRecipe.steps || [])]
          const [reorderedItem] = steps.splice(startIndex, 1)
          steps.splice(endIndex, 0, reorderedItem)
          
          // Renumber steps after reordering
          const renumberedSteps = steps.map((step, index) => ({
            ...step,
            number: index + 1,
          }))
          
          return {
            currentRecipe: {
              ...state.currentRecipe,
              steps: renumberedSteps,
            },
          }
        }),

      // Tip management
      addTip: (tip) =>
        set((state) => {
          const id = `tip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const newTip: RecipeTip = { ...tip, id }
          
          return {
            currentRecipe: {
              ...state.currentRecipe,
              tips: [...(state.currentRecipe.tips || []), newTip],
            },
          }
        }),

      updateTip: (id, updates) =>
        set((state) => ({
          currentRecipe: {
            ...state.currentRecipe,
            tips: state.currentRecipe.tips?.map((tip) =>
              tip.id === id ? { ...tip, ...updates } : tip
            ),
          },
        })),

      removeTip: (id) =>
        set((state) => ({
          currentRecipe: {
            ...state.currentRecipe,
            tips: state.currentRecipe.tips?.filter((tip) => tip.id !== id),
          },
        })),

      // Draft management
      saveDraft: (id) =>
        set((state) => ({
          draftRecipes: {
            ...state.draftRecipes,
            [id]: {
              ...state.currentRecipe,
              updatedAt: new Date().toISOString(),
            },
          },
        })),

      loadDraft: (id) =>
        set((state) => ({
          currentRecipe: state.draftRecipes[id] || initialRecipeState,
        })),

      deleteDraft: (id) =>
        set((state) => {
          const { [id]: deleted, ...rest } = state.draftRecipes
          return { draftRecipes: rest }
        }),

      getDraftsList: () => {
        const { draftRecipes } = get()
        return Object.entries(draftRecipes).map(([id, draft]) => ({
          id,
          title: draft.title || 'Unbenanntes Rezept',
          updatedAt: (draft as any).updatedAt || new Date().toISOString(),
        }))
      },
    }),
    {
      name: 'mirolo-recipe-store',
      partialize: (state) => ({
        draftRecipes: state.draftRecipes,
      }),
    }
  )
)