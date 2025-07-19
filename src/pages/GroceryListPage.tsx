import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, Plus, Check, X, Trash2, Calendar, RefreshCw } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Checkbox } from '../components/ui/checkbox'
import { Badge } from '../components/ui/badge'
import { toast } from 'sonner'
import { blink } from '../blink/client'
import { GroceryListItem } from '../types/mealPlan'
import { User } from '../App'

interface GroceryListPageProps {
  user: User
}

export function GroceryListPage({ user }: GroceryListPageProps) {
  const [groceryItems, setGroceryItems] = useState<GroceryListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newItemName, setNewItemName] = useState('')
  const [newItemAmount, setNewItemAmount] = useState('')

  const loadGroceryItems = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      const items = await blink.db.groceryListItems.list({
        where: { userId: user.id },
        orderBy: { addedAt: 'desc' }
      })
      setGroceryItems(items)
    } catch (error) {
      console.error('Failed to load grocery items:', error)
      toast.error('Failed to load grocery list')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadGroceryItems()
  }, [loadGroceryItems])

  const addCustomItem = async () => {
    if (!newItemName.trim() || !user?.id) return

    try {
      const newItem: GroceryListItem = {
        id: `grocery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        ingredient: newItemName.trim(),
        amount: newItemAmount.trim() || '1',
        unit: '',
        recipeId: 'custom',
        recipeName: 'Custom Item',
        isChecked: false,
        addedAt: new Date().toISOString()
      }

      await blink.db.groceryListItems.create(newItem)
      setGroceryItems(prev => [newItem, ...prev])
      setNewItemName('')
      setNewItemAmount('')
      toast.success('Item added to grocery list')
    } catch (error) {
      console.error('Failed to add item:', error)
      toast.error('Failed to add item')
    }
  }

  const toggleItem = async (itemId: string, currentChecked: boolean) => {
    try {
      const newCheckedState = currentChecked ? 0 : 1
      await blink.db.groceryListItems.update(itemId, {
        isChecked: newCheckedState
      })

      setGroceryItems(prev => prev.map(item =>
        item.id === itemId 
          ? { ...item, isChecked: newCheckedState }
          : item
      ))
    } catch (error) {
      console.error('Failed to toggle item:', error)
      toast.error('Failed to update item')
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      await blink.db.groceryListItems.delete(itemId)
      setGroceryItems(prev => prev.filter(item => item.id !== itemId))
      toast.success('Item removed from grocery list')
    } catch (error) {
      console.error('Failed to remove item:', error)
      toast.error('Failed to remove item')
    }
  }

  const clearCheckedItems = async () => {
    try {
      const checkedItems = groceryItems.filter(item => Number(item.isChecked) > 0)
      
      for (const item of checkedItems) {
        await blink.db.groceryListItems.delete(item.id)
      }

      setGroceryItems(prev => prev.filter(item => Number(item.isChecked) === 0))
      toast.success(`Removed ${checkedItems.length} completed items`)
    } catch (error) {
      console.error('Failed to clear checked items:', error)
      toast.error('Failed to clear completed items')
    }
  }

  const clearAllItems = async () => {
    try {
      for (const item of groceryItems) {
        await blink.db.groceryListItems.delete(item.id)
      }

      setGroceryItems([])
      toast.success('Grocery list cleared')
    } catch (error) {
      console.error('Failed to clear grocery list:', error)
      toast.error('Failed to clear grocery list')
    }
  }

  // Group items by recipe
  const groupedItems = groceryItems.reduce((groups, item) => {
    const key = item.recipeId === 'custom' ? 'Custom Items' : item.recipeName
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {} as Record<string, GroceryListItem[]>)

  const totalItems = groceryItems.length
  const checkedItems = groceryItems.filter(item => Number(item.isChecked) > 0).length
  const completionPercentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your grocery list...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grocery List</h1>
          <p className="text-muted-foreground">
            Your shopping list generated from meal plans and custom items
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={loadGroceryItems}
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {checkedItems > 0 && (
            <Button
              variant="outline"
              onClick={clearCheckedItems}
              size="sm"
            >
              Clear Completed
            </Button>
          )}
          {totalItems > 0 && (
            <Button
              variant="outline"
              onClick={clearAllItems}
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      {totalItems > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Shopping Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {checkedItems} of {totalItems} items completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Custom Item */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Add Custom Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Item name..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
              className="flex-1"
            />
            <Input
              placeholder="Amount"
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
              className="w-32"
            />
            <Button 
              onClick={addCustomItem}
              disabled={!newItemName.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grocery Items */}
      {totalItems > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([recipeName, items]) => (
            <Card key={recipeName}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {recipeName === 'Custom Items' ? (
                      <Plus className="h-5 w-5" />
                    ) : (
                      <Calendar className="h-5 w-5" />
                    )}
                    {recipeName}
                  </CardTitle>
                  <Badge variant="secondary">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item) => {
                    const isChecked = Number(item.isChecked) > 0
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                          isChecked ? 'bg-muted/50 border-muted' : 'bg-background hover:bg-muted/30'
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleItem(item.id, isChecked)}
                        />
                        <div className="flex-1">
                          <span className={`font-medium ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                            {item.ingredient}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-sm ${isChecked ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                              {item.amount} {item.unit}
                            </span>
                            {recipeName !== 'Custom Items' && (
                              <Badge variant="outline" className="text-xs">
                                {item.recipeName}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No grocery items</h3>
            <p className="text-muted-foreground mb-4">
              Generate a grocery list from your meal planner or add custom items above.
            </p>
            <div className="text-sm text-muted-foreground">
              💡 Tip: Go to the Meal Planner and click "Generate Grocery List" to automatically add missing ingredients.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}