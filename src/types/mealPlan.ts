export interface MealPlan {
  id: string
  userId: string
  weekStartDate: string // ISO date string for the Monday of the week
  meals: WeeklyMeals
  createdAt: string
  updatedAt: string
}

export interface WeeklyMeals {
  monday: DayMeals
  tuesday: DayMeals
  wednesday: DayMeals
  thursday: DayMeals
  friday: DayMeals
  saturday: DayMeals
  sunday: DayMeals
}

export interface DayMeals {
  breakfast?: string // recipe ID
  lunch?: string // recipe ID
  dinner?: string // recipe ID
}

export interface GroceryListItem {
  id: string
  userId: string
  ingredient: string
  amount: string
  unit?: string
  recipeId: string
  recipeName: string
  isChecked: boolean
  addedAt: string
}

export interface GeneratedGroceryList {
  id: string
  userId: string
  weekStartDate: string
  items: GroceryListItem[]
  generatedAt: string
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type MealType = 'breakfast' | 'lunch' | 'dinner'