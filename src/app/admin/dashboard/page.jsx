"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, setDoc, getDoc, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Transactions, Suppliers, Products } from "@/sections"
import { Model, Header, Sidebar } from "@/components"

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

    useEffect(() => {
        if (!user) return; // Ensure user is available before fetching data
      
        const fetchProducts = async () => {
          const productsQuery = query(collection(db, "products"), where("createdBy", "==", user.uid));
          const productsSnapshot = await getDocs(productsQuery);
          const productsData = productsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          const sortedProducts = productsData.sort((a, b) => a.packedStock - b.packedStock);
          setProducts(sortedProducts);
        };
      
        const fetchSuppliers = async () => {
          const suppliersQuery = query(collection(db, "suppliers"), where("createdBy", "==", user.uid));
          const suppliersSnapshot = await getDocs(suppliersQuery);
          const suppliersData = suppliersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSuppliers(suppliersData);
        };
      
        const fetchTransactions = async () => {
          try {
            const transactionsQuery = query(collection(db, "transactions"), where("createdBy", "==", user.uid));
            const transactionsSnapshot = await getDocs(transactionsQuery);
            const transactionsData = await Promise.all(
              transactionsSnapshot.docs.map(async (docSnapshot) => {
                const transaction = { id: docSnapshot.id, ...docSnapshot.data() };
      
                // Fetch supplier name
                if (transaction.supplierId) {
                  const supplierDocRef = doc(db, "suppliers", transaction.supplierId); // Create a document reference
                  const supplierDoc = await getDoc(supplierDocRef); // Fetch the document data
                  transaction.supplierName = supplierDoc.exists() ? supplierDoc.data().name : "Unknown Supplier";
                } else {
                  transaction.supplierName = "Unknown Supplier";
                }
      
                return transaction;
              })
            );
      
            // Sort by createdAt and limit to top 10
            const sortedTransactions = transactionsData
              .sort((a, b) => b.createdAt - a.createdAt)
              .slice(0, 10);
      
            setTransactions(sortedTransactions);
          } catch (error) {
            console.error("Error fetching transactions:", error);
          }
        };
      
        Promise.all([fetchProducts(), fetchSuppliers(), fetchTransactions()]).finally(() => {
          setLoading(false); // Set loading to false after data fetching completes
        });
    }, [db, user]);

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
                createdBy: user.uid, 
            });
    
            // Update the suppliers list in the state with the new supplier details
            setSuppliers((prev) => [
                ...prev,
                { ...newSupplier, id: newSupplierId, createdBy: user.uid,  }, // Add the ID back to the supplier object
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
        router.push("/login");
    };

    // Handle stock update in modal
    const handleUpdateStock = async (e) => {
        e.preventDefault();
        await updateStock(productId, stockChange, action);  // Pass action here
        setIsModalOpen(false); // Close the modal after update
    };

    if (loading) {
        return (
          <div className="flex h-screen bg-gray-100 items-center justify-center">
            <div className="text-2xl font-bold text-gray-600">Loading...</div>
          </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <Header handleLogout={handleLogout} setMenuOpen={() => setMenuOpen(!menuOpen)} user={user} menuOpen={menuOpen} />

                {/* Content */}
                <main className="flex-1 p-6">
                    
                    {/* Transactions Section */}
                    <Transactions transactions={transactions} router={router} uid={user.uid} />

                    {/* Modal */}
                    <Model isModalOpen={isModalOpen} setIsModalOpen={() => setIsModalOpen(false)} handleUpdateStock={handleUpdateStock} setStockChange={(e) => setStockChange(Number(e.target.value))} stockChange={stockChange} />

                    {/* Suppliers Section */}
                    <Suppliers suppliers={suppliers} setIsSupplierModalOpen={() => setIsSupplierModalOpen(true)}/>

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
                                        placeholder="CNIC"
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
                    
                    {/* Products Section */}
                    <Products products={products} openModal={openModal} router={router} uid={user.uid} />
                    
                </main>
            </div>
        </div>
    );
}
