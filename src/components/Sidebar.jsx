import React from 'react'

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4">
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        </div>
        <nav className="flex-1 space-y-2">
            <a href="#stock" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Stock Overview
            </a>
            <a href="/products" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Products
            </a>
            <a href="/suppliers" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Suppliers
            </a>
            <a href="/transactions" className="block px-4 py-2 hover:bg-gray-700 rounded">
                Transactions
            </a>
        </nav>
    </aside>
  )
}
