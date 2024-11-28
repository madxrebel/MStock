"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

type UserRole = "admin" | "staff"

type AuthContextType = {
  user: User | null
  loading: boolean
  role: UserRole | null
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, role: null })

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<UserRole | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user)
      if (user) {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)
        
        if (!userDoc.exists()) {
          // If the user document doesn't exist, create it
          await setDoc(userDocRef, {
            email: user.email,
            name: user.displayName,
            role: "staff" // Default role
          })
          setRole("staff")
        } else {
          const userData = userDoc.data()
          setRole(userData?.role as UserRole || null)
        }
      } else {
        setRole(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, loading, role }}>{children}</AuthContext.Provider>
}

