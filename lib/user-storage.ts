// Define user types
export interface User {
  id: string
  username: string
  email: string
  password: string // In a real app, never store plain text passwords
}

export interface AuthState {
  isAuthenticated: boolean
  currentUser: User | null
}

// Get current auth state
export function getAuthState(): AuthState {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, currentUser: null }
  }

  try {
    const userJson = localStorage.getItem("currentUser")
    if (!userJson) {
      return { isAuthenticated: false, currentUser: null }
    }

    const user = JSON.parse(userJson)
    if (!user || !user.id) {
      // Invalid user data
      localStorage.removeItem("currentUser")
      return { isAuthenticated: false, currentUser: null }
    }

    return { isAuthenticated: true, currentUser: user }
  } catch (e) {
    console.error("Failed to parse user from localStorage", e)
    // Clear invalid data
    localStorage.removeItem("currentUser")
    return { isAuthenticated: false, currentUser: null }
  }
}

// Get all users
export function getUsers(): User[] {
  if (typeof window === "undefined") return []

  const usersJson = localStorage.getItem("users")
  if (!usersJson) return []

  try {
    return JSON.parse(usersJson)
  } catch (e) {
    console.error("Failed to parse users from localStorage", e)
    return []
  }
}

// Register a new user
export function registerUser(userData: Omit<User, "id">): User | null {
  const users = getUsers()

  // Check if email already exists
  if (users.some((user) => user.email === userData.email)) {
    return null // Email already in use
  }

  // Create new user
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
  }

  // Add to users list
  users.push(newUser)
  localStorage.setItem("users", JSON.stringify(users))

  // Log in the user
  localStorage.setItem("currentUser", JSON.stringify(newUser))

  return newUser
}

// Login user
export function loginUser(email: string, password: string): User | null {
  const users = getUsers()

  // Find user with matching email and password
  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    // Store current user in localStorage
    localStorage.setItem("currentUser", JSON.stringify(user))
    return user
  }

  return null
}

// Logout user
export function logoutUser(): void {
  localStorage.removeItem("currentUser")
}

// Initialize with a sample user if no users exist
export function initializeUsers(): void {
  if (typeof window === "undefined") return

  const users = getUsers()
  if (users.length === 0) {
    const sampleUsers: User[] = [
      {
        id: "1",
        username: "demo",
        email: "demo@example.com",
        password: "password123", // In a real app, use hashed passwords
      },
    ]
    localStorage.setItem("users", JSON.stringify(sampleUsers))
  }
}
