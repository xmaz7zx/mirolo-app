import { Database } from './database'

// Database types
export type Recipe = Database['public']['Tables']['recipes']['Row']
export type RecipeInsert = Database['public']['Tables']['recipes']['Insert']
export type RecipeUpdate = Database['public']['Tables']['recipes']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type RecipeVersion = Database['public']['Tables']['recipe_versions']['Row']
export type RecipePhoto = Database['public']['Tables']['recipe_photos']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type ShoppingList = Database['public']['Tables']['shopping_lists']['Row']

// App-specific types
export interface Ingredient {
  id: string
  name: string
  amount: number
  unit: string
  category?: string
}

export interface RecipeStep {
  id: string
  number: number
  instruction: string
  duration?: number
  temperature?: number
}

export interface RecipeTip {
  id: string
  content: string
  type: 'preparation' | 'cooking' | 'serving' | 'storage'
}

export interface NutritionInfo {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
  sugar?: number
  sodium?: number
}

export interface RecipeWithDetails extends Recipe {
  ingredients: Ingredient[]
  steps: RecipeStep[]
  tips?: RecipeTip[]
  nutrition?: NutritionInfo
  photos?: RecipePhoto[]
  tags?: Tag[]
  profile?: Profile
}

export interface ShoppingListItem {
  id: string
  name: string
  amount: number
  unit: string
  category?: string
  checked: boolean
  recipe_id?: string
  recipe_title?: string
}

export interface RecipeFilters {
  cuisine?: string
  difficulty?: Recipe['difficulty']
  maxTime?: number
  tags?: string[]
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
}

export interface SearchFilters {
  cuisine: string[]
  difficulty: Difficulty[]
  maxTime: number | null
  tags: string[]
  sortBy: string
}

export interface AuthUser {
  id: string
  email: string
  profile?: Profile
}

export type Difficulty = 'easy' | 'medium' | 'hard'
export type PhotoType = 'main' | 'step' | 'result'
export type TagCategory = 'cuisine' | 'diet' | 'method' | 'occasion' | 'ingredient'