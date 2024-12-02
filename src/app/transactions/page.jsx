"use client"

import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();
  
    useEffect(() => {
      const fetchTransactions = async () => {
        try {
          const transactionsSnapshot = await getDocs(collection(db, "transactions"));
          const transactionsData = [];
  
          for (const docSnapshot of transactionsSnapshot.docs) {
            const transaction = { id: docSnapshot.id, ...docSnapshot.data() };
  
            // Fetch supplierName based on supplierId
            if (transaction.supplierId) {
              const supplierDoc = await getDoc(doc(db, "suppliers", transaction.supplierId));
              transaction.supplierName = supplierDoc.exists() ? supplierDoc.data().name : "Unknown Supplier";
            } else {
              transaction.supplierName = "No Supplier";
            }
  
            transactionsData.push(transaction);
          }
  
          setTransactions(transactionsData);
          setFilteredTransactions(transactionsData); // Initial filtered transactions
        } catch (error) {
          console.error("Error fetching transactions with supplier names:", error);
        }
      };
  
      fetchTransactions();
    }, []);
  
    // Search handler
    const handleSearch = (e) => {
      const searchValue = e.target.value.toLowerCase();
      setSearchTerm(searchValue);
  
      const filtered = transactions.filter((transaction) => {
        // Match supplierId
        const matchesSupplierId = transaction.supplierId?.toLowerCase().includes(searchValue);
  
        // Match supplierName
        const matchesSupplierName = transaction.supplierName?.toLowerCase().includes(searchValue);
  
        // Match year, month, or date from timestamp
        const transactionDate = new Date(transaction.timestamp.seconds * 1000);
        const matchesDate =
          transactionDate.getFullYear().toString().includes(searchValue) || // Year
          (transactionDate.getMonth() + 1).toString().includes(searchValue) || // Month (0-indexed)
          transactionDate.toLocaleDateString().includes(searchValue); // Full date
  
        return matchesSupplierId || matchesSupplierName || matchesDate;
      });
  
      setFilteredTransactions(filtered);
    };
  
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
            All Transactions
            <button
            onClick={() => router.push("/admin/dashboard")}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
            >
            Back to dashboard
            </button>
        </h2>
  
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by date, month, year, supplierId, or supplierName"
          className="w-full mb-4 p-2 border rounded"
          value={searchTerm}
          onChange={handleSearch}
        />
  
        {/* Transactions Table */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b px-4 py-2">Transaction ID</th>
                <th className="border-b px-4 py-2">Supplier ID</th>
                <th className="border-b px-4 py-2">Supplier Name</th>
                <th className="border-b px-4 py-2">Amount (PKR)</th>
                <th className="border-b px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
            {filteredTransactions.length === 0 ? (
                <tr>
                <td colSpan="5" className="text-center py-4">
                    No transactions found.
                </td>
                </tr>
            ) : (
                filteredTransactions.map((transaction) => (
                <tr
                    key={transaction.id}
                    className="hover:bg-gray-100 cursor-pointer"
                >
                    <td className="border-b px-4 py-2">
                    <Link href={`/transactions/${transaction.id}`}>{transaction.id}</Link>
                    </td>
                    <td className="border-b px-4 py-2">{transaction.supplierId}</td>
                    <td className="border-b px-4 py-2">{transaction.supplierName}</td>
                    <td className="border-b px-4 py-2">{transaction.totalTransactionPrice}</td>
                    <td className="border-b px-4 py-2">
                    {new Date(transaction.timestamp.seconds * 1000).toLocaleDateString()}
                    </td>
                </tr>
                ))
            )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
export default TransactionsPage;