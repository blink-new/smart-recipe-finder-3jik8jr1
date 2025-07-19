import { NutritionInfo, Ingredient } from '../types/recipe'
import { blink } from '../blink/client'

interface SpoonacularNutritionResponse {
  calories: number
  protein: string
  fat: string
  carbohydrates: string
  fiber?: string
  sugar?: string
}

interface SpoonacularIngredient {
  name: string
  amount: number
  unit: string
}

export class NutritionService {
  private static readonly BASE_URL = 'https://api.spoonacular.com'

  /**
   * Calculate nutritional information for a recipe based on its ingredients
   * @param ingredients - Array of recipe ingredients
   * @param servings - Number of servings the recipe makes
   * @returns Promise<NutritionInfo> - Nutritional information per serving
   */
  static async calculateNutrition(
    ingredients: Ingredient[], 
    servings: number = 1
  ): Promise<NutritionInfo> {
    try {
      // Convert ingredients to Spoonacular format
      const spoonacularIngredients = this.convertIngredientsFormat(ingredients)
      
      // Try to make API call to Spoonacular using Blink's secure proxy
      try {
        const response = await blink.data.fetch({
          url: `${this.BASE_URL}/recipes/parseIngredients`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': '{{SPOONACULAR_API_KEY}}', // Secret substitution
          },
          body: new URLSearchParams({
            ingredientList: spoonacularIngredients.map(ing => 
              `${ing.amount} ${ing.unit} ${ing.name}`
            ).join('\n'),
            servings: servings.toString(),
            includeNutrition: 'true'
          }).toString()
        })

        if (response.status === 200 && response.body) {
          // Calculate total nutrition from all ingredients
          const totalNutrition = this.aggregateNutrition(response.body)
          
          // Return per-serving nutrition
          return {
            calories: Math.round(totalNutrition.calories / servings),
            protein: Math.round(parseFloat(totalNutrition.protein) / servings),
            carbs: Math.round(parseFloat(totalNutrition.carbohydrates) / servings),
            fat: Math.round(parseFloat(totalNutrition.fat) / servings),
            fiber: totalNutrition.fiber ? Math.round(parseFloat(totalNutrition.fiber) / servings) : undefined,
            sugar: totalNutrition.sugar ? Math.round(parseFloat(totalNutrition.sugar) / servings) : undefined
          }
        } else {
          throw new Error(`Spoonacular API error: ${response.status}`)
        }
      } catch (apiError) {
        console.warn('Spoonacular API call failed, using estimated nutrition values:', apiError)
        // Fallback to estimated nutrition
        return this.getEstimatedNutrition(ingredients, servings)
      }
    } catch (error) {
      console.error('Error calculating nutrition:', error)
      // Fallback to estimated nutrition
      return this.getEstimatedNutrition(ingredients, servings)
    }
  }

  /**
   * Get estimated nutrition when API is unavailable
   * Uses basic ingredient-based estimation
   */
  private static getEstimatedNutrition(ingredients: Ingredient[], servings: number): NutritionInfo {
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    // Basic nutrition estimates per common ingredient types
    const nutritionEstimates: Record<string, { calories: number, protein: number, carbs: number, fat: number }> = {
      // Proteins
      'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      'beef': { calories: 250, protein: 26, carbs: 0, fat: 15 },
      'fish': { calories: 140, protein: 25, carbs: 0, fat: 3 },
      'eggs': { calories: 155, protein: 13, carbs: 1, fat: 11 },
      'tofu': { calories: 70, protein: 8, carbs: 2, fat: 4 },
      
      // Carbs
      'pasta': { calories: 220, protein: 8, carbs: 44, fat: 1 },
      'rice': { calories: 205, protein: 4, carbs: 45, fat: 0.5 },
      'bread': { calories: 265, protein: 9, carbs: 49, fat: 3 },
      'quinoa': { calories: 222, protein: 8, carbs: 39, fat: 4 },
      'potato': { calories: 161, protein: 4, carbs: 37, fat: 0.2 },
      
      // Vegetables
      'broccoli': { calories: 34, protein: 3, carbs: 7, fat: 0.4 },
      'spinach': { calories: 23, protein: 3, carbs: 4, fat: 0.4 },
      'tomato': { calories: 18, protein: 1, carbs: 4, fat: 0.2 },
      'onion': { calories: 40, protein: 1, carbs: 9, fat: 0.1 },
      'mushroom': { calories: 22, protein: 3, carbs: 3, fat: 0.3 },
      
      // Fats
      'olive oil': { calories: 884, protein: 0, carbs: 0, fat: 100 },
      'butter': { calories: 717, protein: 1, carbs: 1, fat: 81 },
      'cheese': { calories: 400, protein: 25, carbs: 1, fat: 33 },
      'cream': { calories: 345, protein: 2, carbs: 3, fat: 37 },
      
      // Default for unknown ingredients
      'default': { calories: 50, protein: 2, carbs: 8, fat: 1 }
    }

    ingredients.forEach(ingredient => {
      // Find matching nutrition estimate
      const key = Object.keys(nutritionEstimates).find(k => 
        ingredient.name.toLowerCase().includes(k.toLowerCase())
      ) || 'default'
      
      const nutrition = nutritionEstimates[key]
      
      // Estimate portion size (very basic)
      let portionMultiplier = 0.5 // Default small portion
      
      if (ingredient.amount.includes('cup')) {
        portionMultiplier = parseFloat(ingredient.amount) || 0.5
      } else if (ingredient.amount.includes('tbsp')) {
        portionMultiplier = (parseFloat(ingredient.amount) || 1) * 0.0625 // tbsp to cup
      } else if (ingredient.amount.includes('oz')) {
        portionMultiplier = (parseFloat(ingredient.amount) || 1) * 0.125 // oz to cup
      } else if (ingredient.amount.includes('lb')) {
        portionMultiplier = (parseFloat(ingredient.amount) || 1) * 2 // lb is substantial
      }
      
      totalCalories += nutrition.calories * portionMultiplier
      totalProtein += nutrition.protein * portionMultiplier
      totalCarbs += nutrition.carbs * portionMultiplier
      totalFat += nutrition.fat * portionMultiplier
    })

    return {
      calories: Math.round(totalCalories / servings),
      protein: Math.round(totalProtein / servings),
      carbs: Math.round(totalCarbs / servings),
      fat: Math.round(totalFat / servings)
    }
  }

  /**
   * Convert recipe ingredients to Spoonacular format
   */
  private static convertIngredientsFormat(ingredients: Ingredient[]): SpoonacularIngredient[] {
    return ingredients.map(ingredient => {
      // Extract amount and unit from the amount string
      const amountMatch = ingredient.amount.match(/^(\d+(?:\.\d+)?)\s*(.*)$/)
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 1
      const unit = amountMatch ? amountMatch[2].trim() : ingredient.unit || ''
      
      return {
        name: ingredient.name,
        amount,
        unit
      }
    })
  }

  /**
   * Aggregate nutrition from multiple ingredients
   */
  private static aggregateNutrition(ingredientsData: any[]): SpoonacularNutritionResponse {
    const totals = {
      calories: 0,
      protein: '0',
      fat: '0',
      carbohydrates: '0',
      fiber: '0',
      sugar: '0'
    }

    ingredientsData.forEach(ingredient => {
      if (ingredient.nutrition) {
        totals.calories += ingredient.nutrition.calories || 0
        totals.protein = (parseFloat(totals.protein) + (ingredient.nutrition.protein || 0)).toString()
        totals.fat = (parseFloat(totals.fat) + (ingredient.nutrition.fat || 0)).toString()
        totals.carbohydrates = (parseFloat(totals.carbohydrates) + (ingredient.nutrition.carbohydrates || 0)).toString()
        totals.fiber = (parseFloat(totals.fiber) + (ingredient.nutrition.fiber || 0)).toString()
        totals.sugar = (parseFloat(totals.sugar) + (ingredient.nutrition.sugar || 0)).toString()
      }
    })

    return totals
  }

  /**
   * Validate nutrition data
   */
  static validateNutrition(nutrition: NutritionInfo): boolean {
    return (
      nutrition.calories >= 0 &&
      nutrition.protein >= 0 &&
      nutrition.carbs >= 0 &&
      nutrition.fat >= 0
    )
  }

  /**
   * Format nutrition for display
   */
  static formatNutritionForDisplay(nutrition: NutritionInfo): {
    calories: string
    protein: string
    carbs: string
    fat: string
    fiber?: string
    sugar?: string
  } {
    return {
      calories: `${nutrition.calories} cal`,
      protein: `${nutrition.protein}g`,
      carbs: `${nutrition.carbs}g`,
      fat: `${nutrition.fat}g`,
      fiber: nutrition.fiber ? `${nutrition.fiber}g` : undefined,
      sugar: nutrition.sugar ? `${nutrition.sugar}g` : undefined
    }
  }
}