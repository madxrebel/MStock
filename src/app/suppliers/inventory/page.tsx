'use client'

import { useState, useEffect } from 'react';
import Layout from '../../../components/layout'

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    // In a real application, you would fetch this data from your backend
    setInventory([
      { id: 1, name: 'Product A', quantity: 100, price: 10 },
      { id: 2, name: 'Product B', quantity: 50, price: 20 },
      { id: 3, name: 'Product C', quantity: 75, price: 15 },
    ]);
  }, []);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Quantity</th>
            <th className="py-2 px-4 border-b">Price</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td className="py-2 px-4 border-b">{item.id}</td>
              <td className="py-2 px-4 border-b">{item.name}</td>
              <td className="py-2 px-4 border-b">{item.quantity}</td>
              <td className="py-2 px-4 border-b">${item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

