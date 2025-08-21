'use client'

import { useState, useEffect } from 'react'
import { Recipe, RecipeWithDetails } from '@/types'

// IndexedDB utilities for offline recipe storage
const DB_NAME = 'mirolo-offline'
const DB_VERSION = 1
const RECIPES_STORE = 'recipes'
const RECIPE_DETAILS_STORE = 'recipe-details'

interface OfflineDB extends IDBDatabase {}

class OfflineRecipeManager {
  private db: OfflineDB | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create recipes store
        if (!db.objectStoreNames.contains(RECIPES_STORE)) {
          const recipesStore = db.createObjectStore(RECIPES_STORE, { keyPath: 'id' })
          recipesStore.createIndex('user_id', 'user_id', { unique: false })
          recipesStore.createIndex('updated_at', 'updated_at', { unique: false })
        }

        // Create recipe details store
        if (!db.objectStoreNames.contains(RECIPE_DETAILS_STORE)) {
          const detailsStore = db.createObjectStore(RECIPE_DETAILS_STORE, { keyPath: 'id' })
          detailsStore.createIndex('recipe_id', 'id', { unique: true })
        }
      }
    })
  }

  async saveRecipe(recipe: Recipe): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([RECIPES_STORE], 'readwrite')
      const store = transaction.objectStore(RECIPES_STORE)
      
      const request = store.put({
        ...recipe,
        cached_at: Date.now()
      })

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async saveRecipeDetails(recipe: RecipeWithDetails): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([RECIPE_DETAILS_STORE], 'readwrite')
      const store = transaction.objectStore(RECIPE_DETAILS_STORE)
      
      const request = store.put({
        ...recipe,
        cached_at: Date.now()
      })

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getRecipes(userId?: string): Promise<Recipe[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([RECIPES_STORE], 'readonly')
      const store = transaction.objectStore(RECIPES_STORE)
      
      let request: IDBRequest
      
      if (userId) {
        const index = store.index('user_id')
        request = index.getAll(userId)
      } else {
        request = store.getAll()
      }

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const recipes = request.result || []
        // Sort by updated_at descending
        recipes.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        resolve(recipes)
      }
    })
  }

  async getRecipeDetails(id: string): Promise<RecipeWithDetails | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([RECIPE_DETAILS_STORE], 'readonly')
      const store = transaction.objectStore(RECIPE_DETAILS_STORE)
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async deleteRecipe(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([RECIPES_STORE, RECIPE_DETAILS_STORE], 'readwrite')
      
      // Delete from both stores
      const recipesStore = transaction.objectStore(RECIPES_STORE)
      const detailsStore = transaction.objectStore(RECIPE_DETAILS_STORE)
      
      recipesStore.delete(id)
      detailsStore.delete(id)

      transaction.onerror = () => reject(transaction.error)
      transaction.oncomplete = () => resolve()
    })
  }

  async clearOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    // Clear cache older than maxAge (default 7 days)
    if (!this.db) await this.init()

    const cutoff = Date.now() - maxAge

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([RECIPES_STORE, RECIPE_DETAILS_STORE], 'readwrite')
      
      const recipesStore = transaction.objectStore(RECIPES_STORE)
      const detailsStore = transaction.objectStore(RECIPE_DETAILS_STORE)
      
      // Get all records and delete old ones
      recipesStore.getAll().onsuccess = (event) => {
        const recipes = (event.target as IDBRequest).result
        recipes.forEach((recipe: any) => {
          if (recipe.cached_at && recipe.cached_at < cutoff) {
            recipesStore.delete(recipe.id)
          }
        })
      }

      detailsStore.getAll().onsuccess = (event) => {
        const details = (event.target as IDBRequest).result
        details.forEach((detail: any) => {
          if (detail.cached_at && detail.cached_at < cutoff) {
            detailsStore.delete(detail.id)
          }
        })
      }

      transaction.onerror = () => reject(transaction.error)
      transaction.oncomplete = () => resolve()
    })
  }
}

const offlineManager = new OfflineRecipeManager()

export function useOfflineRecipes(userId?: string) {
  const [offlineRecipes, setOfflineRecipes] = useState<Recipe[]>([])
  const [isOffline, setIsOffline] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine)
    }

    updateOnlineStatus()
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Load offline recipes
  useEffect(() => {
    const loadOfflineRecipes = async () => {
      try {
        setLoading(true)
        const recipes = await offlineManager.getRecipes(userId)
        setOfflineRecipes(recipes)
      } catch (error) {
        console.error('Failed to load offline recipes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOfflineRecipes()
  }, [userId])

  // Auto-clear old cache on component mount
  useEffect(() => {
    offlineManager.clearOldCache().catch(console.error)
  }, [])

  const saveRecipeOffline = async (recipe: Recipe) => {
    try {
      await offlineManager.saveRecipe(recipe)
      setOfflineRecipes(prev => {
        const updated = prev.filter(r => r.id !== recipe.id)
        return [recipe, ...updated]
      })
    } catch (error) {
      console.error('Failed to save recipe offline:', error)
    }
  }

  const saveRecipeDetailsOffline = async (recipe: RecipeWithDetails) => {
    try {
      await offlineManager.saveRecipeDetails(recipe)
      // Also save basic recipe info
      await offlineManager.saveRecipe(recipe)
      setOfflineRecipes(prev => {
        const updated = prev.filter(r => r.id !== recipe.id)
        return [recipe, ...updated]
      })
    } catch (error) {
      console.error('Failed to save recipe details offline:', error)
    }
  }

  const getOfflineRecipeDetails = async (id: string): Promise<RecipeWithDetails | null> => {
    try {
      return await offlineManager.getRecipeDetails(id)
    } catch (error) {
      console.error('Failed to get offline recipe details:', error)
      return null
    }
  }

  const deleteOfflineRecipe = async (id: string) => {
    try {
      await offlineManager.deleteRecipe(id)
      setOfflineRecipes(prev => prev.filter(r => r.id !== id))
    } catch (error) {
      console.error('Failed to delete offline recipe:', error)
    }
  }

  return {
    offlineRecipes,
    isOffline,
    loading,
    saveRecipeOffline,
    saveRecipeDetailsOffline,
    getOfflineRecipeDetails,
    deleteOfflineRecipe,
  }
}