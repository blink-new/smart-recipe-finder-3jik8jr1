import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import { MealPlan, WeeklyMeals, DayOfWeek, MealType, GroceryListItem } from '../types/mealPlan'
import { Recipe } from '../types/recipe'

export function useMealPlan(user?: any) {
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get the start of the current week (Monday)
  const getCurrentWeekStart = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Adjust for Sunday (0) to be -6
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    return monday.toISOString().split('T')[0]
  }

  // Stabilize userId to prevent unnecessary re-renders
  const userId = user?.id
  const isValidUser = Boolean(userId && typeof userId === 'string')

  const loadCurrentMealPlan = useCallback(async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      const weekStart = getCurrentWeekStart()
      
      const existingPlans = await blink.db.mealPlans.list({
        where: { 
          userId,
          weekStartDate: weekStart
        }
      })

      if (existingPlans.length > 0) {
        const plan = existingPlans[0]
        setCurrentMealPlan({
          ...plan,
          meals: JSON.parse(plan.meals)
        })
      } else {
        // Create a new empty meal plan for this week
        const emptyMeals: WeeklyMeals = {
          monday: {},
          tuesday: {},
          wednesday: {},
          thursday: {},
          friday: {},
          saturday: {},
          sunday: {}
        }

        const newPlan: MealPlan = {
          id: `meal_plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          weekStartDate: weekStart,
          meals: emptyMeals,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        await blink.db.mealPlans.create({
          ...newPlan,
          meals: JSON.stringify(newPlan.meals)
        })

        setCurrentMealPlan(newPlan)
      }
    } catch (error) {
      console.error('Failed to load meal plan:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (isValidUser) {
      loadCurrentMealPlan()
    } else {
      setCurrentMealPlan(null)
      setIsLoading(false)
    }
  }, [isValidUser, loadCurrentMealPlan])

  const assignRecipe = async (day: DayOfWeek, mealType: MealType, recipeId: string) => {
    if (!currentMealPlan || !user?.id) return

    try {
      const updatedMeals = {
        ...currentMealPlan.meals,
        [day]: {
          ...currentMealPlan.meals[day],
          [mealType]: recipeId
        }
      }

      const updatedPlan = {
        ...currentMealPlan,
        meals: updatedMeals,
        updatedAt: new Date().toISOString()
      }

      await blink.db.mealPlans.update(currentMealPlan.id, {
        meals: JSON.stringify(updatedMeals),
        updatedAt: updatedPlan.updatedAt
      })

      setCurrentMealPlan(updatedPlan)
    } catch (error) {
      console.error('Failed to assign recipe:', error)
      throw error
    }
  }

  const removeRecipe = async (day: DayOfWeek, mealType: MealType) => {
    if (!currentMealPlan || !user?.id) return

    try {
      const updatedMeals = {
        ...currentMealPlan.meals,
        [day]: {
          ...currentMealPlan.meals[day]
        }
      }

      // Remove the meal type
      delete updatedMeals[day][mealType]

      const updatedPlan = {
        ...currentMealPlan,
        meals: updatedMeals,
        updatedAt: new Date().toISOString()
      }

      await blink.db.mealPlans.update(currentMealPlan.id, {
        meals: JSON.stringify(updatedMeals),
        updatedAt: updatedPlan.updatedAt
      })

      setCurrentMealPlan(updatedPlan)
    } catch (error) {
      console.error('Failed to remove recipe:', error)
      throw error
    }
  }

  const swapRecipes = async (
    fromDay: DayOfWeek, 
    fromMeal: MealType, 
    toDay: DayOfWeek, 
    toMeal: MealType
  ) => {
    if (!currentMealPlan || !user?.id) return

    try {
      const fromRecipeId = currentMealPlan.meals[fromDay][fromMeal]
      const toRecipeId = currentMealPlan.meals[toDay][toMeal]

      const updatedMeals = { ...currentMealPlan.meals }

      // Swap the recipes
      if (fromRecipeId) {
        updatedMeals[toDay] = {
          ...updatedMeals[toDay],
          [toMeal]: fromRecipeId
        }
      } else {
        delete updatedMeals[toDay][toMeal]
      }

      if (toRecipeId) {
        updatedMeals[fromDay] = {
          ...updatedMeals[fromDay],
          [fromMeal]: toRecipeId
        }
      } else {
        delete updatedMeals[fromDay][fromMeal]
      }

      const updatedPlan = {
        ...currentMealPlan,
        meals: updatedMeals,
        updatedAt: new Date().toISOString()
      }

      await blink.db.mealPlans.update(currentMealPlan.id, {
        meals: JSON.stringify(updatedMeals),
        updatedAt: updatedPlan.updatedAt
      })

      setCurrentMealPlan(updatedPlan)
    } catch (error) {
      console.error('Failed to swap recipes:', error)
      throw error
    }
  }

  const generateGroceryList = async (recipes: Recipe[], pantryIngredients: string[]) => {
    if (!user?.id || !currentMealPlan) return []

    try {
      // Clear existing grocery list items for this week
      const existingItems = await blink.db.groceryListItems.list({
        where: { userId: user.id }
      })

      for (const item of existingItems) {
        await blink.db.groceryListItems.delete(item.id)
      }

      const groceryItems: GroceryListItem[] = []
      const weekStart = getCurrentWeekStart()

      // Collect all ingredients from assigned recipes
      const recipeIngredientMap = new Map<string, { recipe: Recipe, ingredients: any[] }>()
      
      recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
          const normalizedName = ingredient.name.toLowerCase().trim()
          
          // Check if ingredient is not in pantry
          if (!pantryIngredients.includes(normalizedName)) {
            const item: GroceryListItem = {
              id: `grocery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              userId: user.id,
              ingredient: ingredient.name,
              amount: ingredient.amount,
              unit: ingredient.unit || '',
              recipeId: recipe.id,
              recipeName: recipe.title,
              isChecked: false,
              addedAt: new Date().toISOString()
            }
            groceryItems.push(item)
          }
        })
      })

      // Save grocery list items to database
      for (const item of groceryItems) {
        await blink.db.groceryListItems.create(item)
      }

      // Track that we generated a grocery list for this week
      await blink.db.generatedGroceryLists.create({
        id: `grocery_list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        weekStartDate: weekStart,
        generatedAt: new Date().toISOString()
      })

      return groceryItems
    } catch (error) {
      console.error('Failed to generate grocery list:', error)
      throw error
    }
  }

  return {
    currentMealPlan,
    isLoading,
    assignRecipe,
    removeRecipe,
    swapRecipes,
    generateGroceryList,
    getCurrentWeekStart
  }
}