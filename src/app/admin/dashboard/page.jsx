"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stockChange, setStockChange] = useState(0);
    const [productId, setProductId] = useState("");
    const [action, setAction] = useState("");  // Declare action state
    const router = useRouter();
    const user = auth.currentUser;
    // State for managing suppliers and modal
    const [suppliers, setSuppliers] = useState([]);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [newSupplierId, setNewSupplierId] = useState("");
    const [newSupplier, setNewSupplier] = useState({
        name: "",
        id: "",
        password: "",
        phone: "",
        cnic: "",
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
          router.push('/login');  // Use `router.push` instead of `redirect`
        }
    }, [user, router]);

    // Fetch products, transactions and suppliers
    useEffect(() => {
        const fetchProducts = async () => {
          const productsSnapshot = await getDocs(collection(db, "products"));
          const productsData = productsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          const sortedProducts = productsData.sort((a, b) => a.packedStock - b.packedStock);
          setProducts(sortedProducts);
        };
      
        const fetchSuppliers = async () => {
          const suppliersSnapshot = await getDocs(collection(db, "suppliers"));
          const suppliersData = suppliersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSuppliers(suppliersData);
        };
      
        const fetchTransactions = async () => {
          const transactionsSnapshot = await getDocs(collection(db, "transactions"));
          const transactionsData = transactionsSnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .sort((a, b) => b.createdAt - a.createdAt);
          setTransactions(transactionsData.slice(0, 10)); // Top 10 transactions
        };
      
        Promise.all([fetchProducts(), fetchSuppliers(), fetchTransactions()]).finally(() => {
          setLoading(false);  // Set loading to false after data fetching completes
        });
    }, []);

    const openModal = (id, currentStock, actionType) => {
        setProductId(id);
        setStockChange(0);
        setAction(actionType);  // Set the action (add or subtract)
        setIsModalOpen(true);
    };

    const updateStock = async (productId, change, action) => {
        const productRef = doc(db, "products", productId);
        const product = products.find((p) => p.id === productId);

        if (product) {
            let newStock;
            if (action === "add") {
                newStock = Math.max(0, product.packedStock + change);
            } else if (action === "subtract") {
                newStock = Math.max(0, product.packedStock - change);  // Subtract logic
            }
            await updateDoc(productRef, { packedStock: newStock });
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === productId ? { ...p, packedStock: newStock } : p
                )
            );
        }
    };

    const handleAddSupplier = async (e) => {
        e.preventDefault();
    
        // Ensure that all required fields are filled, including the newSupplierId
        if (!newSupplierId || !newSupplier.name || !newSupplier.password || !newSupplier.phone || !newSupplier.cnic) {
            alert('Please fill all the fields.');
            return;
        }
    
        try {
            // Create a supplier reference using newSupplierId
            const supplierRef = doc(db, "suppliers", newSupplierId);
    
            // Set the supplier data using the newSupplier state (excluding the ID)
            await setDoc(supplierRef, {
                name: newSupplier.name,
                password: newSupplier.password,
                phone: newSupplier.phone,
                cnic: newSupplier.cnic,
            });
    
            // Update the suppliers list in the state with the new supplier details
            setSuppliers((prev) => [
                ...prev,
                { ...newSupplier, id: newSupplierId }, // Add the ID back to the supplier object
            ]);
    
            // Clear the input fields and reset modal state
            setNewSupplier({ name: "", password: "", phone: "", cnic: "" });
            setNewSupplierId(""); // Clear the newSupplierId state
            setIsSupplierModalOpen(false); // Close the modal
        } catch (error) {
            console.error("Error adding supplier:", error);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        await signOut(auth);
        router.push("/admin/register");
    };

    // Handle stock update in modal
    const handleUpdateStock = async (e) => {
        e.preventDefault();
        await updateStock(productId, stockChange, action);  // Pass action here
        setIsModalOpen(false); // Close the modal after update
    };

    if (loading) {
        return <div>Loading...</div>; // Show a loading indicator
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="p-4">
                    <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                </div>
                <nav className="flex-1 space-y-2">
                    <a href="#stock" className="block px-4 py-2 hover:bg-gray-700 rounded">
                        Stock Overview
                    </a>
                    <a href="/products" className="block px-4 py-2 hover:bg-gray-700 rounded">
                        Products
                    </a>
                    <a href="#suppliers" className="block px-4 py-2 hover:bg-gray-700 rounded">
                        Suppliers
                    </a>
                    <a href="#transactions" className="block px-4 py-2 hover:bg-gray-700 rounded">
                        Transactions
                    </a>
                    <a href="#reports" className="block px-4 py-2 hover:bg-gray-700 rounded">
                        Reports
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow flex items-center justify-between px-6 py-4">
                    <h1 className="text-xl font-bold">Admin Dashboard</h1>
                    <div className="relative">
                        <img
                            src={user?.photoURL || "/placeholder-user.png"}
                            alt="User Profile"
                            className="w-10 h-10 rounded-full cursor-pointer"
                            onClick={() => setMenuOpen(!menuOpen)}
                        />
                        {menuOpen && (
                            <div className="absolute right-0 mt-2 bg-white shadow-md rounded-lg py-2 w-48">
                                <div className="px-4 py-2">
                                    <p className="font-semibold">{user?.displayName || "Admin"}</p>
                                    <p className="text-sm text-gray-600">{user?.email}</p>
                                </div>
                                <hr />
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6">
                    
                    <section id="transactions" className="mb-6">
                        <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
                            Latest Transactions
                            <button
                                onClick={() => router.push("/transactions")}
                                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                            >
                                More
                            </button>
                        </h2>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border-b px-4 py-2">Transaction ID</th>
                                        <th className="border-b px-4 py-2">Supplier</th>
                                        <th className="border-b px-4 py-2">Amount (PKR)</th>
                                        <th className="border-b px-4 py-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td className="border-b px-4 py-2">{transaction.id}</td>
                                            <td className="border-b px-4 py-2">{transaction.supplierId}</td>
                                            <td className="border-b px-4 py-2">{transaction.totalTransactionPrice}</td>
                                            <td className="border-b px-4 py-2">
                                                {new Date(transaction.timestamp.seconds * 1000).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white p-6 rounded-lg w-96">
                                <h2 className="text-xl font-semibold mb-4">Update Stock</h2>
                                <form onSubmit={handleUpdateStock}>
                                    <input
                                        type="number"
                                        value={stockChange}
                                        onChange={(e) => setStockChange(Number(e.target.value))}
                                        className="border border-gray-300 rounded px-2 py-1 mb-4 w-full"
                                        min="0"
                                    />
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            Update
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Suppliers Section */}
                    <section id="suppliers" className="mb-6">
                        <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
                            Suppliers
                            <button
                                onClick={() => setIsSupplierModalOpen(true)}
                                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                            >
                                +
                            </button>
                        </h2>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border-b px-4 py-2">Supplier Name</th>
                                        <th className="border-b px-4 py-2">Supplier ID</th>
                                        <th className="border-b px-4 py-2">Phone</th>
                                        <th className="border-b px-4 py-2">CNIC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliers.map((supplier) => (
                                        <tr key={supplier.id}>
                                            <td className="border-b px-4 py-2">{supplier.name}</td>
                                            <td className="border-b px-4 py-2">{supplier.id}</td>
                                            <td className="border-b px-4 py-2">{supplier.phone || "N/A"}</td>
                                            <td className="border-b px-4 py-2">{supplier.cnic || "N/A"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Add Supplier Modal */}
                    {isSupplierModalOpen && (
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white p-6 rounded-lg w-96">
                                <h2 className="text-xl font-semibold mb-4">Add Supplier</h2>
                                <form onSubmit={handleAddSupplier}>
                                    <input
                                        type="text"
                                        value={newSupplier.name}
                                        onChange={(e) =>
                                            setNewSupplier((prev) => ({ ...prev, name: e.target.value }))
                                        }
                                        placeholder="Supplier Name"
                                        className="border border-gray-300 rounded px-2 py-1 mb-4 w-full"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={newSupplierId}
                                        onChange={(e) => setNewSupplierId(e.target.value)}
                                        placeholder="Supplier ID"
                                        className="border border-gray-300 rounded px-2 py-1 mb-4 w-full"
                                        required
                                    />
                                    <input
                                        type="password"
                                        value={newSupplier.password}
                                        onChange={(e) =>
                                            setNewSupplier((prev) => ({ ...prev, password: e.target.value }))
                                        }
                                        placeholder="Password"
                                        className="border border-gray-300 rounded px-2 py-1 mb-4 w-full"
                                        required
                                    />
                                    <input
                                        type="tel"
                                        value={newSupplier.phone}
                                        onChange={(e) =>
                                            setNewSupplier((prev) => ({ ...prev, phone: e.target.value }))
                                        }
                                        placeholder="Phone Number"
                                        className="border border-gray-300 rounded px-2 py-1 mb-4 w-full"
                                    />
                                    <input
                                        type="text"
                                        value={newSupplier.cnic}
                                        onChange={(e) =>
                                            setNewSupplier((prev) => ({ ...prev, cnic: e.target.value }))
                                        }
                                        placeholder="CNIC (optional)"
                                        className="border border-gray-300 rounded px-2 py-1 mb-4 w-full"
                                    />
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsSupplierModalOpen(false)}
                                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

<section id="stock" className="mb-6">
                        <h2 className="text-2xl font-bold mb-4">Stock Overview</h2>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border-b px-4 py-2">Product Name</th>
                                        <th className="border-b px-4 py-2">Current Stock</th>
                                        <th className="border-b px-4 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id}>
                                            <td className="border-b px-4 py-2">{product.name}</td>
                                            <td className="border-b px-4 py-2">
                                                {product.packedStock}{" "}
                                                <span
                                                    className={
                                                        product.packedStock < 150
                                                            ? "text-red-600 font-semibold"
                                                            : "text-green-600 font-semibold"
                                                    }
                                                >
                                                    {product.packedStock < 150 ? "low" : "high"}
                                                </span>
                                            </td>
                                            <td className="border-b px-4 py-2 flex space-x-2">
                                                <button
                                                    onClick={() => openModal(product.id, product.packedStock, 'add')}
                                                    className="bg-green-500 text-white px-2 py-1 rounded-md"
                                                >
                                                    Add
                                                </button>
                                                <button
                                                    onClick={() => openModal(product.id, product.packedStock, 'subtract')}
                                                    className="bg-red-500 text-white px-2 py-1 rounded-md"
                                                >
                                                    Subtract
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    
                </main>
            </div>
        </div>
    );
}
