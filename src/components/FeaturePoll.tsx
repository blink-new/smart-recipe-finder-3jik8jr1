import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { useToast } from '../hooks/use-toast'

interface PollOption {
  id: string
  label: string
  description: string
}

interface PollVote {
  id: string
  user_id: string
  option_id: string
  created_at: string
}

interface PollResults {
  [optionId: string]: number
}

const pollOptions: PollOption[] = [
  {
    id: 'voice-input',
    label: 'Voice pantry input',
    description: 'Add ingredients by speaking'
  },
  {
    id: 'photo-detection',
    label: 'Photo-to-ingredient detection',
    description: 'Scan photos to identify ingredients'
  },
  {
    id: 'nutrition-coach',
    label: 'Nutrition coach',
    description: 'Personalized nutrition guidance'
  },
  {
    id: 'offline-mode',
    label: 'Offline mode',
    description: 'Use the app without internet'
  }
]

interface FeaturePollProps {
  userId: string
  blink: any
}

export function FeaturePoll({ userId, blink }: FeaturePollProps) {
  const [userVote, setUserVote] = useState<string | null>(null)
  const [pollResults, setPollResults] = useState<PollResults>({})
  const [totalVotes, setTotalVotes] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { toast } = useToast()

  const loadPollData = useCallback(async () => {
    if (!blink || !userId) return
    
    try {
      setIsLoading(true)
      setHasError(false)
      
      // Load all votes for this specific poll
      const votes = await blink.db.poll_votes.list({
        where: { poll_id: 'future_features' },
        orderBy: { created_at: 'desc' }
      })

      // Calculate results
      const results: PollResults = {}
      let total = 0
      
      votes.forEach((vote: PollVote) => {
        results[vote.option_id] = (results[vote.option_id] || 0) + 1
        total++
      })

      setPollResults(results)
      setTotalVotes(total)

      // Find user's vote
      const userVoteRecord = votes.find((vote: PollVote) => vote.user_id === userId)
      setUserVote(userVoteRecord?.option_id || null)
      
    } catch (error) {
      console.error('Error loading poll data:', error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [userId, blink])

  useEffect(() => {
    if (blink && userId) {
      loadPollData()
    }
  }, [loadPollData, blink, userId])

  // Early return if no blink client or userId (after all hooks)
  if (!blink || !userId) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Feature poll is temporarily unavailable.
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleVote = async (optionId: string) => {
    if (isVoting) return
    
    try {
      setIsVoting(true)

      // If user already voted, update their vote
      if (userVote) {
        // Delete old vote
        const existingVotes = await blink.db.poll_votes.list({
          where: { 
            user_id: userId,
            poll_id: 'future_features'
          }
        })
        
        if (existingVotes.length > 0) {
          await blink.db.poll_votes.delete(existingVotes[0].id)
        }
      }

      // Add new vote
      const selectedOption = pollOptions.find(opt => opt.id === optionId)
      await blink.db.poll_votes.create({
        id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        poll_id: 'future_features', // Add the required poll_id
        option_id: optionId,
        option_text: selectedOption?.label || optionId, // Add the required option_text
        created_at: new Date().toISOString()
      })

      setUserVote(optionId)
      
      // Reload poll data to get updated results
      await loadPollData()
      
      toast({
        title: "Vote recorded!",
        description: `Thanks for voting for "${selectedOption?.label}". Your feedback helps us prioritize features.`,
      })
      
    } catch (error) {
      console.error('Error voting:', error)
      toast({
        title: "Error",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsVoting(false)
    }
  }

  const getPercentage = (optionId: string) => {
    if (totalVotes === 0) return 0
    return Math.round(((pollResults[optionId] || 0) / totalVotes) * 100)
  }

  const getVoteCount = (optionId: string) => {
    return pollResults[optionId] || 0
  }

  if (hasError) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Unable to load feature poll at the moment.
            </p>
            <Button 
              variant="outline" 
              onClick={() => loadPollData()}
              disabled={isLoading}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          What should we build next?
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Help us prioritize new features by voting for what you'd like to see most.
          {totalVotes > 0 && (
            <span className="ml-2">
              <Badge variant="secondary">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</Badge>
            </span>
          )}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {pollOptions.map((option) => {
          const percentage = getPercentage(option.id)
          const voteCount = getVoteCount(option.id)
          const isSelected = userVote === option.id
          const isWinning = totalVotes > 0 && voteCount === Math.max(...Object.values(pollResults))
          
          return (
            <div key={option.id} className="space-y-2">
              <Button
                variant={isSelected ? "default" : "outline"}
                className={`w-full justify-start h-auto p-4 ${
                  isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
                onClick={() => handleVote(option.id)}
                disabled={isVoting}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.label}</span>
                      {isSelected && <CheckCircle className="h-4 w-4" />}
                      {isWinning && totalVotes > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          Leading
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold">
                      {percentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {voteCount} vote{voteCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </Button>
              
              {totalVotes > 0 && (
                <Progress 
                  value={percentage} 
                  className="h-2"
                />
              )}
            </div>
          )
        })}
        
        {userVote && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              ✨ Thanks for voting! You can change your vote anytime.
            </p>
          </div>
        )}
        
        {totalVotes === 0 && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              🗳️ Be the first to vote and help shape our roadmap!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}