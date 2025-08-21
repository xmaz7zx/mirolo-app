'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUserRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleRecipeFavorite,
  searchPublicRecipes,
  duplicateRecipe,
  getFeaturedRecipes,
  getTrendingRecipes,
  getPublicRecipes,
} from '@/lib/recipes'
import { RecipeInsert, RecipeUpdate, RecipeFilters, SearchFilters } from '@/types'
import { useOfflineRecipes } from './useOfflineRecipes'
import { useAuthContext } from '@/components/providers/auth-provider'

// Query keys
export const recipeKeys = {
  all: ['recipes'] as const,
  user: (filters?: RecipeFilters & { tab?: string }) => 
    ['recipes', 'user', filters] as const,
  detail: (id: string) => ['recipes', 'detail', id] as const,
  search: (searchTerm: string, filters?: RecipeFilters) => 
    ['recipes', 'search', searchTerm, filters] as const,
  advancedSearch: (query: string, filters: SearchFilters) => 
    ['recipes', 'advanced-search', query, filters] as const,
  featured: ['recipes', 'featured'] as const,
  trending: ['recipes', 'trending'] as const,
  public: (filters?: { category?: string }) => 
    ['recipes', 'public', filters] as const,
}

// Get user recipes with offline support
export const useUserRecipes = (filters?: RecipeFilters & { tab?: 'mine' | 'favorites' | 'recent' }) => {
  const { user } = useAuthContext()
  const { offlineRecipes, isOffline, saveRecipeOffline } = useOfflineRecipes(user?.id)

  return useQuery({
    queryKey: recipeKeys.user(filters),
    queryFn: async () => {
      if (isOffline) {
        // Return cached recipes when offline
        return offlineRecipes.filter(recipe => {
          if (filters?.tab === 'mine') return recipe.user_id === user?.id
          if (filters?.tab === 'favorites') return recipe.is_favorite && recipe.user_id === user?.id
          if (filters?.tab === 'recent') return recipe.user_id === user?.id
          return recipe.user_id === user?.id
        })
      }

      // Fetch from network when online
      const recipes = await getUserRecipes(filters)
      
      // Cache recipes for offline use
      recipes.forEach(recipe => {
        saveRecipeOffline(recipe).catch(console.error)
      })

      return recipes
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get single recipe with offline support
export const useRecipe = (id: string) => {
  const { getOfflineRecipeDetails, isOffline, saveRecipeDetailsOffline } = useOfflineRecipes()

  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: async () => {
      if (isOffline) {
        // Try to get from offline cache first
        const cachedRecipe = await getOfflineRecipeDetails(id)
        if (cachedRecipe) {
          return cachedRecipe
        }
        throw new Error('Rezept nicht offline verfügbar')
      }

      // Fetch from network when online
      const recipe = await getRecipeById(id)
      
      // Cache recipe details for offline use
      if (recipe) {
        saveRecipeDetailsOffline(recipe).catch(console.error)
      }

      return recipe
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if offline and recipe not cached
      if (isOffline) return false
      return failureCount < 3
    }
  })
}

// Search public recipes (legacy)
export const useSearchRecipes = (searchTerm: string, filters?: RecipeFilters) => {
  return useQuery({
    queryKey: recipeKeys.search(searchTerm, filters),
    queryFn: () => searchPublicRecipes(searchTerm, filters),
    enabled: searchTerm.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Advanced search with new search filters
export const useAdvancedSearchRecipes = ({ query, filters, enabled = true }: {
  query: string
  filters: SearchFilters
  enabled?: boolean
}) => {
  return useQuery({
    queryKey: recipeKeys.advancedSearch(query, filters),
    queryFn: () => searchPublicRecipes(query, { 
      cuisine: filters.cuisine[0], // Convert array to single value for now
      difficulty: filters.difficulty[0],
      maxTime: filters.maxTime || undefined,
      tags: filters.tags,
    }),
    enabled: enabled && (query.trim().length > 0 || Object.values(filters).some(v => 
      Array.isArray(v) ? v.length > 0 : v !== null && v !== 'relevance'
    )),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Create recipe
export const useCreateRecipe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recipe: RecipeInsert) => createRecipe(recipe),
    onSuccess: () => {
      // Invalidate user recipes queries
      queryClient.invalidateQueries({ queryKey: recipeKeys.all })
    },
  })
}

// Update recipe
export const useUpdateRecipe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: RecipeUpdate }) =>
      updateRecipe(id, updates),
    onSuccess: (data) => {
      // Update specific recipe cache
      queryClient.setQueryData(recipeKeys.detail(data.id), data)
      // Invalidate user recipes
      queryClient.invalidateQueries({ queryKey: recipeKeys.user() })
    },
  })
}

// Delete recipe
export const useDeleteRecipe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: recipeKeys.detail(id) })
      // Invalidate user recipes
      queryClient.invalidateQueries({ queryKey: recipeKeys.user() })
    },
  })
}

// Toggle favorite
export const useToggleFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => toggleRecipeFavorite(id),
    onSuccess: (isFavorite, id) => {
      // Update recipe cache
      queryClient.setQueryData(
        recipeKeys.detail(id),
        (old: any) => old ? { ...old, is_favorite: isFavorite } : old
      )
      
      // Invalidate user recipes to update lists
      queryClient.invalidateQueries({ queryKey: recipeKeys.user() })
    },
  })
}

// Duplicate recipe
export const useDuplicateRecipe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newTitle }: { id: string; newTitle?: string }) =>
      duplicateRecipe(id, newTitle),
    onSuccess: () => {
      // Invalidate user recipes
      queryClient.invalidateQueries({ queryKey: recipeKeys.user() })
    },
  })
}

// Optimistic updates for quick actions
export const useOptimisticFavorite = () => {
  const queryClient = useQueryClient()

  const toggleFavorite = useMutation({
    mutationFn: (id: string) => toggleRecipeFavorite(id),
    onMutate: async (id: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: recipeKeys.detail(id) })

      // Snapshot previous value
      const previousRecipe = queryClient.getQueryData(recipeKeys.detail(id))

      // Optimistically update
      queryClient.setQueryData(recipeKeys.detail(id), (old: any) => {
        return old ? { ...old, is_favorite: !old.is_favorite } : old
      })

      return { previousRecipe }
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousRecipe) {
        queryClient.setQueryData(recipeKeys.detail(id), context.previousRecipe)
      }
    },
    onSettled: (data, error, id) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: recipeKeys.user() })
    },
  })

  return toggleFavorite
}

// Get featured recipes for discovery
export const useFeaturedRecipes = () => {
  return useQuery({
    queryKey: recipeKeys.featured,
    queryFn: () => getFeaturedRecipes(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Get trending recipes for discovery
export const useTrendingRecipes = () => {
  return useQuery({
    queryKey: recipeKeys.trending,
    queryFn: () => getTrendingRecipes(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Get public recipes by category
export const usePublicRecipes = ({ category, enabled = true }: {
  category?: string | null
  enabled?: boolean
}) => {
  return useQuery({
    queryKey: recipeKeys.public({ category: category || undefined }),
    queryFn: () => getPublicRecipes({ category: category || undefined }),
    enabled: enabled && !!category,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}