"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { GoogleSignIn } from "@/components/google-sign-in"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setLoading(true) // Start the loading state
      router.push("/admin/dashboard")
    }
  }, [user, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      ) : (
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Sign in to access the stock management system.</CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleSignIn />
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-sm text-gray-500 text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
