"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  type AuthState,
  getAuthState,
  loginUser,
  logoutUser,
  registerUser,
  initializeUsers,
} from "@/lib/user-storage"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User | null>
  logout: () => void
  register: (userData: Omit<User, "id">) => Promise<User | null>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, currentUser: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize users if needed
    initializeUsers()

    // Load auth state from localStorage
    const state = getAuthState()
    console.log("Initial auth state:", state)
    setAuthState(state)
    setLoading(false)

    // Add event listener for storage changes
    const handleStorageChange = () => {
      console.log("Storage changed, updating auth state")
      const newState = getAuthState()
      setAuthState(newState)
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const user = loginUser(email, password)
    if (user) {
      setAuthState({ isAuthenticated: true, currentUser: user })
      // Trigger storage event for other components
      window.dispatchEvent(new Event("storage"))
    }
    return user
  }

  const logout = () => {
    logoutUser()
    setAuthState({ isAuthenticated: false, currentUser: null })
    // Trigger storage event for other components
    window.dispatchEvent(new Event("storage"))
  }

  const register = async (userData: Omit<User, "id">) => {
    const user = registerUser(userData)
    if (user) {
      setAuthState({ isAuthenticated: true, currentUser: user })
      // Trigger storage event for other components
      window.dispatchEvent(new Event("storage"))
    }
    return user
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, register, loading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
