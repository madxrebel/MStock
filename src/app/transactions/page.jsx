"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchTransactions = async () => {
            const transactionsSnapshot = await getDocs(collection(db, "transactions"));
            const transactionsData = transactionsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTransactions(transactionsData);
        };

        fetchTransactions();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">All Transactions</h1>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="border-b px-4 py-2">Transaction ID</th>
                            <th className="border-b px-4 py-2">Amount (PKR)</th>
                            <th className="border-b px-4 py-2">Supplier</th>
                            <th className="border-b px-4 py-2">Date</th>
                            <th className="border-b px-4 py-2">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td className="border-b px-4 py-2">{transaction.id}</td>
                                <td className="border-b px-4 py-2">{transaction.totalPrice}</td>
                                <td className="border-b px-4 py-2">{transaction.supplierName}</td>
                                <td className="border-b px-4 py-2">
                                    {new Date(transaction.createdAt).toLocaleDateString()}
                                </td>
                                <td className="border-b px-4 py-2">
                                    <button
                                        onClick={() => router.push(`/transactions/${transaction.id}`)}
                                        className="text-blue-500 hover:underline"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
