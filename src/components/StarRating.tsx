import { Star } from 'lucide-react'
import { cn } from '../lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  interactive = false, 
  onRatingChange,
  className 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating)
    }
  }

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1
        const isFilled = starRating <= rating
        const isPartiallyFilled = starRating - 0.5 <= rating && rating < starRating

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleStarClick(starRating)}
            disabled={!interactive}
            className={cn(
              sizeClasses[size],
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default',
              isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300',
              isPartiallyFilled && 'text-yellow-400'
            )}
          >
            <Star className={cn(
              'w-full h-full',
              isFilled && 'fill-current',
              isPartiallyFilled && 'fill-current opacity-50'
            )} />
          </button>
        )
      })}
    </div>
  )
}

interface StarRatingDisplayProps {
  rating: number
  totalRatings?: number
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function StarRatingDisplay({ 
  rating, 
  totalRatings, 
  size = 'md', 
  showText = true,
  className 
}: StarRatingDisplayProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <StarRating rating={rating} size={size} />
      {showText && (
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <span className="font-medium">{rating.toFixed(1)}</span>
          {totalRatings !== undefined && (
            <span>({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})</span>
          )}
        </div>
      )}
    </div>
  )
}