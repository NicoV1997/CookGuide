"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Clock, Plus, Save, Trash2, Users } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { saveRecipe } from "@/lib/recipe-storage"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NewRecipe() {
  const router = useRouter()
  const { isAuthenticated, currentUser, loading } = useAuth()
  const [title, setTitle] = useState("")
  const [servings, setServings] = useState(2)
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "", unit: "" }])
  const [steps, setSteps] = useState([{ instruction: "", time: "" }])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // If not authenticated and not loading, redirect to login
    if (!loading && !isAuthenticated) {
      console.log("Not authenticated, redirecting to login")
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }])
  }

  const updateIngredient = (index: number, field: string, value: string) => {
    const updatedIngredients = [...ingredients]
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value }
    setIngredients(updatedIngredients)
  }

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index))
    }
  }

  const addStep = () => {
    setSteps([...steps, { instruction: "", time: "" }])
  }

  const updateStep = (index: number, field: string, value: string) => {
    const updatedSteps = [...steps]
    updatedSteps[index] = { ...updatedSteps[index], [field]: value }
    setSteps(updatedSteps)
  }

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!currentUser) {
      setError("You must be logged in to create a recipe")
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate total time from steps
      const totalTime = steps.reduce((total, step) => {
        const stepTime = step.time ? Number.parseInt(step.time) : 0
        return total + stepTime
      }, 0)

      // Format the recipe data
      const recipeData = {
        userId: currentUser.id, // Associate with current user
        title,
        servings,
        totalTime,
        image: "/placeholder.svg?height=160&width=320", // Default placeholder
        ingredients: ingredients.map((ing) => ({
          name: ing.name,
          quantity: Number.parseFloat(ing.quantity) || 0,
          unit: ing.unit,
        })),
        steps: steps.map((step) => ({
          instruction: step.instruction,
          time: step.time ? Number.parseInt(step.time) : undefined,
        })),
      }

      // Save the recipe and get the new recipe with ID
      const newRecipe = saveRecipe(recipeData)

      // Trigger a storage event so other components know to refresh
      window.dispatchEvent(new Event("storage"))

      // Redirect to the recipe detail page
      router.push(`/recipes/${newRecipe.id}`)
    } catch (err) {
      console.error("Error saving recipe:", err)
      setError("Failed to save recipe. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8 flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">New Recipe</h1>
        <div className="w-9"></div> {/* Spacer for alignment */}
      </header>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Recipe Title</Label>
            <Input
              id="title"
              placeholder="Enter recipe name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="servings">Servings</Label>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-gray-500" />
              <Input
                id="servings"
                type="number"
                min="1"
                max="20"
                value={servings}
                onChange={(e) => setServings(Number.parseInt(e.target.value))}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Ingredients</h2>
            <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <Card key={index}>
                <CardHeader className="p-3 flex flex-row items-center justify-between">
                  <h3 className="text-sm font-medium">Ingredient {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-3 pt-0 grid gap-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor={`quantity-${index}`} className="text-xs">
                        Quantity
                      </Label>
                      <Input
                        id={`quantity-${index}`}
                        placeholder="100"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`unit-${index}`} className="text-xs">
                        Unit
                      </Label>
                      <Input
                        id={`unit-${index}`}
                        placeholder="g"
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor={`name-${index}`} className="text-xs">
                        Name
                      </Label>
                      <Input
                        id={`name-${index}`}
                        placeholder="Ingredient name"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, "name", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Instructions</h2>
            <Button type="button" variant="outline" size="sm" onClick={addStep}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <Card key={index}>
                <CardHeader className="p-3 flex flex-row items-center justify-between">
                  <h3 className="text-sm font-medium">Step {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStep(index)}
                    disabled={steps.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-3 pt-0 grid gap-3">
                  <div>
                    <Label htmlFor={`instruction-${index}`} className="text-xs">
                      Instruction
                    </Label>
                    <Textarea
                      id={`instruction-${index}`}
                      placeholder="Describe this step"
                      value={step.instruction}
                      onChange={(e) => updateStep(index, "instruction", e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <Label htmlFor={`time-${index}`} className="text-xs">
                        Time (minutes)
                      </Label>
                      <Input
                        id={`time-${index}`}
                        type="number"
                        min="0"
                        placeholder="5"
                        value={step.time}
                        onChange={(e) => updateStep(index, "time", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Recipe"}
          </Button>
        </div>
      </form>
    </div>
  )
}
