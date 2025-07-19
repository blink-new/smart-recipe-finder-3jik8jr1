import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import { RecipeRating, RecipeReview } from '../types/recipe'

interface RatingStats {
  averageRating: number
  totalRatings: number
}

export function useRatingsAndReviews() {
  const [isLoading, setIsLoading] = useState(false)

  // Get rating statistics for a recipe
  const getRatingStats = useCallback(async (recipeId: string): Promise<RatingStats> => {
    if (!recipeId) {
      return { averageRating: 0, totalRatings: 0 }
    }

    try {
      const ratings = await blink.db.recipeRatings.list({
        where: { recipeId },
      })

      if (!ratings || ratings.length === 0) {
        return { averageRating: 0, totalRatings: 0 }
      }

      const totalRating = ratings.reduce((sum, rating) => sum + Number(rating.rating || 0), 0)
      const averageRating = totalRating / ratings.length

      return {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalRatings: ratings.length
      }
    } catch (error) {
      console.error('Error fetching rating stats:', error)
      return { averageRating: 0, totalRatings: 0 }
    }
  }, [])

  // Get user's rating for a recipe
  const getUserRating = useCallback(async (recipeId: string): Promise<number> => {
    if (!recipeId) return 0

    try {
      const user = await blink.auth.me()
      if (!user?.id) return 0

      const userRatings = await blink.db.recipeRatings.list({
        where: { 
          AND: [
            { recipeId },
            { userId: user.id }
          ]
        },
        limit: 1
      })

      return userRatings && userRatings.length > 0 ? Number(userRatings[0].rating || 0) : 0
    } catch (error) {
      console.error('Error fetching user rating:', error)
      return 0
    }
  }, [])

  // Submit or update a rating
  const submitRating = useCallback(async (recipeId: string, rating: number): Promise<void> => {
    setIsLoading(true)
    try {
      const user = await blink.auth.me()
      if (!user) throw new Error('User not authenticated')

      // Check if user already rated this recipe
      const existingRatings = await blink.db.recipeRatings.list({
        where: { 
          AND: [
            { recipeId },
            { userId: user.id }
          ]
        },
        limit: 1
      })

      if (existingRatings.length > 0) {
        // Update existing rating
        await blink.db.recipeRatings.update(existingRatings[0].id, {
          rating: rating.toString(),
          updatedAt: new Date().toISOString()
        })
      } else {
        // Create new rating
        await blink.db.recipeRatings.create({
          id: `rating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          recipeId,
          rating: rating.toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get reviews for a recipe
  const getReviews = useCallback(async (recipeId: string): Promise<RecipeReview[]> => {
    if (!recipeId) return []

    try {
      const reviews = await blink.db.recipeReviews.list({
        where: { recipeId },
        orderBy: { createdAt: 'desc' },
        limit: 50
      })

      if (!reviews) return []

      return reviews.map(review => ({
        ...review,
        rating: Number(review.rating || 0)
      })) as RecipeReview[]
    } catch (error) {
      console.error('Error fetching reviews:', error)
      return []
    }
  }, [])

  // Submit a review
  const submitReview = useCallback(async (recipeId: string, reviewText: string): Promise<void> => {
    setIsLoading(true)
    try {
      const user = await blink.auth.me()
      if (!user) throw new Error('User not authenticated')

      await blink.db.recipeReviews.create({
        id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        recipeId,
        reviewText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error submitting review:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    getRatingStats,
    getUserRating,
    submitRating,
    getReviews,
    submitReview
  }
}