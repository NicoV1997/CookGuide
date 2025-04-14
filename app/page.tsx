"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChefHat, Clock, LogOut, Plus, User } from "lucide-react"
import { type Recipe, getUserRecipes, initializeRecipes } from "@/lib/recipe-storage"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, currentUser, logout, loading } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    // If not authenticated and not loading, redirect to login
    if (!loading && !isAuthenticated) {
      router.push("/login")
      return
    }

    // Initialize with sample data if empty
    initializeRecipes()

    // Load user's recipes from localStorage
    if (currentUser) {
      setRecipes(getUserRecipes(currentUser.id))
    }

    // Add event listener to refresh recipes when storage changes
    const handleStorageChange = () => {
      if (currentUser) {
        setRecipes(getUserRecipes(currentUser.id))
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [isAuthenticated, currentUser, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8 flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  // If not authenticated, this will redirect in the useEffect
  if (!isAuthenticated || !currentUser) {
    return null
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold">CookGuide</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/profile">
            <Button variant="ghost" size="icon" title="Profile">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/recipes/new">
            <Button variant="ghost" size="icon" title="Add Recipe">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={logout} title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex items-center mb-6">
        <div className="bg-orange-100 text-orange-600 rounded-full px-3 py-1 text-sm">
          Welcome, {currentUser.username}!
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">My Recipes</h2>

        <div className="grid gap-4">
          {recipes.map((recipe) => (
            <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="block">
              <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {recipe.image ? (
                      <img
                        src={recipe.image || "/placeholder.svg"}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ChefHat className="h-12 w-12 text-gray-300" />
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{recipe.title}</h3>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{recipe.totalTime} mins</span>
                    <span className="mx-2">•</span>
                    <span>{recipe.servings} servings</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {recipes.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No recipes yet</h3>
            <p className="text-gray-500 mb-4">Add your first recipe to get started</p>
            <Link href="/recipes/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Recipe
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
