"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const SupplierLoginPage = () => {
  const [supplierId, setSupplierId] = useState("");
  const [password, setPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Fetch the supplier document based on the document ID (supplierId)
      const supplierRef = doc(db, "suppliers", supplierId);
      const supplierSnapshot = await getDoc(supplierRef);

      if (!supplierSnapshot.exists()) {
        setError("Invalid Supplier ID");
        setLoading(false);
        return;
      }

      const supplierData = supplierSnapshot.data();

      // Verify the password
      if (supplierData.password !== password) {
        setError("Invalid Password");
        setLoading(false);
        return;
      }

      // Fetch admin email by matching the createdBy field with the document ID in the users collection
      const userRef = doc(db, "users", supplierData.createdBy);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        setError("Admin Email not found for this Supplier");
        setLoading(false);
        return;
      }

      const userData = userSnapshot.data();

      // Verify the admin email
      if (userData.email !== adminEmail) {
        setError("Admin Email does not match");
        setLoading(false);
        return;
      }

      // Login successful, redirect to the supplier dashboard
      router.push(`/suppliers/dashboard/${supplierId}`);
    } catch (err) {
      console.error("Error logging in:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Supplier Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="adminEmail" className="block font-medium mb-2">
              Admin Email
            </label>
            <input
              type="email"
              id="adminEmail"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="supplierId" className="block font-medium mb-2">
              Supplier ID
            </label>
            <input
              type="text"
              id="supplierId"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full p-2 text-white font-bold rounded ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupplierLoginPage;
