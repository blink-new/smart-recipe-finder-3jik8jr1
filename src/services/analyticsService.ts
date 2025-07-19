import { blink } from '../blink/client'

export interface AnalyticsEvent {
  id?: string
  userId: string
  eventType: 'pantry_edit' | 'recipe_view' | 'recipe_favorite' | 'meal_plan_create' | 'recipe_feedback'
  eventData: Record<string, any>
  timestamp: string
}

class AnalyticsService {
  async trackEvent(eventType: AnalyticsEvent['eventType'], eventData: Record<string, any>, userId: string) {
    try {
      const event: Omit<AnalyticsEvent, 'id'> = {
        userId,
        eventType,
        eventData,
        timestamp: new Date().toISOString()
      }

      // Store in database
      await blink.db.analyticsEvents.create(event)
      
      // Also log to console for development
      console.log('Analytics Event:', event)
      
      return true
    } catch (error) {
      console.error('Failed to track analytics event:', error)
      return false
    }
  }

  async trackPantryEdit(action: 'add' | 'remove', ingredient: string, userId: string) {
    return this.trackEvent('pantry_edit', { action, ingredient }, userId)
  }

  async trackRecipeView(recipeId: string, recipeTitle: string, userId: string) {
    return this.trackEvent('recipe_view', { recipeId, recipeTitle }, userId)
  }

  async trackRecipeFavorite(action: 'add' | 'remove', recipeId: string, recipeTitle: string, userId: string) {
    return this.trackEvent('recipe_favorite', { action, recipeId, recipeTitle }, userId)
  }

  async trackMealPlanCreate(mealPlanData: any, userId: string) {
    return this.trackEvent('meal_plan_create', mealPlanData, userId)
  }

  async trackRecipeFeedback(recipeId: string, recipeTitle: string, feedback: 'helpful' | 'not_helpful', userId: string) {
    return this.trackEvent('recipe_feedback', { recipeId, recipeTitle, feedback }, userId)
  }

  async getEventStats(userId: string, eventType?: AnalyticsEvent['eventType']) {
    try {
      const whereClause = eventType 
        ? { userId, eventType }
        : { userId }

      const events = await blink.db.analyticsEvents.list({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        limit: 100
      })

      return events
    } catch (error) {
      console.error('Failed to get event stats:', error)
      return []
    }
  }
}

export const analyticsService = new AnalyticsService()