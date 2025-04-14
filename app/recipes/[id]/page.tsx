"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChefHat, Clock, PlayCircle, Trash2, Users } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Recipe, getRecipeById, deleteRecipe } from "@/lib/recipe-storage"
import { useAuth } from "@/contexts/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function RecipeDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isAuthenticated, currentUser, loading } = useAuth()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [servings, setServings] = useState("2")
  const [loadingRecipe, setLoadingRecipe] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    // If not authenticated and not loading, redirect to login
    if (!loading && !isAuthenticated) {
      router.push("/login")
      return
    }

    // Load recipe
    const foundRecipe = getRecipeById(params.id)
    if (foundRecipe) {
      setRecipe(foundRecipe)
      setServings(foundRecipe.servings.toString())
    } else {
      // Recipe not found, redirect to home
      router.push("/")
    }
    setLoadingRecipe(false)
  }, [params.id, router, isAuthenticated, loading])

  // Show loading state while checking authentication or loading recipe
  if (loading || loadingRecipe) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8 flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  // If not authenticated or recipe not found, this will redirect in the useEffect
  if (!isAuthenticated || !currentUser || !recipe) {
    return null
  }

  const servingRatio = Number.parseInt(servings) / recipe.servings
  const isOwner = recipe.userId === currentUser.id

  const handleDeleteRecipe = () => {
    deleteRecipe(recipe.id)
    window.dispatchEvent(new Event("storage"))
    router.push("/")
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">{recipe.title}</h1>
        {isOwner && (
          <Button variant="ghost" size="icon" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-5 w-5 text-red-500" />
          </Button>
        )}
      </header>

      <div className="h-48 bg-gray-100 rounded-lg mb-6 relative">
        {recipe.image ? (
          <img
            src={recipe.image || "/placeholder.svg"}
            alt={recipe.title}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ChefHat className="h-16 w-16 text-gray-300" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-gray-500" />
          <span>{recipe.totalTime} mins</span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          <Select value={servings} onValueChange={setServings}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Servings" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-medium mb-3">Ingredients</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="flex items-center">
              <span className="w-6 h-6 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full text-xs mr-3">
                •
              </span>
              <span>
                {adjustQuantity(ingredient.quantity, servingRatio)} {ingredient.unit} {ingredient.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-medium mb-3">Instructions</h2>
        <ol className="space-y-4">
          {recipe.steps.map((step, index) => (
            <li key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">Step {index + 1}</span>
                {step.time && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{step.time} mins</span>
                  </div>
                )}
              </div>
              <p className="text-gray-700 mb-2">{step.instruction}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="fixed bottom-8 left-0 right-0 flex justify-center">
        <Link href={`/recipes/${params.id}/cook?servings=${servings}`}>
          <Button className="px-8 py-6 rounded-full shadow-lg">
            <PlayCircle className="h-5 w-5 mr-2" />
            Start Cooking
          </Button>
        </Link>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recipe? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRecipe} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function adjustQuantity(quantity: number, ratio: number): number {
  return Math.round(quantity * ratio * 10) / 10
}
