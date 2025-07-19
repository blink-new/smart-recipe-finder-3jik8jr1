import { useState, useEffect } from 'react'
import { Heart, Clock, Users, DollarSign, Search, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { useToast } from '../hooks/use-toast'
import { useFavorites } from '../hooks/useFavorites'
import { useRatingsAndReviews } from '../hooks/useRatingsAndReviews'
import { sampleRecipes } from '../data/sampleRecipes'
import { RecipeWithRating } from '../types/recipe'
import { StarRatingDisplay } from '../components/StarRating'
import { ReviewSection } from '../components/ReviewSection'

interface SavedMealsPageProps {
  user: any
}

export function SavedMealsPage({ user }: SavedMealsPageProps) {
  const { favoriteRecipeIds, removeFromFavorites, isLoading } = useFavorites(user)
  const { getRatingStats } = useRatingsAndReviews()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithRating | null>(null)
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeWithRating[]>([])
  const { toast } = useToast()

  // Load favorite recipes with rating data
  useEffect(() => {
    const loadFavoriteRecipesWithRatings = async () => {
      try {
        const baseRecipes = sampleRecipes.filter(recipe => 
          favoriteRecipeIds.includes(recipe.id)
        )
        
        const recipesWithRatingData = await Promise.all(
          baseRecipes.map(async (recipe) => {
            const ratingStats = await getRatingStats(recipe.id)
            return {
              ...recipe,
              averageRating: ratingStats.averageRating,
              totalRatings: ratingStats.totalRatings
            } as RecipeWithRating
          })
        )
        
        setFavoriteRecipes(recipesWithRatingData)
      } catch (error) {
        console.error('Error loading favorite recipes with ratings:', error)
        // Fallback to recipes without rating data
        const fallbackRecipes = sampleRecipes
          .filter(recipe => favoriteRecipeIds.includes(recipe.id))
          .map(recipe => ({
            ...recipe,
            averageRating: 0,
            totalRatings: 0
          })) as RecipeWithRating[]
        setFavoriteRecipes(fallbackRecipes)
      }
    }

    if (favoriteRecipeIds.length > 0) {
      loadFavoriteRecipesWithRatings()
    } else {
      setFavoriteRecipes([])
    }
  }, [favoriteRecipeIds, getRatingStats])

  // Filter recipes based on search query
  const filteredRecipes = favoriteRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.dietaryTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleRemoveFromFavorites = async (recipe: RecipeWithRating) => {
    try {
      await removeFromFavorites(recipe.id)
      toast({
        title: "Recipe Removed",
        description: `${recipe.title} has been removed from your favorites.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove recipe from favorites. Please try again.",
        variant: "destructive"
      })
    }
  }

  const viewRecipe = (recipe: RecipeWithRating) => {
    setSelectedRecipe(recipe)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Favorite Recipes</h1>
        <p className="text-muted-foreground">
          Your saved recipes collection - {favoriteRecipes.length} recipe{favoriteRecipes.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {favoriteRecipes.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No favorite recipes yet</h3>
          <p className="text-muted-foreground mb-6">
            Start exploring recipes and save your favorites to see them here.
          </p>
          <Button onClick={() => window.location.hash = 'discovery'}>
            <Search className="h-4 w-4 mr-2" />
            Discover Recipes
          </Button>
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search your favorite recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className="bg-primary/90">
                      <Heart className="h-3 w-3 mr-1 fill-current" />
                      Saved
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
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {recipe.dietaryTags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {recipe.dietaryTags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{recipe.dietaryTags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="flex-1" 
                          size="sm"
                          onClick={() => viewRecipe(recipe)}
                        >
                          View Recipe
                        </Button>
                      </DialogTrigger>
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
                                      <span className="text-sm">
                                        {ingredient.amount} {ingredient.name}
                                      </span>
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
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">Nutrition (per serving)</h3>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                      <p className="text-lg font-bold">{selectedRecipe.nutritionInfo.calories}</p>
                                      <p className="text-xs text-muted-foreground">Calories</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-lg font-bold">{selectedRecipe.nutritionInfo.protein}g</p>
                                      <p className="text-xs text-muted-foreground">Protein</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-lg font-bold">{selectedRecipe.nutritionInfo.carbs}g</p>
                                      <p className="text-xs text-muted-foreground">Carbs</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-lg font-bold">{selectedRecipe.nutritionInfo.fat}g</p>
                                      <p className="text-xs text-muted-foreground">Fat</p>
                                    </div>
                                  </div>
                                </div>
                              )}

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
                    
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFromFavorites(recipe)}
                      className="hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRecipes.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
              <p className="text-muted-foreground mb-4">
                No favorite recipes match your search for "{searchQuery}".
              </p>
              <Button 
                variant="outline"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}