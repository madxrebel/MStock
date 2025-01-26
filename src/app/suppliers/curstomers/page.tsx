'use client'

import { useState, useEffect } from 'react';
import Layout from '../../../components/layout'

interface Customer {
  id: number;
  name: string;
  email: string;
  totalPurchases: number;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '' });

  useEffect(() => {
    // In a real application, you would fetch this data from your backend
    setCustomers([
      { id: 1, name: 'John Doe', email: 'john@example.com', totalPurchases: 500 },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', totalPurchases: 750 },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', totalPurchases: 250 },
    ]);
  }, []);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = customers.length + 1;
    setCustomers([...customers, { ...newCustomer, id: newId, totalPurchases: 0 }]);
    setNewCustomer({ name: '', email: '' });
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Customer Management</h1>
      <form onSubmit={handleAddCustomer} className="mb-6">
        <input
          type="text"
          placeholder="Name"
          value={newCustomer.name}
          onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
          className="mr-2 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={newCustomer.email}
          onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
          className="mr-2 p-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Customer
        </button>
      </form>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Total Purchases</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="py-2 px-4 border-b">{customer.id}</td>
              <td className="py-2 px-4 border-b">{customer.name}</td>
              <td className="py-2 px-4 border-b">{customer.email}</td>
              <td className="py-2 px-4 border-b">${customer.totalPurchases}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

