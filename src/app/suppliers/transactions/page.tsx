'use client'

import { useState, useEffect } from 'react';
import Layout from '../../../components/layout'

interface Transaction {
  id: number;
  customerId: number;
  customerName: string;
  amount: number;
  date: string;
}

interface Customer {
  id: number;
  name: string;
}

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    customerId: '',
    itemId: '',
    quantity: '',
  });

  useEffect(() => {
    // In a real application, you would fetch this data from your backend
    setTransactions([
      { id: 1, customerId: 1, customerName: 'John Doe', amount: 100, date: '2023-05-01' },
      { id: 2, customerId: 2, customerName: 'Jane Smith', amount: 200, date: '2023-05-02' },
      { id: 3, customerId: 3, customerName: 'Bob Johnson', amount: 150, date: '2023-05-03' },
    ]);
    setCustomers([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
      { id: 3, name: 'Bob Johnson' },
    ]);
    setInventory([
      { id: 1, name: 'Product A', quantity: 100, price: 10 },
      { id: 2, name: 'Product B', quantity: 50, price: 20 },
      { id: 3, name: 'Product C', quantity: 75, price: 15 },
    ]);
  }, []);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find((c) => c.id === parseInt(newTransaction.customerId));
    const item = inventory.find((i) => i.id === parseInt(newTransaction.itemId));
    
    if (customer && item) {
      const quantity = parseInt(newTransaction.quantity);
      const amount = item.price * quantity;
      const newId = transactions.length + 1;
      const date = new Date().toISOString().split('T')[0];

      setTransactions([...transactions, {
        id: newId,
        customerId: customer.id,
        customerName: customer.name,
        amount,
        date,
      }]);

      // Update inventory
      setInventory(inventory.map((i) => 
        i.id === item.id ? { ...i, quantity: i.quantity - quantity } : i
      ));

      setNewTransaction({ customerId: '', itemId: '', quantity: '' });
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>
      <form onSubmit={handleAddTransaction} className="mb-6">
        <select
          value={newTransaction.customerId}
          onChange={(e) => setNewTransaction({ ...newTransaction, customerId: e.target.value })}
          className="mr-2 p-2 border rounded"
        >
          <option value="">Select Customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>{customer.name}</option>
          ))}
        </select>
        <select
          value={newTransaction.itemId}
          onChange={(e) => setNewTransaction({ ...newTransaction, itemId: e.target.value })}
          className="mr-2 p-2 border rounded"
        >
          <option value="">Select Item</option>
          {inventory.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Quantity"
          value={newTransaction.quantity}
          onChange={(e) => setNewTransaction({ ...newTransaction, quantity: e.target.value })}
          className="mr-2 p-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Transaction
        </button>
      </form>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Customer</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="py-2 px-4 border-b">{transaction.id}</td>
              <td className="py-2 px-4 border-b">{transaction.customerName}</td>
              <td className="py-2 px-4 border-b">${transaction.amount}</td>
              <td className="py-2 px-4 border-b">{transaction.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

