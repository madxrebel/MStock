"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, FileText, BarChart, LogOut } from 'lucide-react'
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/dashboard", icon: Package, label: "Dashboard" },
  { href: "/products", icon: Package, label: "Products" },
  { href: "/transactions", icon: FileText, label: "Transactions" },
  { href: "/reports", icon: BarChart, label: "Reports" },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  return (
    <nav className="flex flex-col bg-white w-64 h-full border-r">
      <div className="flex items-center justify-center h-16 border-b">
        <span className="text-2xl font-semibold">Stock Manager</span>
      </div>
      <ul className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-gray-600 transition-colors duration-300 transform rounded-lg hover:bg-gray-100 hover:text-gray-700",
                pathname === item.href && "bg-gray-100 text-gray-700"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="mx-2 text-sm font-medium">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="px-3 py-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center px-3 py-2 text-gray-600 transition-colors duration-300 transform rounded-lg hover:bg-gray-100 hover:text-gray-700 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="mx-2 text-sm font-medium">Logout</span>
        </button>
      </div>
    </nav>
  )
}

