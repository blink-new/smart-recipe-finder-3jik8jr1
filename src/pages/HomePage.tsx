import { useState, useEffect } from 'react'
import { Search, Clock, DollarSign, Heart, TrendingUp, ChefHat, Plus, Calendar } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { usePantry } from '../hooks/usePantry'
import { useFavorites } from '../hooks/useFavorites'
import { sampleRecipes } from '../data/sampleRecipes'
import { Recipe } from '../types/recipe'
import { AppPage, User } from '../App'
import { FeaturePoll } from '../components/FeaturePoll'

interface HomePageProps {
  user: User
  onNavigate: (page: AppPage) => void
  blink: any
}

export function HomePage({ user, onNavigate, blink }: HomePageProps) {
  const { ingredients, pantryItems } = usePantry(user)
  const { favoriteRecipeIds } = useFavorites(user)
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([])
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    // Get featured recipes (first 3 from sample data)
    setFeaturedRecipes(sampleRecipes.slice(0, 3))
    
    // Get recommended recipes based on pantry ingredients
    if (ingredients.length > 0) {
      const recommended = sampleRecipes
        .filter(recipe => 
          recipe.requiredIngredients.some(ingredient =>
            ingredients.some(pantryItem =>
              ingredient.toLowerCase().includes(pantryItem.toLowerCase()) ||
              pantryItem.toLowerCase().includes(ingredient.toLowerCase())
            )
          )
        )
        .slice(0, 4)
      setRecommendedRecipes(recommended)
    }
  }, [ingredients])

  const stats = {
    totalRecipes: sampleRecipes.length,
    savedMeals: favoriteRecipeIds.length,
    pantryItems: pantryItems.length,
    avgCookTime: Math.round(
      sampleRecipes.reduce((sum, recipe) => sum + recipe.totalTime, 0) / sampleRecipes.length
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
          Welcome back, <span className="text-primary">{user?.displayName || user?.email?.split('@')[0] || 'Chef'}</span>!
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Ready to cook something amazing? Let's turn your pantry ingredients into delicious meals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-lg px-8 py-6" onClick={() => onNavigate('discovery')}>
            <Search className="mr-2 h-5 w-5" />
            Discover Recipes
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-6" onClick={() => onNavigate('planner')}>
            <Calendar className="mr-2 h-5 w-5" />
            Plan Meals
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-6" onClick={() => onNavigate('saved')}>
            <Heart className="mr-2 h-5 w-5" />
            My Favorites
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-primary/10 rounded-lg mr-3">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats.totalRecipes}</p>
              <p className="text-xs text-muted-foreground">Recipes Available</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-accent/10 rounded-lg mr-3">
              <Heart className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats.savedMeals}</p>
              <p className="text-xs text-muted-foreground">Saved Meals</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <ChefHat className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats.pantryItems}</p>
              <p className="text-xs text-muted-foreground">Pantry Items</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats.avgCookTime}min</p>
              <p className="text-xs text-muted-foreground">Avg Cook Time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pantry Quick View */}
      {ingredients.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Your Pantry</h2>
            <Button variant="outline" size="sm" onClick={() => onNavigate('discovery')}>
              <Plus className="h-4 w-4 mr-2" />
              Add More
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {ingredients.slice(0, 10).map((ingredient) => (
                  <Badge key={ingredient} variant="secondary" className="text-sm">
                    {ingredient}
                  </Badge>
                ))}
                {ingredients.length > 10 && (
                  <Badge variant="outline" className="text-sm">
                    +{ingredients.length - 10} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommended Recipes Based on Pantry */}
      {recommendedRecipes.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Recommended for You</h2>
              <p className="text-muted-foreground">Based on your pantry ingredients</p>
            </div>
            <Button variant="outline" onClick={() => onNavigate('discovery')}>View All</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedRecipes.map((recipe) => (
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
                  {favoriteRecipeIds.includes(recipe.id) && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" className="bg-primary/90">
                        <Heart className="h-3 w-3 mr-1 fill-current" />
                        Saved
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-base leading-tight">{recipe.title}</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {recipe.totalTime}min
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {recipe.budgetLevel}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {recipe.dietaryTags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button className="w-full" size="sm" onClick={() => onNavigate('discovery')}>
                    View Recipe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Featured Recipes */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Featured Recipes</h2>
          <Button variant="outline" onClick={() => onNavigate('discovery')}>View All</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredRecipes.map((recipe) => (
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
                {favoriteRecipeIds.includes(recipe.id) && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className="bg-primary/90">
                      <Heart className="h-3 w-3 mr-1 fill-current" />
                      Saved
                    </Badge>
                  </div>
                )}
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
                    <DollarSign className="h-4 w-4 mr-1" />
                    {recipe.budgetLevel}
                  </div>
                </div>
                
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
                
                <Button className="w-full" size="sm" onClick={() => onNavigate('discovery')}>
                  View Recipe
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Search className="h-8 w-8 text-primary mr-3" />
            <div>
              <h3 className="text-xl font-semibold">Discover New Recipes</h3>
              <p className="text-muted-foreground">Find recipes based on your pantry</p>
            </div>
          </div>
          <Button className="w-full" onClick={() => onNavigate('discovery')}>Start Discovering</Button>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="text-xl font-semibold">Weekly Meal Planner</h3>
              <p className="text-muted-foreground">Plan your meals and generate grocery lists</p>
            </div>
          </div>
          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => onNavigate('planner')}>Plan Your Week</Button>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Heart className="h-8 w-8 text-accent mr-3" />
            <div>
              <h3 className="text-xl font-semibold">My Favorite Recipes</h3>
              <p className="text-muted-foreground">Access your saved recipes</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => onNavigate('saved')}>View Favorites</Button>
        </Card>
      </div>

      {/* Feature Poll */}
      <div className="mt-12">
        <FeaturePoll userId={user.id} blink={blink} />
      </div>
    </div>
  )
}