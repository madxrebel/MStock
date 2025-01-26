"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Use this instead of router.query
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase"; // Adjust the import path as per your project structure

const SuppliersPage = () => {
    const searchParams = useSearchParams();
    const uid = searchParams.get("uid"); // Get 'uid' from query parameters
    const router = useRouter();
    const [suppliers, setSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (uid) {
            fetchSuppliers(uid);
        }
    }, [uid]);

    useEffect(() => {
        // Filter suppliers based on the search term
        const filtered = suppliers.filter((supplier) => {
            const searchValue = searchTerm.toLowerCase();
            return (
                supplier.name.toLowerCase().includes(searchValue) ||
                supplier.id.toLowerCase().includes(searchValue) ||
                (supplier.phone && supplier.phone.toLowerCase().includes(searchValue)) ||
                (supplier.cnic && supplier.cnic.toLowerCase().includes(searchValue)) ||
                (supplier.isWorking ? "active" : "inactive").includes(searchValue)
            );
        });
        setFilteredSuppliers(filtered);
    }, [searchTerm, suppliers]);

    const fetchSuppliers = async (userId) => {
        try {
            const q = query(collection(db, "suppliers"), where("createdBy", "==", userId));
            const querySnapshot = await getDocs(q);
            const suppliersList = [];
            querySnapshot.forEach((doc) => {
                suppliersList.push({ id: doc.id, ...doc.data() });
            });
            setSuppliers(suppliersList);
            setFilteredSuppliers(suppliersList);
        } catch (err) {
            setError("Error fetching suppliers.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <section id="suppliers" className="mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
                Suppliers
                <div>
                    <button
                        onClick={() => router.push(`/admin/dashboard`)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </h2>
            <div className="mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, ID, phone, CNIC, or status"
                    className="w-full p-2 border rounded-lg"
                />
            </div>
            {filteredSuppliers.length > 0 ? (
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="border-b px-4 py-2">Supplier Name</th>
                                <th className="border-b px-4 py-2">Supplier ID</th>
                                <th className="border-b px-4 py-2">Phone</th>
                                <th className="border-b px-4 py-2">CNIC</th>
                                <th className="border-b px-4 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map((supplier) => (
                                <tr
                                    key={supplier.id}
                                    className="cursor-pointer hover:bg-gray-100"
                                    onClick={() => router.push(`/suppliers/${supplier.id}`)}
                                >
                                    <td className="border-b px-4 py-2">{supplier.name}</td>
                                    <td className="border-b px-4 py-2">{supplier.id}</td>
                                    <td className="border-b px-4 py-2">{supplier.phone || "N/A"}</td>
                                    <td className="border-b px-4 py-2">{supplier.cnic || "N/A"}</td>
                                    <td className="border-b px-4 py-2">
                                        {supplier.isWorking ? "Active" : "Inactive"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No suppliers found.</p>
            )}
        </section>
    );
};

export default SuppliersPage;
