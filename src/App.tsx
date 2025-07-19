import { useState, useEffect } from 'react'
import { createClient } from '@blinkdotnew/sdk'
import { Toaster } from '@/components/ui/sonner'
import { Navigation } from '@/components/Navigation'
import { HomePage } from '@/pages/HomePage'
import { RecipeDiscoveryPage } from '@/pages/RecipeDiscoveryPage'
import { MealPlannerPage } from '@/pages/MealPlannerPage'
import { SavedMealsPage } from '@/pages/SavedMealsPage'
import { GroceryListPage } from '@/pages/GroceryListPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const blink = createClient({
  projectId: 'smart-recipe-finder-3jik8jr1',
  authRequired: true
})

export type User = {
  id: string
  email: string
  displayName?: string
}

export type AppPage = 'home' | 'discovery' | 'planner' | 'saved' | 'grocery' | 'profile'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<AppPage>('home')

  useEffect(() => {
    let mounted = true
    
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (!mounted) return
      
      // Ensure user object is valid before setting
      if (state.user && state.user.id && typeof state.user.id === 'string') {
        setUser(state.user)
      } else {
        setUser(null)
      }
      setLoading(state.isLoading)
    })
    
    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to continue</h1>
          <button
            onClick={() => blink.auth.login()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    // Ensure user is properly loaded before rendering pages
    if (!user || !user.id) {
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Loading user data...</p>
        </div>
      )
    }

    switch (currentPage) {
      case 'home':
        return <HomePage user={user} onNavigate={setCurrentPage} />
      case 'discovery':
        return <RecipeDiscoveryPage user={user} />
      case 'planner':
        return <MealPlannerPage user={user} />
      case 'saved':
        return <SavedMealsPage user={user} />
      case 'grocery':
        return <GroceryListPage user={user} />
      case 'profile':
        return <ProfilePage user={user} />
      default:
        return <HomePage user={user} onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50">
      <Navigation 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        user={user}
      />
      <main className="pb-20 md:pb-0">
        {renderPage()}
      </main>
      <Toaster />
    </div>
  )
}

export default App