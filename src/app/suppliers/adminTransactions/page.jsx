"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

const AdminTransactionsPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supplierId = searchParams.get("supplierId");
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (supplierId) fetchAdminTransactions(supplierId);
    }, [supplierId]);

    const fetchAdminTransactions = async (id) => {
        try {
            const q = query(collection(db, "transactions"), where("supplierId", "==", id));
            const querySnapshot = await getDocs(q);

            const transactionsList = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setTransactions(transactionsList);
        } catch (err) {
            setError("Error fetching admin transactions.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate summary data
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, t) => sum + (t.totalTransactionPrice || 0), 0);
    const receivedAmount = transactions.reduce((sum, t) => sum + (t.receivedAmount || 0), 0);
    const remainingAmount = totalAmount - receivedAmount;

    if (loading) return <p className="text-center mt-10">Loading...</p>;
    if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

    return (
        <div className="container mx-auto p-6">

            <div className="flex justify-between items-center mb-6">
                <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Total Transactions</p>
                    <p className="text-lg font-bold text-gray-800">{totalTransactions}</p>
                    <p className="text-sm text-gray-500 mt-2">Total Amount (PKR)</p>
                    <p className="text-lg font-bold text-green-600">{totalAmount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-2">Received Amount (PKR)</p>
                    <p className="text-lg font-bold text-blue-600">{receivedAmount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-2">Remaining Amount (PKR)</p>
                    <p className="text-lg font-bold text-red-600">{remainingAmount.toLocaleString()}</p>
                </div>
            </div>

            {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                    <h1 className="text-3xl font-bold text-gray-800 my-3">Admin Transactions</h1>
                    <table className="min-w-full table-auto border-collapse border border-gray-300 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2 text-left font-medium text-gray-600">Transaction ID</th>
                                <th className="border px-4 py-2 text-left font-medium text-gray-600">Total Amount (PKR)</th>
                                <th className="border px-4 py-2 text-left font-medium text-gray-600">Received Amount (PKR)</th>
                                <th className="border px-4 py-2 text-left font-medium text-gray-600">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction, index) => (
                                <tr
                                    key={transaction.id}
                                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 hover:cursor-pointer`}
                                    onClick={() => router.push(`/transactions/${transaction.id}`)}
                                >
                                    <td className="border px-4 py-2 text-gray-800">{transaction.id}</td>
                                    <td className="border px-4 py-2 text-gray-800">
                                        {transaction.totalTransactionPrice?.toLocaleString() || "N/A"}
                                    </td>
                                    <td className="border px-4 py-2 text-gray-800">
                                        {transaction.receivedAmount?.toLocaleString() || 0}
                                    </td>
                                    <td className="border px-4 py-2 text-gray-800">
                                        {transaction.timestamp
                                            ? new Date(transaction.timestamp.seconds * 1000).toLocaleDateString()
                                            : "N/A"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-600">No transactions found for this supplier.</p>
            )}
        </div>
    );
};

export default AdminTransactionsPage;
