import { NutritionInfo } from '../types/recipe'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Activity, Zap, Wheat, Droplets } from 'lucide-react'

interface NutritionDisplayProps {
  nutrition: NutritionInfo
  servings?: number
  showTitle?: boolean
  variant?: 'card' | 'inline' | 'compact'
  className?: string
}

export function NutritionDisplay({ 
  nutrition, 
  servings = 1, 
  showTitle = true, 
  variant = 'card',
  className = '' 
}: NutritionDisplayProps) {
  const nutritionItems = [
    {
      label: 'Calories',
      value: nutrition.calories,
      unit: '',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Protein',
      value: nutrition.protein,
      unit: 'g',
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Carbs',
      value: nutrition.carbs,
      unit: 'g',
      icon: Wheat,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      label: 'Fat',
      value: nutrition.fat,
      unit: 'g',
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ]

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-4 text-sm ${className}`}>
        {nutritionItems.map((item) => (
          <div key={item.label} className="flex items-center space-x-1">
            <item.icon className={`h-3 w-3 ${item.color}`} />
            <span className="font-medium">{item.value}{item.unit}</span>
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`space-y-2 ${className}`}>
        {showTitle && (
          <h4 className="text-sm font-medium text-foreground">
            Nutrition per serving
            <span className="text-xs text-muted-foreground ml-1">
              (estimated values)
            </span>
          </h4>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {nutritionItems.map((item) => (
            <div key={item.label} className="text-center">
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${item.bgColor} mb-1`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <p className="text-lg font-bold text-foreground">{item.value}{item.unit}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
        
        {/* Additional nutrition info if available */}
        {(nutrition.fiber || nutrition.sugar) && (
          <div className="pt-2 border-t border-border">
            <div className="flex justify-center space-x-6 text-xs text-muted-foreground">
              {nutrition.fiber && (
                <span>Fiber: {nutrition.fiber}g</span>
              )}
              {nutrition.sugar && (
                <span>Sugar: {nutrition.sugar}g</span>
              )}
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground text-center pt-1">
          <p>* Nutritional values are estimated based on standard ingredient profiles</p>
        </div>
      </div>
    )
  }

  // Card variant (default)
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Activity className="h-5 w-5 mr-2 text-primary" />
          Nutrition Information
          <Badge variant="secondary" className="ml-2 text-xs">
            Per serving
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {nutritionItems.map((item) => (
            <div key={item.label} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${item.bgColor} mb-2`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{item.value}{item.unit}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
        
        {/* Additional nutrition info if available */}
        {(nutrition.fiber || nutrition.sugar) && (
          <div className="pt-3 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-center">
              {nutrition.fiber && (
                <div>
                  <p className="text-lg font-semibold">{nutrition.fiber}g</p>
                  <p className="text-xs text-muted-foreground">Fiber</p>
                </div>
              )}
              {nutrition.sugar && (
                <div>
                  <p className="text-lg font-semibold">{nutrition.sugar}g</p>
                  <p className="text-xs text-muted-foreground">Sugar</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground text-center pt-3 border-t border-border">
          <p>* Nutritional values are estimated based on standard ingredient profiles</p>
          {servings > 1 && (
            <p className="mt-1">Recipe makes {servings} servings</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Quick nutrition summary for recipe cards
export function NutritionSummary({ nutrition, className = '' }: { nutrition: NutritionInfo, className?: string }) {
  return (
    <div className={`flex items-center justify-between text-xs text-muted-foreground ${className}`}>
      <div className="flex items-center space-x-3">
        <span className="flex items-center">
          <Zap className="h-3 w-3 mr-1 text-orange-600" />
          {nutrition.calories} cal
        </span>
        <span className="flex items-center">
          <Activity className="h-3 w-3 mr-1 text-red-600" />
          {nutrition.protein}g protein
        </span>
      </div>
      <div className="flex items-center space-x-3">
        <span className="flex items-center">
          <Wheat className="h-3 w-3 mr-1 text-amber-600" />
          {nutrition.carbs}g carbs
        </span>
        <span className="flex items-center">
          <Droplets className="h-3 w-3 mr-1 text-blue-600" />
          {nutrition.fat}g fat
        </span>
      </div>
    </div>
  )
}