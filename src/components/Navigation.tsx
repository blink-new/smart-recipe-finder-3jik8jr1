import React, { useState } from 'react'
import { Home, Search, Heart, ShoppingCart, User, Menu, X, LogOut, Calendar } from 'lucide-react'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import { AppPage } from '../App'

interface NavigationProps {
  currentPage: AppPage
  onNavigate: (page: AppPage) => void
  user: any
}

export function Navigation({ currentPage, onNavigate, user }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { page: 'home' as AppPage, label: 'Home', icon: Home },
    { page: 'discovery' as AppPage, label: 'Discover', icon: Search },
    { page: 'planner' as AppPage, label: 'Meal Planner', icon: Calendar },
    { page: 'saved' as AppPage, label: 'My Favorites', icon: Heart },
    { page: 'grocery' as AppPage, label: 'Grocery List', icon: ShoppingCart },
    { page: 'profile' as AppPage, label: 'Profile', icon: User },
  ]

  const isActive = (page: AppPage) => currentPage === page

  const handleNavigation = (page: AppPage) => {
    onNavigate(page)
    setIsOpen(false)
  }

  const handleLogout = () => {
    window.location.reload() // Simple logout - will trigger auth redirect
    setIsOpen(false)
  }

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => handleNavigation('home')} 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <h1 className="text-2xl font-bold text-primary">PlateMate</h1>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.page}
                  onClick={() => handleNavigation(item.page)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.page)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <nav className="flex-1 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.page}
                        onClick={() => handleNavigation(item.page)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full text-left ${
                          isActive(item.page)
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </nav>

                <div className="border-t pt-4 space-y-4">
                  <div className="px-4">
                    <p className="text-sm text-muted-foreground mb-2">Signed in as:</p>
                    <p className="text-sm font-medium">
                      {user?.displayName || user?.email || 'User'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}