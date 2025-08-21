import { createClient } from '@/lib/createClient()'
import { Recipe, RecipeInsert, RecipeUpdate, RecipeWithDetails, RecipeFilters } from '@/types'

export class RecipeError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'RecipeError'
  }
}

// Create new recipe
export const createRecipe = async (recipe: RecipeInsert): Promise<Recipe> => {
  const { data: { user }, error: authError } = await createClient().auth.getUser()
  if (authError || !user) {
    throw new RecipeError('Authentication required')
  }

  const { data, error } = await createClient()
    .from('recipes')
    .insert({
      ...recipe,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new RecipeError(`Failed to create recipe: ${error.message}`)
  }

  return data
}

// Get recipe by ID with all details
export const getRecipeById = async (id: string): Promise<RecipeWithDetails | null> => {
  const { data: recipe, error: recipeError } = await createClient()
    .from('recipes')
    .select(`
      *,
      profiles:user_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single()

  if (recipeError || !recipe) {
    return null
  }

  // Get photos
  const { data: photos } = await createClient()
    .from('recipe_photos')
    .select('*')
    .eq('recipe_id', id)
    .order('uploaded_at', { ascending: false })

  // Get tags
  const { data: recipeTags } = await createClient()
    .from('recipe_tags')
    .select(`
      tags (
        id,
        name,
        category
      )
    `)
    .eq('recipe_id', id)

  return {
    ...recipe,
    ingredients: recipe.ingredients as any[],
    steps: recipe.steps as any[],
    tips: recipe.tips as any[],
    nutrition: recipe.nutrition as any,
    photos: photos || [],
    tags: recipeTags?.map(rt => (rt as any).tags) || [],
    profile: recipe.profiles as any,
  }
}

// Get user's recipes with filtering
export const getUserRecipes = async (
  filters?: RecipeFilters & { tab?: 'mine' | 'favorites' | 'recent' }
): Promise<Recipe[]> => {
  const { data: { user }, error: authError } = await createClient().auth.getUser()
  if (authError || !user) {
    throw new RecipeError('Authentication required')
  }

  let query = createClient().from('recipes').select('*')

  // Apply tab filter
  if (filters?.tab === 'mine') {
    query = query.eq('user_id', user.id)
  } else if (filters?.tab === 'favorites') {
    query = query.eq('is_favorite', true).eq('user_id', user.id)
  } else if (filters?.tab === 'recent') {
    query = query.eq('user_id', user.id).order('updated_at', { ascending: false }).limit(20)
  } else {
    query = query.eq('user_id', user.id)
  }

  // Apply other filters
  if (filters?.cuisine) {
    query = query.ilike('cuisine', `%${filters.cuisine}%`)
  }

  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty)
  }

  if (filters?.maxTime) {
    query = query.lte('total_minutes', filters.maxTime)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    throw new RecipeError(`Failed to fetch recipes: ${error.message}`)
  }

  return data || []
}

// Search public recipes
export const searchPublicRecipes = async (
  searchTerm: string = '',
  filters?: RecipeFilters
): Promise<Recipe[]> => {
  let query = createClient()
    .from('recipes')
    .select('*')
    .eq('is_public', true)

  // Search in title and summary
  if (searchTerm.trim()) {
    query = query.or(`title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`)
  }

  // Apply filters
  if (filters?.cuisine) {
    query = query.ilike('cuisine', `%${filters.cuisine}%`)
  }

  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty)
  }

  if (filters?.maxTime) {
    query = query.lte('total_minutes', filters.maxTime)
  }

  query = query.order('created_at', { ascending: false }).limit(50)

  const { data, error } = await query

  if (error) {
    throw new RecipeError(`Search failed: ${error.message}`)
  }

  return data || []
}

// Update recipe
export const updateRecipe = async (id: string, updates: RecipeUpdate): Promise<Recipe> => {
  const { data: { user }, error: authError } = await createClient().auth.getUser()
  if (authError || !user) {
    throw new RecipeError('Authentication required')
  }

  // Create new version before updating
  const { data: originalRecipe } = await createClient()
    .from('recipes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (originalRecipe) {
    const { data: versions } = await createClient()
      .from('recipe_versions')
      .select('version_number')
      .eq('recipe_id', id)
      .order('version_number', { ascending: false })
      .limit(1)

    const nextVersion = versions?.[0]?.version_number ? versions[0].version_number + 1 : 1

    await createClient()
      .from('recipe_versions')
      .insert({
        recipe_id: id,
        version_number: nextVersion,
        recipe_data: originalRecipe,
        changes_notes: 'Auto-saved version before update',
      })
  }

  // Update recipe
  const { data, error } = await createClient()
    .from('recipes')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw new RecipeError(`Failed to update recipe: ${error.message}`)
  }

  return data
}

// Toggle favorite
export const toggleRecipeFavorite = async (id: string): Promise<boolean> => {
  const { data: { user }, error: authError } = await createClient().auth.getUser()
  if (authError || !user) {
    throw new RecipeError('Authentication required')
  }

  const { data: recipe } = await createClient()
    .from('recipes')
    .select('is_favorite')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!recipe) {
    throw new RecipeError('Recipe not found')
  }

  const newFavoriteStatus = !recipe.is_favorite

  const { error } = await createClient()
    .from('recipes')
    .update({ is_favorite: newFavoriteStatus })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new RecipeError(`Failed to update favorite: ${error.message}`)
  }

  return newFavoriteStatus
}

// Delete recipe
export const deleteRecipe = async (id: string): Promise<void> => {
  const { data: { user }, error: authError } = await createClient().auth.getUser()
  if (authError || !user) {
    throw new RecipeError('Authentication required')
  }

  const { error } = await createClient()
    .from('recipes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new RecipeError(`Failed to delete recipe: ${error.message}`)
  }
}

// Get recipe versions
export const getRecipeVersions = async (recipeId: string) => {
  const { data: { user }, error: authError } = await createClient().auth.getUser()
  if (authError || !user) {
    throw new RecipeError('Authentication required')
  }

  const { data, error } = await createClient()
    .from('recipe_versions')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('version_number', { ascending: false })

  if (error) {
    throw new RecipeError(`Failed to fetch versions: ${error.message}`)
  }

  return data || []
}

// Duplicate recipe
export const duplicateRecipe = async (id: string, newTitle?: string): Promise<Recipe> => {
  const originalRecipe = await getRecipeById(id)
  if (!originalRecipe) {
    throw new RecipeError('Recipe not found')
  }

  const { data: { user }, error: authError } = await createClient().auth.getUser()
  if (authError || !user) {
    throw new RecipeError('Authentication required')
  }

  const duplicatedRecipe: RecipeInsert = {
    title: newTitle || `${originalRecipe.title} (Kopie)`,
    summary: originalRecipe.summary,
    cuisine: originalRecipe.cuisine,
    difficulty: originalRecipe.difficulty,
    servings: originalRecipe.servings,
    total_minutes: originalRecipe.total_minutes,
    active_minutes: originalRecipe.active_minutes,
    ingredients: originalRecipe.ingredients,
    steps: originalRecipe.steps,
    tips: originalRecipe.tips,
    nutrition: originalRecipe.nutrition,
    is_public: false, // Always private by default
    user_id: user.id,
  }

  return createRecipe(duplicatedRecipe)
}

// Get featured recipes
export const getFeaturedRecipes = async (): Promise<Recipe[]> => {
  const { data, error } = await createClient()
    .from('recipes')
    .select('*')
    .eq('is_public', true)
    .eq('is_featured', true)
    .order('featured_at', { ascending: false })
    .limit(6)

  if (error) {
    throw new RecipeError(`Failed to fetch featured recipes: ${error.message}`)
  }

  return data || []
}

// Get trending recipes (based on recent activity)
export const getTrendingRecipes = async (): Promise<Recipe[]> => {
  const { data, error } = await createClient()
    .from('recipes')
    .select('*')
    .eq('is_public', true)
    .order('view_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    throw new RecipeError(`Failed to fetch trending recipes: ${error.message}`)
  }

  return data || []
}

// Get public recipes by category
export const getPublicRecipes = async (options?: { 
  category?: string 
}): Promise<Recipe[]> => {
  let query = createClient()
    .from('recipes')
    .select('*')
    .eq('is_public', true)

  if (options?.category) {
    query = query.ilike('cuisine', `%${options.category}%`)
  }

  query = query.order('created_at', { ascending: false }).limit(20)

  const { data, error } = await query

  if (error) {
    throw new RecipeError(`Failed to fetch public recipes: ${error.message}`)
  }

  return data || []
}