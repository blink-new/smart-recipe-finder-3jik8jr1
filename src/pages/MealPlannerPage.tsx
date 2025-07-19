import React, { useState, useEffect } from 'react'
import { Calendar, Plus, X, ArrowLeftRight, ShoppingCart, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useMealPlan } from '@/hooks/useMealPlan'
import { usePantry } from '@/hooks/usePantry'
import { sampleRecipes } from '@/data/sampleRecipes'
import { Recipe } from '@/types/recipe'
import { DayOfWeek, MealType } from '@/types/mealPlan'
import { User } from '@/App'
import { analyticsService } from '@/services/analyticsService'

interface MealPlannerPageProps {
  user: User
}

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
]

const MEAL_TYPES: { key: MealType; label: string; color: string }[] = [
  { key: 'breakfast', label: 'Breakfast', color: 'bg-orange-100 text-orange-800' },
  { key: 'lunch', label: 'Lunch', color: 'bg-blue-100 text-blue-800' },
  { key: 'dinner', label: 'Dinner', color: 'bg-purple-100 text-purple-800' }
]

export function MealPlannerPage({ user }: MealPlannerPageProps) {
  const { currentMealPlan, isLoading, assignRecipe, removeRecipe, generateGroceryList } = useMealPlan(user)
  const { ingredients: pantryIngredients } = usePantry(user)
  const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek; meal: MealType } | null>(null)
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false)
  const [isGeneratingGroceryList, setIsGeneratingGroceryList] = useState(false)

  const getRecipeById = (id: string): Recipe | undefined => {
    return sampleRecipes.find(recipe => recipe.id === id)
  }

  const getAssignedRecipes = (): Recipe[] => {
    if (!currentMealPlan) return []
    
    const assignedRecipeIds = new Set<string>()
    
    DAYS.forEach(day => {
      MEAL_TYPES.forEach(meal => {
        const recipeId = currentMealPlan.meals[day.key][meal.key]
        if (recipeId) {
          assignedRecipeIds.add(recipeId)
        }
      })
    })

    return Array.from(assignedRecipeIds)
      .map(id => getRecipeById(id))
      .filter(Boolean) as Recipe[]
  }

  const handleAssignRecipe = async (recipeId: string) => {
    if (!selectedSlot) return

    try {
      await assignRecipe(selectedSlot.day, selectedSlot.meal, recipeId)
      
      // Track analytics event
      const recipe = getRecipeById(recipeId)
      if (recipe) {
        await analyticsService.trackMealPlanCreate({
          action: 'assign_recipe',
          day: selectedSlot.day,
          meal: selectedSlot.meal,
          recipeId,
          recipeTitle: recipe.title
        }, user.id)
      }
      
      setIsRecipeDialogOpen(false)
      setSelectedSlot(null)
      toast.success('Recipe assigned successfully!')
    } catch (error) {
      toast.error('Failed to assign recipe')
    }
  }

  const handleRemoveRecipe = async (day: DayOfWeek, meal: MealType) => {
    try {
      await removeRecipe(day, meal)
      toast.success('Recipe removed successfully!')
    } catch (error) {
      toast.error('Failed to remove recipe')
    }
  }

  const handleGenerateGroceryList = async () => {
    try {
      setIsGeneratingGroceryList(true)
      const assignedRecipes = getAssignedRecipes()
      
      if (assignedRecipes.length === 0) {
        toast.error('Please assign some recipes to your meal plan first')
        return
      }

      await generateGroceryList(assignedRecipes, pantryIngredients)
      toast.success('Grocery list generated successfully!')
    } catch (error) {
      toast.error('Failed to generate grocery list')
    } finally {
      setIsGeneratingGroceryList(false)
    }
  }

  const openRecipeSelector = (day: DayOfWeek, meal: MealType) => {
    setSelectedSlot({ day, meal })
    setIsRecipeDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your meal plan...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Meal Planner</h1>
          <p className="text-muted-foreground">Plan your meals for the week and generate grocery lists</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button
            onClick={handleGenerateGroceryList}
            disabled={isGeneratingGroceryList}
            className="bg-green-600 hover:bg-green-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isGeneratingGroceryList ? 'Generating...' : 'Generate Grocery List'}
          </Button>
        </div>
      </div>

      {/* Week Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-8">
        {DAYS.map(day => (
          <Card key={day.key} className="min-h-[400px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-center">
                {day.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MEAL_TYPES.map(meal => {
                const recipeId = currentMealPlan?.meals[day.key][meal.key]
                const recipe = recipeId ? getRecipeById(recipeId) : null

                return (
                  <div key={meal.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={meal.color}>
                        {meal.label}
                      </Badge>
                    </div>
                    
                    {recipe ? (
                      <Card className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm leading-tight">{recipe.title}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRecipe(day.key, meal.key)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Clock className="h-3 w-3" />
                            <span>{recipe.totalTime}min</span>
                            <Users className="h-3 w-3" />
                            <span>{recipe.servings}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {recipe.dietaryTags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-20 border-2 border-dashed border-gray-300 hover:border-primary/50 text-muted-foreground hover:text-primary"
                        onClick={() => openRecipeSelector(day.key, meal.key)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Recipe
                      </Button>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recipe Selection Dialog */}
      <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Select Recipe for {selectedSlot && `${DAYS.find(d => d.key === selectedSlot.day)?.label} ${MEAL_TYPES.find(m => m.key === selectedSlot.meal)?.label}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {sampleRecipes.map(recipe => (
              <Card key={recipe.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{recipe.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {recipe.description}
                      </p>
                    </div>
                    {recipe.imageUrl && (
                      <img 
                        src={recipe.imageUrl} 
                        alt={recipe.title}
                        className="w-16 h-16 rounded-lg object-cover ml-3"
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{recipe.totalTime}min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{recipe.servings} servings</span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {recipe.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {recipe.dietaryTags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => handleAssignRecipe(recipe.id)}
                    className="w-full"
                  >
                    Select Recipe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Weekly Summary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Week Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {getAssignedRecipes().length}
              </div>
              <div className="text-sm text-muted-foreground">Recipes Planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {DAYS.reduce((total, day) => {
                  return total + MEAL_TYPES.filter(meal => 
                    currentMealPlan?.meals[day.key][meal.key]
                  ).length
                }, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Meals Assigned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {pantryIngredients.length}
              </div>
              <div className="text-sm text-muted-foreground">Pantry Items</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}