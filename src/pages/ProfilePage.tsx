import { useState, useEffect } from 'react'
import { User, Settings, Clock, DollarSign, Heart, TrendingUp } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Checkbox } from '../components/ui/checkbox'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import { UserPreferences } from '../types/recipe'
import { NutritionEnhancer } from '../components/NutritionEnhancer'

interface ProfilePageProps {
  user: any
}

export function ProfilePage({ user: userProp }: ProfilePageProps) {
  const [user, setUser] = useState<any>(null)
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    dietaryPreferences: [],
    cookingTimePreference: 30,
    budgetPreference: 'medium',
    allergies: [],
    favoriteCuisines: []
  })
  const [stats, setStats] = useState({
    recipesViewed: 24,
    recipesSaved: 8,
    avgCookingTime: 25,
    favoriteCategory: 'Quick & Easy'
  })
  const { toast } = useToast()

  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'keto', 'high-protein', 'low-carb', 'dairy-free']
  const allergyOptions = ['nuts', 'dairy', 'eggs', 'soy', 'shellfish', 'fish', 'wheat', 'sesame']
  const cuisineOptions = ['italian', 'mexican', 'asian', 'mediterranean', 'american', 'indian', 'french', 'thai']

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await blink.auth.me()
        setUser(userData)
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
    }

    fetchUserData()
  }, [])

  const handleDietaryChange = (dietary: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      dietaryPreferences: checked
        ? [...(prev.dietaryPreferences || []), dietary]
        : (prev.dietaryPreferences || []).filter(d => d !== dietary)
    }))
  }

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      allergies: checked
        ? [...(prev.allergies || []), allergy]
        : (prev.allergies || []).filter(a => a !== allergy)
    }))
  }

  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      favoriteCuisines: checked
        ? [...(prev.favoriteCuisines || []), cuisine]
        : (prev.favoriteCuisines || []).filter(c => c !== cuisine)
    }))
  }

  const savePreferences = async () => {
    try {
      // This would normally save to database
      console.log('Saving preferences:', preferences)
      
      toast({
        title: "Preferences Saved!",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile & Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and customize your recipe recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info & Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-semibold">{user?.email?.split('@')[0] || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Member since {new Date().toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Recipes Viewed</span>
                <span className="font-semibold">{stats.recipesViewed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Recipes Saved</span>
                <span className="font-semibold">{stats.recipesSaved}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Cooking Time</span>
                <span className="font-semibold">{stats.avgCookingTime}min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Favorite Category</span>
                <span className="font-semibold text-xs">{stats.favoriteCategory}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Nutrition Enhancement Tool */}
          <NutritionEnhancer />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Recipe Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Cooking Time Preference */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Maximum Cooking Time
                </label>
                <Select 
                  value={preferences.cookingTimePreference?.toString()} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, cookingTimePreference: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select max cooking time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="999">No limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Budget Preference */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  Budget Preference
                </label>
                <Select 
                  value={preferences.budgetPreference} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, budgetPreference: value as 'low' | 'medium' | 'high' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Budget</SelectItem>
                    <SelectItem value="medium">Medium Budget</SelectItem>
                    <SelectItem value="high">High Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dietary Preferences */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  <Heart className="h-4 w-4 inline mr-2" />
                  Dietary Preferences
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dietaryOptions.map((dietary) => (
                    <div key={dietary} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dietary-${dietary}`}
                        checked={preferences.dietaryPreferences?.includes(dietary) || false}
                        onCheckedChange={(checked) => handleDietaryChange(dietary, checked as boolean)}
                      />
                      <label htmlFor={`dietary-${dietary}`} className="text-sm">
                        {dietary.charAt(0).toUpperCase() + dietary.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="text-sm font-medium mb-3 block">Allergies & Restrictions</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {allergyOptions.map((allergy) => (
                    <div key={allergy} className="flex items-center space-x-2">
                      <Checkbox
                        id={`allergy-${allergy}`}
                        checked={preferences.allergies?.includes(allergy) || false}
                        onCheckedChange={(checked) => handleAllergyChange(allergy, checked as boolean)}
                      />
                      <label htmlFor={`allergy-${allergy}`} className="text-sm">
                        {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Favorite Cuisines */}
              <div>
                <label className="text-sm font-medium mb-3 block">Favorite Cuisines</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {cuisineOptions.map((cuisine) => (
                    <div key={cuisine} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cuisine-${cuisine}`}
                        checked={preferences.favoriteCuisines?.includes(cuisine) || false}
                        onCheckedChange={(checked) => handleCuisineChange(cuisine, checked as boolean)}
                      />
                      <label htmlFor={`cuisine-${cuisine}`} className="text-sm">
                        {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t">
                <Button onClick={savePreferences} className="w-full md:w-auto">
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}