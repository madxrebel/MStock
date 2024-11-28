import Link from "next/link"
import { Home, Package, FileText, BarChart } from "lucide-react"

export function Sidebar() {
  return (
    <div className="bg-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <nav>
        <Link href="/dashboard" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          <Home className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
        <Link href="/dashboard/products" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          <Package className="h-5 w-5" />
          <span>Products</span>
        </Link>
        <Link href="/dashboard/transactions" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          <FileText className="h-5 w-5" />
          <span>Transactions</span>
        </Link>
        <Link href="/dashboard/reports" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          <BarChart className="h-5 w-5" />
          <span>Reports</span>
        </Link>
      </nav>
    </div>
  )
}

