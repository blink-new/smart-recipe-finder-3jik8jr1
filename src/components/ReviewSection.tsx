import { useState, useEffect } from 'react'
import { MessageSquare, Send, User } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { useToast } from '../hooks/use-toast'
import { useRatingsAndReviews } from '../hooks/useRatingsAndReviews'
import { StarRating, StarRatingDisplay } from './StarRating'
import { RecipeReview } from '../types/recipe'

interface ReviewSectionProps {
  recipeId: string
  recipeTitle: string
}

export function ReviewSection({ recipeId, recipeTitle }: ReviewSectionProps) {
  const [userRating, setUserRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviews, setReviews] = useState<RecipeReview[]>([])
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, totalRatings: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { toast } = useToast()
  const { 
    isLoading, 
    getRatingStats, 
    getUserRating, 
    submitRating, 
    getReviews, 
    submitReview 
  } = useRatingsAndReviews()

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [stats, currentUserRating, recipeReviews] = await Promise.all([
          getRatingStats(recipeId),
          getUserRating(recipeId),
          getReviews(recipeId)
        ])
        
        setRatingStats(stats)
        setUserRating(currentUserRating)
        setReviews(recipeReviews)
      } catch (error) {
        console.error('Error loading review data:', error)
      }
    }

    loadData()
  }, [recipeId, getRatingStats, getUserRating, getReviews])

  const handleRatingSubmit = async (rating: number) => {
    try {
      await submitRating(recipeId, rating)
      setUserRating(rating)
      
      // Refresh rating stats
      const newStats = await getRatingStats(recipeId)
      setRatingStats(newStats)
      
      toast({
        title: "Rating Submitted!",
        description: `You rated "${recipeTitle}" ${rating} star${rating !== 1 ? 's' : ''}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleReviewSubmit = async () => {
    if (!reviewText.trim()) {
      toast({
        title: "Review Required",
        description: "Please write a review before submitting.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      await submitReview(recipeId, reviewText.trim())
      
      // Refresh reviews
      const updatedReviews = await getReviews(recipeId)
      setReviews(updatedReviews)
      setReviewText('')
      
      toast({
        title: "Review Submitted!",
        description: "Thank you for sharing your experience with this recipe.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">Ratings & Reviews</h3>
          {ratingStats.totalRatings > 0 ? (
            <StarRatingDisplay 
              rating={ratingStats.averageRating} 
              totalRatings={ratingStats.totalRatings}
              size="md"
            />
          ) : (
            <p className="text-sm text-muted-foreground">No ratings yet</p>
          )}
        </div>
      </div>

      {/* User Rating Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rate This Recipe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {userRating > 0 ? 'Update your rating:' : 'How would you rate this recipe?'}
            </p>
            <StarRating
              rating={userRating}
              interactive={true}
              onRatingChange={handleRatingSubmit}
              size="lg"
            />
            {userRating > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                You rated this recipe {userRating} star{userRating !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Submission */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Write a Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Share your experience with this recipe... What did you like? Any tips or modifications?"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {reviewText.length}/500 characters
            </span>
            <Button 
              onClick={handleReviewSubmit}
              disabled={!reviewText.trim() || isSubmitting}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div>
          <h4 className="text-base font-semibold mb-4 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Recent Reviews ({reviews.length})
          </h4>
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Anonymous User
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {formatDate(review.createdAt)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {review.reviewText}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {reviews.length === 0 && ratingStats.totalRatings === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2">No Reviews Yet</h4>
          <p className="text-muted-foreground">
            Be the first to rate and review this recipe!
          </p>
        </div>
      )}
    </div>
  )
}