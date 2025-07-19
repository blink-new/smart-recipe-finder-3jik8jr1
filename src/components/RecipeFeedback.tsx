import { useState } from 'react'
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { analyticsService } from '../services/analyticsService'
import { useToast } from '../hooks/use-toast'

interface RecipeFeedbackProps {
  recipeId: string
  recipeTitle: string
  userId: string
}

export function RecipeFeedback({ recipeId, recipeTitle, userId }: RecipeFeedbackProps) {
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null)
  const [showThankYou, setShowThankYou] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleFeedback = async (feedbackType: 'helpful' | 'not_helpful') => {
    if (isSubmitting || feedback) return

    setIsSubmitting(true)
    
    try {
      // Track the feedback event
      await analyticsService.trackRecipeFeedback(recipeId, recipeTitle, feedbackType, userId)
      
      setFeedback(feedbackType)
      setShowThankYou(true)
      
      // Hide thank you message after 3 seconds
      setTimeout(() => {
        setShowThankYou(false)
      }, 3000)

      toast({
        title: "Thank you for your feedback!",
        description: "Your feedback helps us improve recipe recommendations.",
      })
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showThankYou) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2 text-green-700">
            <Check className="h-5 w-5" />
            <span className="font-medium">Thank you for your feedback!</span>
          </div>
          <p className="text-sm text-green-600 text-center mt-1">
            Your input helps us improve recipe recommendations.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (feedback) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Check className="h-4 w-4" />
            <span className="text-sm">
              You found this recipe {feedback === 'helpful' ? 'helpful' : 'not helpful'}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Was this recipe helpful?
          </p>
          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFeedback('helpful')}
              disabled={isSubmitting}
              className="flex items-center space-x-2 hover:bg-green-50 hover:border-green-300"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>Yes</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFeedback('not_helpful')}
              disabled={isSubmitting}
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300"
            >
              <ThumbsDown className="h-4 w-4" />
              <span>No</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}