import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import { UserPantryItem } from '../types/recipe'

export function usePantry(user?: any) {
  const [pantryItems, setPantryItems] = useState<UserPantryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Stabilize userId to prevent unnecessary re-renders
  const userId = user?.id
  const isValidUser = Boolean(userId && typeof userId === 'string')

  const loadPantryItems = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const items = await blink.db.userPantryItems.list({
        where: { userId },
        orderBy: { addedAt: 'desc' }
      })
      setPantryItems(items || [])
    } catch (error) {
      console.error('Failed to load pantry items:', error)
      setPantryItems([])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (isValidUser) {
      loadPantryItems()
    } else {
      setPantryItems([])
      setIsLoading(false)
    }
  }, [isValidUser, loadPantryItems])

  const addIngredient = async (ingredient: string) => {
    if (!user?.id || !ingredient.trim()) return

    const normalizedIngredient = ingredient.trim().toLowerCase()
    
    // Check if ingredient already exists
    if (pantryItems.some(item => item.ingredient === normalizedIngredient)) {
      return
    }

    try {
      const newItem: UserPantryItem = {
        id: `pantry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        ingredient: normalizedIngredient,
        addedAt: new Date().toISOString()
      }

      await blink.db.userPantryItems.create(newItem)
      setPantryItems(prev => [newItem, ...prev])
    } catch (error) {
      console.error('Failed to add ingredient:', error)
      throw error
    }
  }

  const removeIngredient = async (ingredient: string) => {
    if (!user?.id) return

    try {
      const itemToRemove = pantryItems.find(item => item.ingredient === ingredient)
      if (itemToRemove) {
        await blink.db.userPantryItems.delete(itemToRemove.id)
        setPantryItems(prev => prev.filter(item => item.ingredient !== ingredient))
      }
    } catch (error) {
      console.error('Failed to remove ingredient:', error)
      throw error
    }
  }

  const clearPantry = async () => {
    if (!user?.id) return

    try {
      // Delete all pantry items for the user
      for (const item of pantryItems) {
        await blink.db.userPantryItems.delete(item.id)
      }
      setPantryItems([])
    } catch (error) {
      console.error('Failed to clear pantry:', error)
      throw error
    }
  }

  return {
    pantryItems,
    isLoading,
    addIngredient,
    removeIngredient,
    clearPantry,
    ingredients: pantryItems.map(item => item.ingredient)
  }
}