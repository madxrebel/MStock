"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, query, where, collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase"; // Adjust path as needed

const SupplierPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [supplier, setSupplier] = useState(null);
    const [summary, setSummary] = useState({
        totalTransactions: 0,
        totalAmount: 0,
        totalReceived: 0,
        totalRemaining: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            fetchSupplierData(id);
            fetchAdminTransactionSummary(id);
        }
    }, [id]);

    // Fetch supplier details
    const fetchSupplierData = async (supplierId) => {
        try {
            const supplierRef = doc(db, "suppliers", supplierId);
            const supplierSnap = await getDoc(supplierRef);
            if (supplierSnap.exists()) {
                setSupplier(supplierSnap.data());
            } else {
                setError("Supplier not found.");
            }
        } catch (err) {
            setError("Error fetching supplier data.");
        }
    };

    // Fetch summary of admin transactions
    const fetchAdminTransactionSummary = async (supplierId) => {
        try {
            const q = query(collection(db, "transactions"), where("supplierId", "==", supplierId));
            const querySnapshot = await getDocs(q);

            let totalAmount = 0;
            let totalReceived = 0;

            querySnapshot.forEach((doc) => {
                const transaction = doc.data();
                totalAmount += transaction.totalTransactionPrice || 0;
                totalReceived += transaction.receivedAmount || 0;
            });

            setSummary({
                totalTransactions: querySnapshot.size,
                totalAmount,
                totalReceived,
                totalRemaining: totalAmount - totalReceived,
            });
        } catch (err) {
            setError("Error fetching admin transaction summary.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Supplier Details</h1>

            {supplier && (
                <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold">Supplier Information</h2>
                    <p><strong>Name:</strong> {supplier.name}</p>
                    <p><strong>Id:</strong> {id}</p>
                    <p><strong>Phone:</strong> {supplier.phone}</p>
                    <p><strong>CNIC:</strong> {supplier.cnic}</p>
                    <p><strong>Working Status:</strong> {supplier.isWorking ? 'Active' : 'Inactive'}</p>
                </div>
            )}

            <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold flex justify-between items-center">Admin Transactions Summary
                    <button 
                        onClick={() => router.push(`/suppliers/adminTransactions?supplierId=${id}`)}
                        className="bg-blue-600 text-white px-1 py-1"
                    >
                        More
                    </button>
                </h2>
                <p><strong>Total Transactions:</strong> {summary.totalTransactions}</p>
                <p><strong>Total Amount (PKR):</strong> {summary.totalAmount}</p>
                <p><strong>Total Received Amount (PKR):</strong> {summary.totalReceived}</p>
                <p><strong>Total Remaining Amount (PKR):</strong> {summary.totalRemaining}</p>
            </div>

            <h2 className="text-xl font-semibold mt-8">Supplier Transactions with Shopkeepers</h2>
            <p className="text-gray-600">This section will display transactions between the supplier and shopkeepers.</p>
        </div>
    );
};

export default SupplierPage;
