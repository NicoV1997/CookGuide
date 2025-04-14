"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Pause, Play, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
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
import { type Recipe, getRecipeById } from "@/lib/recipe-storage"
import { useAuth } from "@/contexts/auth-context"

export default function CookingMode({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const servingsParam = searchParams.get("servings")

  // State for recipe and UI
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showTimerDialog, setShowTimerDialog] = useState(false)
  const [showNextStepDialog, setShowNextStepDialog] = useState(false)
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false)

  // Check authentication and load recipe
  useEffect(() => {
    // If not authenticated and not loading, redirect to login
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (isAuthenticated) {
      try {
        const foundRecipe = getRecipeById(params.id)
        if (foundRecipe) {
          setRecipe(foundRecipe)
        } else {
          setError("Recipe not found")
        }
      } catch (err) {
        setError("Failed to load recipe")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }, [params.id, router, isAuthenticated, authLoading])

  // Calculate derived values
  const servings = recipe && servingsParam ? Number.parseInt(servingsParam) : recipe?.servings || 2

  const servingRatio = recipe ? servings / recipe.servings : 1

  const currentStepData = recipe && recipe.steps[currentStep]
  const totalSteps = recipe?.steps.length || 0
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0

  // Initialize timer when step changes
  useEffect(() => {
    if (!recipe || !currentStepData || !currentStepData.time) return

    // Only show timer dialog and set time if we haven't already for this step
    if (timeRemaining === 0 && !timerActive) {
      setTimeRemaining(currentStepData.time * 60)
      setShowTimerDialog(true)
    }
  }, [recipe, currentStep, currentStepData, timeRemaining, timerActive])

  // Timer countdown
  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setTimerActive(false)
          setShowNextStepDialog(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerActive, timeRemaining])

  // Handler functions
  const startTimer = useCallback(() => {
    setTimerActive(true)
    setShowTimerDialog(false)
  }, [])

  const toggleTimer = useCallback(() => {
    setTimerActive((prev) => !prev)
  }, [])

  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
      setTimerActive(false)
      setTimeRemaining(0)
      setShowNextStepDialog(false)
    }
  }, [currentStep, totalSteps])

  const goToPrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      setTimerActive(false)
      setTimeRemaining(0)
    }
  }, [currentStep])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }, [])

  // Handle loading and error states
  if (authLoading || loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  if (error || !recipe) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error || "Recipe not found"}</p>
        <Button onClick={() => router.push("/")}>Return to Home</Button>
      </div>
    )
  }

  // Main UI render
  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <header className="p-4 border-b flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setExitConfirmOpen(true)}>
          <X className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <h1 className="font-medium">{recipe.title}</h1>
          <p className="text-sm text-gray-500">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>
        <div className="w-9"></div> {/* Spacer for alignment */}
      </header>

      <Progress value={progress} className="h-1" />

      {currentStepData && (
        <div className="flex-1 flex flex-col p-6">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm mb-4">
                Step {currentStep + 1}
              </span>
              <h2 className="text-xl font-medium mb-4">{currentStepData.instruction}</h2>

              {currentStepData.time && (
                <div className="text-gray-600 mb-2">Estimated time: {currentStepData.time} mins</div>
              )}

              {currentStepData.time && timeRemaining > 0 && (
                <div className="mt-6">
                  <div className="text-3xl font-bold mb-4">{formatTime(timeRemaining)}</div>
                  <Button
                    variant={timerActive ? "outline" : "default"}
                    onClick={toggleTimer}
                    className="rounded-full px-6"
                  >
                    {timerActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        {timeRemaining < currentStepData.time * 60 ? "Resume" : "Start Timer"}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {currentStepData.ingredients && (
              <div className="mb-8 w-full max-w-xs">
                <h3 className="font-medium mb-2">Ingredients for this step:</h3>
                <ul className="text-left space-y-1">
                  {currentStepData.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                      <span>
                        {adjustQuantity(ingredient.quantity, servingRatio)} {ingredient.unit} {ingredient.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={goToPrevStep} disabled={currentStep === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button onClick={goToNextStep} disabled={currentStep === totalSteps - 1}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Timer Dialog */}
      <AlertDialog open={showTimerDialog} onOpenChange={setShowTimerDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Timer?</AlertDialogTitle>
            <AlertDialogDescription>
              This step takes approximately {currentStepData?.time} minutes. Would you like to start a timer?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowTimerDialog(false)}>Skip Timer</AlertDialogCancel>
            <AlertDialogAction onClick={startTimer}>Start Timer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Next Step Dialog */}
      <AlertDialog open={showNextStepDialog} onOpenChange={setShowNextStepDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time's Up!</AlertDialogTitle>
            <AlertDialogDescription>
              The timer for this step has finished. Are you ready to move to the next step?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowNextStepDialog(false)}>Not Yet</AlertDialogCancel>
            <AlertDialogAction onClick={goToNextStep}>Next Step</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit Confirmation */}
      <AlertDialog open={exitConfirmOpen} onOpenChange={setExitConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Cooking Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exit? Your cooking progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setExitConfirmOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href={`/recipes/${params.id}`}>Exit</Link>
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
