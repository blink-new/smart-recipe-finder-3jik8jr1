import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Alert, AlertDescription } from './ui/alert'
import { Zap, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { Recipe } from '../types/recipe'
import { enhanceRecipesWithNutrition, getNutritionStats } from '../utils/enhanceRecipesWithNutrition'
import { sampleRecipes } from '../data/sampleRecipes'

interface NutritionEnhancerProps {
  onRecipesUpdated?: (recipes: Recipe[]) => void
  className?: string
}

export function NutritionEnhancer({ onRecipesUpdated, className = '' }: NutritionEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'enhancing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState(getNutritionStats(sampleRecipes))

  const handleEnhanceRecipes = async () => {
    setIsEnhancing(true)
    setStatus('enhancing')
    setProgress(0)
    setMessage('Starting nutrition enhancement...')

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10
          if (newProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return newProgress
        })
      }, 200)

      setMessage('Calculating nutritional information using Spoonacular API...')
      
      const enhancedRecipes = await enhanceRecipesWithNutrition(sampleRecipes)
      
      clearInterval(progressInterval)
      setProgress(100)
      
      // Update stats
      const newStats = getNutritionStats(enhancedRecipes)
      setStats(newStats)
      
      setStatus('success')
      setMessage(`Successfully enhanced ${newStats.recipesWithNutrition} recipes with nutritional information!`)
      
      // Notify parent component
      if (onRecipesUpdated) {
        onRecipesUpdated(enhancedRecipes)
      }
      
    } catch (error) {
      setStatus('error')
      setMessage(`Enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setProgress(0)
    } finally {
      setIsEnhancing(false)
    }
  }

  const resetStatus = () => {
    setStatus('idle')
    setMessage('')
    setProgress(0)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 mr-2 text-primary" />
          Recipe Nutrition Enhancement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.totalRecipes}</p>
            <p className="text-xs text-muted-foreground">Total Recipes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.recipesWithNutrition}</p>
            <p className="text-xs text-muted-foreground">With Nutrition</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.averageCalories}</p>
            <p className="text-xs text-muted-foreground">Avg Calories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.averageProtein}g</p>
            <p className="text-xs text-muted-foreground">Avg Protein</p>
          </div>
        </div>

        {/* Enhancement Status */}
        {status !== 'idle' && (
          <Alert className={`${
            status === 'success' ? 'border-green-200 bg-green-50' :
            status === 'error' ? 'border-red-200 bg-red-50' :
            'border-blue-200 bg-blue-50'
          }`}>
            <div className="flex items-center">
              {status === 'enhancing' && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
              {status === 'success' && <CheckCircle className="h-4 w-4 text-green-600 mr-2" />}
              {status === 'error' && <AlertCircle className="h-4 w-4 text-red-600 mr-2" />}
              <AlertDescription>{message}</AlertDescription>
            </div>
          </Alert>
        )}

        {/* Progress Bar */}
        {isEnhancing && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-center text-muted-foreground">
              {progress}% complete
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            onClick={handleEnhanceRecipes}
            disabled={isEnhancing}
            className="flex-1"
          >
            {isEnhancing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Enhance with Nutrition
              </>
            )}
          </Button>
          
          {status !== 'idle' && (
            <Button 
              variant="outline" 
              onClick={resetStatus}
              disabled={isEnhancing}
            >
              Reset
            </Button>
          )}
        </div>

        {/* API Info */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Nutrition Data Source</p>
              <p className="text-xs text-muted-foreground">Spoonacular Food API</p>
            </div>
            <Badge variant="secondary">API Integration</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Nutritional values are calculated based on standard ingredient profiles and may vary from actual values.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}