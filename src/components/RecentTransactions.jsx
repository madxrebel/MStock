import { useEffect, useState } from 'react';
import { getRecentTransactions } from '../lib/firebase';

export function RecentTransactions({ supplierId }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const data = await getRecentTransactions(supplierId);
      setTransactions(data);
    };
    fetchTransactions();
  }, [supplierId]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {transaction.type}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
              <div className="inline-flex items-center text-base font-semibold text-gray-900">
                ${transaction.amount.toLocaleString()}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
