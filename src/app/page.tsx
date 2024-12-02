import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Welcome to Stock Management</h1>
      <p className="text-xl mb-8 text-center max-w-2xl">
        Efficiently manage your inventory, track transactions, and generate detailed reports for your business.
      </p>
      <div className="flex space-x-4">
        <Button asChild>
          <Link href="/admin/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Manage Products</Link>
        </Button>
      </div>
    </div>
  )
}

