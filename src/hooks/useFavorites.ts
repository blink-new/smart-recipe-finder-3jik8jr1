import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import { UserFavoriteRecipe } from '../types/recipe'

export function useFavorites(user?: any) {
  const [favoriteRecipes, setFavoriteRecipes] = useState<UserFavoriteRecipe[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Stabilize userId to prevent unnecessary re-renders
  const userId = user?.id
  const isValidUser = Boolean(userId && typeof userId === 'string')

  const loadFavoriteRecipes = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const favorites = await blink.db.userFavoriteRecipes.list({
        where: { userId },
        orderBy: { savedAt: 'desc' }
      })
      setFavoriteRecipes(favorites || [])
    } catch (error) {
      console.error('Failed to load favorite recipes:', error)
      setFavoriteRecipes([])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (isValidUser) {
      loadFavoriteRecipes()
    } else {
      setFavoriteRecipes([])
      setIsLoading(false)
    }
  }, [isValidUser, loadFavoriteRecipes])

  const addToFavorites = async (recipeId: string) => {
    if (!user?.id || !recipeId) return

    // Check if recipe is already favorited
    if (favoriteRecipes.some(fav => fav.recipeId === recipeId)) {
      return
    }

    try {
      const newFavorite: UserFavoriteRecipe = {
        id: `favorite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        recipeId,
        savedAt: new Date().toISOString()
      }

      await blink.db.userFavoriteRecipes.create(newFavorite)
      setFavoriteRecipes(prev => [newFavorite, ...prev])
    } catch (error) {
      console.error('Failed to add recipe to favorites:', error)
      throw error
    }
  }

  const removeFromFavorites = async (recipeId: string) => {
    if (!user?.id) return

    try {
      const favoriteToRemove = favoriteRecipes.find(fav => fav.recipeId === recipeId)
      if (favoriteToRemove) {
        await blink.db.userFavoriteRecipes.delete(favoriteToRemove.id)
        setFavoriteRecipes(prev => prev.filter(fav => fav.recipeId !== recipeId))
      }
    } catch (error) {
      console.error('Failed to remove recipe from favorites:', error)
      throw error
    }
  }

  const isFavorite = (recipeId: string) => {
    return favoriteRecipes.some(fav => fav.recipeId === recipeId)
  }

  const toggleFavorite = async (recipeId: string) => {
    if (isFavorite(recipeId)) {
      await removeFromFavorites(recipeId)
    } else {
      await addToFavorites(recipeId)
    }
  }

  return {
    favoriteRecipes,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    favoriteRecipeIds: favoriteRecipes.map(fav => fav.recipeId)
  }
}