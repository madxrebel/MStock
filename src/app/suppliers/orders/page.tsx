'use client'

import { useState, useEffect } from 'react';
import Layout from '../../../components/layout'

interface Order {
  id: number;
  customerName: string;
  total: number;
  status: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // In a real application, you would fetch this data from your backend
    setOrders([
      { id: 1, customerName: 'John Doe', total: 100, status: 'Pending' },
      { id: 2, customerName: 'Jane Smith', total: 200, status: 'Shipped' },
      { id: 3, customerName: 'Bob Johnson', total: 150, status: 'Delivered' },
    ]);
  }, []);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Orders Management</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Order ID</th>
            <th className="py-2 px-4 border-b">Customer Name</th>
            <th className="py-2 px-4 border-b">Total</th>
            <th className="py-2 px-4 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="py-2 px-4 border-b">{order.id}</td>
              <td className="py-2 px-4 border-b">{order.customerName}</td>
              <td className="py-2 px-4 border-b">${order.total}</td>
              <td className="py-2 px-4 border-b">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

