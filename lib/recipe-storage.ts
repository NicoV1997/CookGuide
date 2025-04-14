// Define types for our recipe data
export interface Ingredient {
  name: string
  quantity: number
  unit: string
}

export interface Step {
  instruction: string
  time?: number
  ingredients?: Ingredient[]
}

export interface Recipe {
  id: string
  userId: string // Associate recipe with a user
  title: string
  image?: string
  totalTime: number
  servings: number
  ingredients: Ingredient[]
  steps: Step[]
}

// Get all recipes from localStorage
export function getRecipes(): Recipe[] {
  if (typeof window === "undefined") return []

  const recipesJson = localStorage.getItem("recipes")
  if (!recipesJson) return []

  try {
    return JSON.parse(recipesJson)
  } catch (e) {
    console.error("Failed to parse recipes from localStorage", e)
    return []
  }
}

// Get recipes for a specific user
export function getUserRecipes(userId: string): Recipe[] {
  const recipes = getRecipes()
  return recipes.filter((recipe) => recipe.userId === userId)
}

// Get a single recipe by ID
export function getRecipeById(id: string): Recipe | undefined {
  const recipes = getRecipes()
  return recipes.find((recipe) => recipe.id === id)
}

// Save a new recipe
export function saveRecipe(recipe: Omit<Recipe, "id">): Recipe {
  const recipes = getRecipes()

  // Generate a unique ID
  const newRecipe: Recipe = {
    ...recipe,
    id: Date.now().toString(),
  }

  // Add to the list and save
  recipes.push(newRecipe)
  localStorage.setItem("recipes", JSON.stringify(recipes))

  return newRecipe
}

// Delete a recipe
export function deleteRecipe(id: string): boolean {
  const recipes = getRecipes()
  const filteredRecipes = recipes.filter((recipe) => recipe.id !== id)

  if (filteredRecipes.length < recipes.length) {
    localStorage.setItem("recipes", JSON.stringify(filteredRecipes))
    return true
  }

  return false
}

// Initialize with sample data if no recipes exist
export function initializeRecipes(): void {
  if (typeof window === "undefined") return

  // Only initialize with sample data if localStorage is empty
  const existingRecipes = localStorage.getItem("recipes")
  if (!existingRecipes) {
    localStorage.setItem("recipes", JSON.stringify(sampleRecipes))
  }
}

// Sample recipes for initial data
const sampleRecipes: Recipe[] = [
  {
    id: "1",
    userId: "1", // Associated with the demo user
    title: "Chicken Stir Fry",
    image: "/placeholder.svg?height=160&width=320",
    totalTime: 25,
    servings: 2,
    ingredients: [
      { name: "chicken breast", quantity: 200, unit: "g" },
      { name: "bell peppers", quantity: 1, unit: "" },
      { name: "broccoli", quantity: 100, unit: "g" },
      { name: "soy sauce", quantity: 2, unit: "tbsp" },
      { name: "vegetable oil", quantity: 1, unit: "tbsp" },
      { name: "garlic", quantity: 2, unit: "cloves" },
    ],
    steps: [
      {
        instruction: "Cut chicken into bite-sized pieces and marinate with soy sauce",
        time: 5,
        ingredients: [
          { name: "chicken breast", quantity: 200, unit: "g" },
          { name: "soy sauce", quantity: 1, unit: "tbsp" },
        ],
      },
      {
        instruction: "Heat oil in a pan and cook garlic until fragrant",
        time: 1,
        ingredients: [
          { name: "vegetable oil", quantity: 1, unit: "tbsp" },
          { name: "garlic", quantity: 2, unit: "cloves" },
        ],
      },
      {
        instruction: "Add chicken and cook until no longer pink",
        time: 8,
      },
      {
        instruction: "Add vegetables and stir fry until tender-crisp",
        time: 5,
        ingredients: [
          { name: "bell peppers", quantity: 1, unit: "" },
          { name: "broccoli", quantity: 100, unit: "g" },
        ],
      },
      {
        instruction: "Add remaining sauce and cook until everything is well coated",
        time: 2,
        ingredients: [{ name: "soy sauce", quantity: 1, unit: "tbsp" }],
      },
    ],
  },
  {
    id: "2",
    userId: "1", // Associated with the demo user
    title: "Pasta Carbonara",
    image: "/placeholder.svg?height=160&width=320",
    totalTime: 20,
    servings: 4,
    ingredients: [
      { name: "spaghetti", quantity: 400, unit: "g" },
      { name: "bacon or pancetta", quantity: 150, unit: "g" },
      { name: "eggs", quantity: 3, unit: "" },
      { name: "parmesan cheese", quantity: 50, unit: "g" },
      { name: "black pepper", quantity: 1, unit: "tsp" },
      { name: "salt", quantity: 1, unit: "tsp" },
    ],
    steps: [
      {
        instruction: "Bring a large pot of salted water to boil and cook pasta according to package instructions",
        time: 10,
        ingredients: [
          { name: "spaghetti", quantity: 400, unit: "g" },
          { name: "salt", quantity: 1, unit: "tsp" },
        ],
      },
      {
        instruction: "While pasta cooks, fry the bacon until crispy",
        time: 5,
        ingredients: [{ name: "bacon or pancetta", quantity: 150, unit: "g" }],
      },
      {
        instruction: "In a bowl, whisk eggs, grated cheese, and pepper",
        time: 2,
        ingredients: [
          { name: "eggs", quantity: 3, unit: "" },
          { name: "parmesan cheese", quantity: 50, unit: "g" },
          { name: "black pepper", quantity: 1, unit: "tsp" },
        ],
      },
      {
        instruction: "Drain pasta, reserving a little cooking water",
        time: 1,
      },
      {
        instruction: "Quickly add hot pasta to the bacon, then pour in egg mixture and toss rapidly",
        time: 2,
      },
    ],
  },
  {
    id: "3",
    userId: "1", // Associated with the demo user
    title: "Vegetable Curry",
    image: "/placeholder.svg?height=160&width=320",
    totalTime: 35,
    servings: 3,
    ingredients: [
      { name: "potatoes", quantity: 300, unit: "g" },
      { name: "carrots", quantity: 2, unit: "" },
      { name: "onion", quantity: 1, unit: "" },
      { name: "curry powder", quantity: 2, unit: "tbsp" },
      { name: "coconut milk", quantity: 400, unit: "ml" },
      { name: "vegetable broth", quantity: 200, unit: "ml" },
    ],
    steps: [
      {
        instruction: "Dice all vegetables into bite-sized pieces",
        time: 10,
        ingredients: [
          { name: "potatoes", quantity: 300, unit: "g" },
          { name: "carrots", quantity: 2, unit: "" },
          { name: "onion", quantity: 1, unit: "" },
        ],
      },
      {
        instruction: "Sauté onion until translucent",
        time: 3,
        ingredients: [{ name: "onion", quantity: 1, unit: "" }],
      },
      {
        instruction: "Add curry powder and cook until fragrant",
        time: 1,
        ingredients: [{ name: "curry powder", quantity: 2, unit: "tbsp" }],
      },
      {
        instruction: "Add vegetables and stir to coat with curry",
        time: 2,
        ingredients: [
          { name: "potatoes", quantity: 300, unit: "g" },
          { name: "carrots", quantity: 2, unit: "" },
        ],
      },
      {
        instruction: "Pour in coconut milk and broth, bring to a simmer",
        time: 4,
        ingredients: [
          { name: "coconut milk", quantity: 400, unit: "ml" },
          { name: "vegetable broth", quantity: 200, unit: "ml" },
        ],
      },
      {
        instruction: "Cook until vegetables are tender and sauce thickens",
        time: 15,
      },
    ],
  },
]
