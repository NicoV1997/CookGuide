"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UserIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function Profile() {
  const router = useRouter()
  const { isAuthenticated, currentUser, loading, logout } = useAuth()

  useEffect(() => {
    // If not authenticated and not loading, redirect to login
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

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
      <header className="flex items-center justify-between mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Profile</h1>
        <div className="w-9"></div> {/* Spacer for alignment */}
      </header>

      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <UserIcon className="h-12 w-12 text-orange-500" />
        </div>
        <h2 className="text-xl font-medium">{currentUser.username}</h2>
        <p className="text-gray-500">{currentUser.email}</p>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Account Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Username:</span>
              <span>{currentUser.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span>{currentUser.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Member since:</span>
              <span>April 2025</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Settings</h3>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => alert("Feature coming soon!")}>
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => alert("Feature coming soon!")}>
              Notification Preferences
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-500" onClick={logout}>
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
