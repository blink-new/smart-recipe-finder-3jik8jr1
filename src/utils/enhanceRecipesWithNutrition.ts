import { Recipe } from '../types/recipe'
import { NutritionService } from '../services/nutritionService'

/**
 * Enhance recipes with nutritional information
 * This function can be called to update existing recipes with nutrition data
 */
export async function enhanceRecipesWithNutrition(recipes: Recipe[]): Promise<Recipe[]> {
  console.log('Enhancing recipes with nutritional information...')
  
  const enhancedRecipes = await Promise.all(
    recipes.map(async (recipe) => {
      try {
        // Skip if nutrition already exists and is complete
        if (recipe.nutritionInfo && 
            recipe.nutritionInfo.calories > 0 && 
            recipe.nutritionInfo.protein > 0) {
          return recipe
        }

        console.log(`Calculating nutrition for: ${recipe.title}`)
        
        // Calculate nutrition using the service
        const nutrition = await NutritionService.calculateNutrition(
          recipe.ingredients,
          recipe.servings
        )

        return {
          ...recipe,
          nutritionInfo: nutrition,
          updatedAt: new Date().toISOString()
        }
      } catch (error) {
        console.error(`Failed to enhance recipe ${recipe.title} with nutrition:`, error)
        // Return original recipe if enhancement fails
        return recipe
      }
    })
  )

  console.log('Recipe nutrition enhancement complete')
  return enhancedRecipes
}

/**
 * Validate and fix nutrition data for recipes
 */
export function validateRecipeNutrition(recipes: Recipe[]): Recipe[] {
  return recipes.map(recipe => {
    if (!recipe.nutritionInfo) {
      return recipe
    }

    // Ensure all nutrition values are positive numbers
    const nutrition = {
      calories: Math.max(0, Math.round(recipe.nutritionInfo.calories || 0)),
      protein: Math.max(0, Math.round(recipe.nutritionInfo.protein || 0)),
      carbs: Math.max(0, Math.round(recipe.nutritionInfo.carbs || 0)),
      fat: Math.max(0, Math.round(recipe.nutritionInfo.fat || 0)),
      fiber: recipe.nutritionInfo.fiber ? Math.max(0, Math.round(recipe.nutritionInfo.fiber)) : undefined,
      sugar: recipe.nutritionInfo.sugar ? Math.max(0, Math.round(recipe.nutritionInfo.sugar)) : undefined
    }

    return {
      ...recipe,
      nutritionInfo: nutrition
    }
  })
}

/**
 * Get nutrition summary statistics for a set of recipes
 */
export function getNutritionStats(recipes: Recipe[]) {
  const recipesWithNutrition = recipes.filter(r => r.nutritionInfo)
  
  if (recipesWithNutrition.length === 0) {
    return {
      totalRecipes: recipes.length,
      recipesWithNutrition: 0,
      averageCalories: 0,
      averageProtein: 0,
      averageCarbs: 0,
      averageFat: 0
    }
  }

  const totals = recipesWithNutrition.reduce(
    (acc, recipe) => {
      const nutrition = recipe.nutritionInfo!
      return {
        calories: acc.calories + nutrition.calories,
        protein: acc.protein + nutrition.protein,
        carbs: acc.carbs + nutrition.carbs,
        fat: acc.fat + nutrition.fat
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const count = recipesWithNutrition.length

  return {
    totalRecipes: recipes.length,
    recipesWithNutrition: count,
    averageCalories: Math.round(totals.calories / count),
    averageProtein: Math.round(totals.protein / count),
    averageCarbs: Math.round(totals.carbs / count),
    averageFat: Math.round(totals.fat / count)
  }
}