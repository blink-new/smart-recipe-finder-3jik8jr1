import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Clock, DollarSign, Users, Heart, ShoppingCart, Star, Plus, X } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Checkbox } from '../components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { useToast } from '../hooks/use-toast'
import { usePantry } from '../hooks/usePantry'
import { useFavorites } from '../hooks/useFavorites'
import { useRatingsAndReviews } from '../hooks/useRatingsAndReviews'
import { sampleRecipes, commonIngredients } from '../data/sampleRecipes'
import { RecipeWithRating } from '../types/recipe'
import { StarRatingDisplay } from '../components/StarRating'
import { ReviewSection } from '../components/ReviewSection'
import { NutritionDisplay, NutritionSummary } from '../components/NutritionDisplay'
import { RecipeFeedback } from '../components/RecipeFeedback'
import { analyticsService } from '../services/analyticsService'
import { FeaturePoll } from '../components/FeaturePoll'

interface RecipeDiscoveryPageProps {
  user: any
}

export function RecipeDiscoveryPage({ user }: RecipeDiscoveryPageProps) {
  const { ingredients, addIngredient, removeIngredient, isLoading: pantryLoading } = usePantry(user)
  const { isFavorite, toggleFavorite } = useFavorites(user)
  const { getRatingStats } = useRatingsAndReviews()
  const [customIngredient, setCustomIngredient] = useState('')
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeWithRating[]>([])
  const [recipesWithRatings, setRecipesWithRatings] = useState<RecipeWithRating[]>([])
  const [filters, setFilters] = useState({
    maxTime: 'any',
    budget: 'any',
    dietary: [] as string[],
    difficulty: 'any'
  })
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithRating | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'keto', 'high-protein']
  const budgetOptions = ['low', 'medium', 'high']
  const difficultyOptions = ['easy', 'medium', 'hard']

  // Load recipes with rating data
  useEffect(() => {
    const loadRecipesWithRatings = async () => {
      try {
        const recipesWithRatingData = await Promise.all(
          sampleRecipes.map(async (recipe) => {
            const ratingStats = await getRatingStats(recipe.id)
            return {
              ...recipe,
              averageRating: ratingStats.averageRating,
              totalRatings: ratingStats.totalRatings
            } as RecipeWithRating
          })
        )
        setRecipesWithRatings(recipesWithRatingData)
        setFilteredRecipes(recipesWithRatingData)
      } catch (error) {
        console.error('Error loading recipes with ratings:', error)
        // Fallback to recipes without rating data
        const fallbackRecipes = sampleRecipes.map(recipe => ({
          ...recipe,
          averageRating: 0,
          totalRatings: 0
        })) as RecipeWithRating[]
        setRecipesWithRatings(fallbackRecipes)
        setFilteredRecipes(fallbackRecipes)
      }
    }

    loadRecipesWithRatings()
  }, [getRatingStats])

  const filterRecipes = useCallback(() => {
    let filtered = recipesWithRatings

    // Filter by ingredients
    if (ingredients.length > 0) {
      filtered = filtered.filter(recipe => {
        const matchingIngredients = recipe.requiredIngredients.filter(ingredient =>
          ingredients.some(selected => 
            ingredient.toLowerCase().includes(selected.toLowerCase()) ||
            selected.toLowerCase().includes(ingredient.toLowerCase())
          )
        )
        return matchingIngredients.length > 0
      })
    }

    // Filter by time
    if (filters.maxTime && filters.maxTime !== 'any') {
      filtered = filtered.filter(recipe => recipe.totalTime <= parseInt(filters.maxTime))
    }

    // Filter by budget
    if (filters.budget && filters.budget !== 'any') {
      filtered = filtered.filter(recipe => recipe.budgetLevel === filters.budget)
    }

    // Filter by dietary preferences
    if (filters.dietary.length > 0) {
      filtered = filtered.filter(recipe =>
        filters.dietary.some(diet => recipe.dietaryTags.includes(diet))
      )
    }

    // Filter by difficulty
    if (filters.difficulty && filters.difficulty !== 'any') {
      filtered = filtered.filter(recipe => recipe.difficulty === filters.difficulty)
    }

    // Sort by ingredient match score, then by rating
    if (ingredients.length > 0) {
      filtered.sort((a, b) => {
        const aMatches = a.requiredIngredients.filter(ingredient =>
          ingredients.some(selected => 
            ingredient.toLowerCase().includes(selected.toLowerCase())
          )
        ).length
        const bMatches = b.requiredIngredients.filter(ingredient =>
          ingredients.some(selected => 
            ingredient.toLowerCase().includes(selected.toLowerCase())
          )
        ).length
        
        // Primary sort by ingredient matches
        if (bMatches !== aMatches) {
          return bMatches - aMatches
        }
        
        // Secondary sort by rating (higher ratings first)
        return (b.averageRating || 0) - (a.averageRating || 0)
      })
    } else {
      // Sort by rating when no ingredients are selected
      filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    }

    setFilteredRecipes(filtered)
  }, [ingredients, filters, recipesWithRatings])

  useEffect(() => {
    filterRecipes()
  }, [filterRecipes])

  const handleDietaryChange = (dietary: string, checked: boolean) => {
    if (checked) {
      setFilters(prev => ({ ...prev, dietary: [...prev.dietary, dietary] }))
    } else {
      setFilters(prev => ({ ...prev, dietary: prev.dietary.filter(d => d !== dietary) }))
    }
  }

  const handleAddIngredient = async (ingredient: string) => {
    if (!ingredient.trim()) return
    
    try {
      await addIngredient(ingredient)
      
      // Track analytics event
      await analyticsService.trackPantryEdit('add', ingredient, user.id)
      
      setCustomIngredient('')
      toast({
        title: "Ingredient Added",
        description: `${ingredient} has been added to your pantry.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add ingredient. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleRemoveIngredient = async (ingredient: string) => {
    try {
      await removeIngredient(ingredient)
      
      // Track analytics event
      await analyticsService.trackPantryEdit('remove', ingredient, user.id)
      
      toast({
        title: "Ingredient Removed",
        description: `${ingredient} has been removed from your pantry.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove ingredient. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleToggleFavorite = async (recipe: RecipeWithRating) => {
    try {
      const wasFavorite = isFavorite(recipe.id)
      await toggleFavorite(recipe.id)
      
      // Track analytics event
      const action = wasFavorite ? 'remove' : 'add'
      await analyticsService.trackRecipeFavorite(action, recipe.id, recipe.title, user.id)
      
      const actionText = wasFavorite ? 'removed from' : 'added to'
      toast({
        title: `Recipe ${actionText} favorites`,
        description: `${recipe.title} has been ${actionText} your favorites.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      })
    }
  }

  const generateGroceryList = async (recipe: RecipeWithRating) => {
    try {
      const missingIngredients = recipe.ingredients.filter(ingredient =>
        !ingredients.some(selected =>
          ingredient.name.toLowerCase().includes(selected.toLowerCase())
        )
      )

      toast({
        title: "Grocery List Generated!",
        description: `Added ${missingIngredients.length} missing ingredients to your grocery list.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate grocery list. Please try again.",
        variant: "destructive"
      })
    }
  }

  const viewRecipe = async (recipe: RecipeWithRating) => {
    setSelectedRecipe(recipe)
    setIsDialogOpen(true)
    
    // Track analytics event
    await analyticsService.trackRecipeView(recipe.id, recipe.title, user.id)
  }

  if (pantryLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Discover Recipes</h1>
        <p className="text-muted-foreground">
          Enter your available ingredients and find perfect recipes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ingredients Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">Your Pantry Ingredients</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add ingredient..."
                      value={customIngredient}
                      onChange={(e) => setCustomIngredient(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient(customIngredient)}
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleAddIngredient(customIngredient)}
                      disabled={!customIngredient.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Select onValueChange={handleAddIngredient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Common ingredients" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonIngredients.map((ingredient) => (
                        <SelectItem key={ingredient} value={ingredient}>
                          {ingredient}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Ingredients */}
                {ingredients.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Your Pantry ({ingredients.length} items):</p>
                    <div className="flex flex-wrap gap-1">
                      {ingredients.map((ingredient) => (
                        <Badge
                          key={ingredient}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          onClick={() => handleRemoveIngredient(ingredient)}
                        >
                          {ingredient} <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Time Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Max Cooking Time</label>
                <Select value={filters.maxTime} onValueChange={(value) => setFilters(prev => ({ ...prev, maxTime: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any time</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Budget Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Budget</label>
                <Select value={filters.budget} onValueChange={(value) => setFilters(prev => ({ ...prev, budget: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any budget</SelectItem>
                    {budgetOptions.map((budget) => (
                      <SelectItem key={budget} value={budget}>
                        {budget.charAt(0).toUpperCase() + budget.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dietary Preferences */}
              <div>
                <label className="text-sm font-medium mb-2 block">Dietary Preferences</label>
                <div className="space-y-2">
                  {dietaryOptions.map((dietary) => (
                    <div key={dietary} className="flex items-center space-x-2">
                      <Checkbox
                        id={dietary}
                        checked={filters.dietary.includes(dietary)}
                        onCheckedChange={(checked) => handleDietaryChange(dietary, checked as boolean)}
                      />
                      <label htmlFor={dietary} className="text-sm">
                        {dietary.charAt(0).toUpperCase() + dietary.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any difficulty</SelectItem>
                    {difficultyOptions.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recipe Results */}
        <div className="lg:col-span-3">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {filteredRecipes.length} Recipe{filteredRecipes.length !== 1 ? 's' : ''} Found
              </h2>
              {ingredients.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Showing recipes with your pantry ingredients
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  {recipe.imageUrl ? (
                    <img 
                      src={recipe.imageUrl} 
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-white/90">
                      {recipe.difficulty}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg">{recipe.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipe.description}
                  </p>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {recipe.totalTime}min
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {recipe.servings}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {recipe.budgetLevel}
                    </div>
                  </div>
                  
                  {/* Rating Display */}
                  {recipe.totalRatings && recipe.totalRatings > 0 ? (
                    <div className="mb-4">
                      <StarRatingDisplay 
                        rating={recipe.averageRating || 0} 
                        totalRatings={recipe.totalRatings}
                        size="sm"
                        showText={true}
                      />
                    </div>
                  ) : (
                    <div className="mb-4 text-xs text-muted-foreground">
                      No ratings yet
                    </div>
                  )}

                  {/* Nutrition Summary */}
                  {recipe.nutritionInfo && (
                    <div className="mb-4">
                      <NutritionSummary nutrition={recipe.nutritionInfo} />
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {recipe.dietaryTags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {recipe.dietaryTags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{recipe.dietaryTags.length - 2}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1" 
                      size="sm"
                      onClick={() => viewRecipe(recipe)}
                    >
                      View Recipe
                    </Button>
                    
                    <Button 
                      variant={isFavorite(recipe.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleFavorite(recipe)}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite(recipe.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRecipes.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your ingredients or filters to find more recipes.
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setFilters({ maxTime: 'any', budget: 'any', dietary: [], difficulty: 'any' })
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Feature Poll */}
      <div className="mt-12">
        <FeaturePoll userId={user.id} />
      </div>

      {/* Recipe Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedRecipe.title}</DialogTitle>
              </DialogHeader>
              
              <div className="mt-6 space-y-6">
                {selectedRecipe.imageUrl && (
                  <img 
                    src={selectedRecipe.imageUrl} 
                    alt={selectedRecipe.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Clock className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <p className="text-sm font-medium">{selectedRecipe.totalTime} min</p>
                    <p className="text-xs text-muted-foreground">Total Time</p>
                  </div>
                  <div className="text-center">
                    <Users className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <p className="text-sm font-medium">{selectedRecipe.servings}</p>
                    <p className="text-xs text-muted-foreground">Servings</p>
                  </div>
                  <div className="text-center">
                    <DollarSign className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <p className="text-sm font-medium">{selectedRecipe.budgetLevel}</p>
                    <p className="text-xs text-muted-foreground">Budget</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="mx-auto">
                      {selectedRecipe.difficulty}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">Difficulty</p>
                  </div>
                </div>

                {/* Rating Display in Modal */}
                {selectedRecipe.totalRatings && selectedRecipe.totalRatings > 0 && (
                  <div className="text-center">
                    <StarRatingDisplay 
                      rating={selectedRecipe.averageRating || 0} 
                      totalRatings={selectedRecipe.totalRatings}
                      size="md"
                      showText={true}
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`ingredient-${index}`}
                          defaultChecked={ingredients.some(selected =>
                            ingredient.name.toLowerCase().includes(selected.toLowerCase())
                          )}
                        />
                        <label htmlFor={`ingredient-${index}`} className="text-sm">
                          {ingredient.amount} {ingredient.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    {selectedRecipe.instructions.map((step, index) => (
                      <li key={index} className="flex space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-sm">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                {selectedRecipe.nutritionInfo && (
                  <NutritionDisplay 
                    nutrition={selectedRecipe.nutritionInfo}
                    servings={selectedRecipe.servings}
                    variant="inline"
                  />
                )}

                <div className="flex space-x-3 pt-4 border-t">
                  <Button 
                    onClick={() => handleToggleFavorite(selectedRecipe)}
                    variant={isFavorite(selectedRecipe.id) ? "default" : "outline"}
                    className="flex-1"
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isFavorite(selectedRecipe.id) ? 'fill-current' : ''}`} />
                    {isFavorite(selectedRecipe.id) ? 'Saved' : 'Save Recipe'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => generateGroceryList(selectedRecipe)}
                    className="flex-1"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Grocery List
                  </Button>
                </div>

                {/* Recipe Feedback Section */}
                <div className="pt-4 border-t">
                  <RecipeFeedback 
                    recipeId={selectedRecipe.id}
                    recipeTitle={selectedRecipe.title}
                    userId={user.id}
                  />
                </div>

                {/* Reviews and Rating Section */}
                <div className="pt-4 border-t">
                  <ReviewSection 
                    recipeId={selectedRecipe.id}
                    recipeTitle={selectedRecipe.title}
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}