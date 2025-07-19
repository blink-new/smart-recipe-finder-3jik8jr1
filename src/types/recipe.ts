export interface Recipe {
  id: string
  title: string
  description: string
  imageUrl?: string
  totalTime: number
  prepTime: number
  cookTime: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  budgetLevel: 'low' | 'medium' | 'high'
  dietaryTags: string[]
  requiredIngredients: string[]
  ingredients: Ingredient[]
  instructions: string[]
  nutritionInfo?: NutritionInfo
  createdAt: string
  updatedAt: string
}

export interface Ingredient {
  name: string
  amount: string
  unit?: string
}

export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
}

export interface UserPantryItem {
  id: string
  userId: string
  ingredient: string
  addedAt: string
}

export interface UserFavoriteRecipe {
  id: string
  userId: string
  recipeId: string
  savedAt: string
}

export interface UserFeedback {
  id: string
  userId: string
  recipeId: string
  rating: number
  comment?: string
  createdAt: string
}

export interface RecipeRating {
  id: string
  userId: string
  recipeId: string
  rating: number
  createdAt: string
  updatedAt: string
}

export interface RecipeReview {
  id: string
  userId: string
  recipeId: string
  reviewText: string
  createdAt: string
  updatedAt: string
}

export interface RecipeWithRating extends Recipe {
  averageRating?: number
  totalRatings?: number
  userRating?: number
}

export interface UserPreferences {
  dietaryPreferences: string[]
  cookingTimePreference: number
  budgetPreference: 'low' | 'medium' | 'high'
  allergies: string[]
  favoriteCuisines: string[]
}