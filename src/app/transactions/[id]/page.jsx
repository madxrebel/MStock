"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TransactionDetailsPage({ params }) {
    const [transaction, setTransaction] = useState(null);
    const router = useRouter();
    const { id } = params;

    useEffect(() => {
        const fetchTransaction = async () => {
            const transactionDoc = await getDoc(doc(db, "transactions", id));
            if (transactionDoc.exists()) {
                setTransaction({ id: transactionDoc.id, ...transactionDoc.data() });
            } else {
                router.push("/transactions");
            }
        };

        fetchTransaction();
    }, [id, router]);

    if (!transaction) return <p>Loading...</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Transaction Details</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p><strong>Transaction ID:</strong> {transaction.id}</p>
                <p><strong>Total Price (PKR):</strong> {transaction.totalPrice}</p>
                <p><strong>Supplier Name:</strong> {transaction.supplierName}</p>
                <p><strong>Date:</strong> {new Date(transaction.createdAt).toLocaleDateString()}</p>
                <p><strong>Products:</strong></p>
                <ul className="list-disc ml-6">
                    {transaction.products.map((product, index) => (
                        <li key={index}>
                            {product.name} - {product.quantity}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
