"use client"

import { useAuth } from "./auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

type WithAuthProps = {
  requiredRole?: "admin" | "staff"
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { requiredRole }: WithAuthProps = {}
) {
  return function WithAuth(props: P) {
    const { user, loading, role } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        router.push("/login")
      } else if (requiredRole && role !== requiredRole) {
        router.push("/unauthorized")
      }
    }, [loading, user, role, router])

    if (loading) {
      return <div>Loading...</div>
    }

    if (!user || (requiredRole && role !== requiredRole)) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}

