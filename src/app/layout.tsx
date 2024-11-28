import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Navigation } from "@/components/navigation"
// import { AuthProvider } from "@/context/authContext";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Stock Management Application",
  description: "Manage your stock efficiently",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex h-screen">
            <Navigation />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
              <AuthProvider>
                {children}
              </AuthProvider>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

