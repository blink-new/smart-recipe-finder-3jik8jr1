import { useState, useEffect, useCallback } from 'react'
import { NutritionInfo, Recipe, Ingredient } from '../types/recipe'
import { NutritionService } from '../services/nutritionService'

interface UseNutritionReturn {
  nutrition: NutritionInfo | null
  isLoading: boolean
  error: string | null
  calculateNutrition: (ingredients: Ingredient[], servings: number) => Promise<void>
  refreshNutrition: () => Promise<void>
}

// Cache for nutrition data to avoid repeated API calls
const nutritionCache = new Map<string, NutritionInfo>()

export function useNutrition(recipe?: Recipe): UseNutritionReturn {
  const [nutrition, setNutrition] = useState<NutritionInfo | null>(
    recipe?.nutritionInfo || null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate cache key from ingredients
  const generateCacheKey = useCallback((ingredients: Ingredient[], servings: number): string => {
    const ingredientString = ingredients
      .map(ing => `${ing.name}-${ing.amount}`)
      .sort()
      .join('|')
    return `${ingredientString}-${servings}`
  }, [])

  const calculateNutrition = useCallback(async (ingredients: Ingredient[], servings: number) => {
    if (!ingredients.length) {
      setNutrition(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Check cache first
      const cacheKey = generateCacheKey(ingredients, servings)
      const cachedNutrition = nutritionCache.get(cacheKey)
      
      if (cachedNutrition) {
        setNutrition(cachedNutrition)
        setIsLoading(false)
        return
      }

      // Calculate nutrition using the service
      const nutritionData = await NutritionService.calculateNutrition(ingredients, servings)
      
      // Validate the nutrition data
      if (NutritionService.validateNutrition(nutritionData)) {
        setNutrition(nutritionData)
        // Cache the result
        nutritionCache.set(cacheKey, nutritionData)
      } else {
        throw new Error('Invalid nutrition data received')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate nutrition'
      setError(errorMessage)
      console.error('Nutrition calculation error:', err)
      
      // Set fallback nutrition data
      setNutrition({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      })
    } finally {
      setIsLoading(false)
    }
  }, [generateCacheKey])

  const refreshNutrition = useCallback(async () => {
    if (recipe?.ingredients && recipe?.servings) {
      // Clear cache for this recipe
      const cacheKey = generateCacheKey(recipe.ingredients, recipe.servings)
      nutritionCache.delete(cacheKey)
      
      await calculateNutrition(recipe.ingredients, recipe.servings)
    }
  }, [recipe, calculateNutrition, generateCacheKey])

  // Auto-calculate nutrition when recipe changes
  useEffect(() => {
    if (recipe?.ingredients && recipe?.servings && !recipe?.nutritionInfo) {
      calculateNutrition(recipe.ingredients, recipe.servings)
    }
  }, [recipe, calculateNutrition])

  return {
    nutrition,
    isLoading,
    error,
    calculateNutrition,
    refreshNutrition
  }
}

// Hook for batch nutrition calculation (useful for recipe lists)
export function useBatchNutrition() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateBatchNutrition = useCallback(async (recipes: Recipe[]): Promise<Recipe[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const recipesWithNutrition = await Promise.all(
        recipes.map(async (recipe) => {
          // Skip if nutrition already exists
          if (recipe.nutritionInfo) {
            return recipe
          }

          try {
            const nutrition = await NutritionService.calculateNutrition(
              recipe.ingredients, 
              recipe.servings
            )
            
            return {
              ...recipe,
              nutritionInfo: nutrition
            }
          } catch (err) {
            console.error(`Failed to calculate nutrition for recipe ${recipe.id}:`, err)
            // Return recipe without nutrition rather than failing the whole batch
            return recipe
          }
        })
      )

      return recipesWithNutrition
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate batch nutrition'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    calculateBatchNutrition,
    isLoading,
    error
  }
}

// Utility hook for nutrition formatting
export function useNutritionFormatting() {
  const formatNutrition = useCallback((nutrition: NutritionInfo) => {
    return NutritionService.formatNutritionForDisplay(nutrition)
  }, [])

  const getNutritionSummary = useCallback((nutrition: NutritionInfo): string => {
    return `${nutrition.calories} cal • ${nutrition.protein}g protein • ${nutrition.carbs}g carbs • ${nutrition.fat}g fat`
  }, [])

  const calculateNutritionPercentages = useCallback((nutrition: NutritionInfo) => {
    const totalMacros = nutrition.protein * 4 + nutrition.carbs * 4 + nutrition.fat * 9
    
    return {
      proteinPercent: totalMacros > 0 ? Math.round((nutrition.protein * 4 / totalMacros) * 100) : 0,
      carbsPercent: totalMacros > 0 ? Math.round((nutrition.carbs * 4 / totalMacros) * 100) : 0,
      fatPercent: totalMacros > 0 ? Math.round((nutrition.fat * 9 / totalMacros) * 100) : 0
    }
  }, [])

  return {
    formatNutrition,
    getNutritionSummary,
    calculateNutritionPercentages
  }
}