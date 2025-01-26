import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <nav className="mt-5">
          <Link href="/dashboard">
            <a className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
              Dashboard
            </a>
          </Link>
          <Link href="/suppliers/orders">
            <a className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
              Orders
            </a>
          </Link>
          <Link href="/suppliers/customers">
            <a className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
              Customers
            </a>
          </Link>
          <Link href="/suppliers/inventory">
            <a className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
              Inventory
            </a>
          </Link>
          <Link href="/suppliers/transactions">
            <a className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
              Transactions
            </a>
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}
