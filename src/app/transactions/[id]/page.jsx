"use client";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

const TransactionDetail = () => {
  const params = useParams();
  const { id } = params;
  const router = useRouter();

  const [transaction, setTransaction] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      console.error("No transaction ID provided in route.");
      setLoading(false);
      return;
    }

    const fetchTransactionDetails = async () => {
      try {
        const transactionDoc = await getDoc(doc(db, "transactions", id));
        if (!transactionDoc.exists()) {
          console.error("Transaction not found");
          setLoading(false);
          return;
        }
        const transactionData = transactionDoc.data();
        setTransaction({ id: transactionDoc.id, ...transactionData });

        if (transactionData.supplierId) {
          const supplierDoc = await getDoc(doc(db, "suppliers", transactionData.supplierId));
          setSupplier(supplierDoc.exists() ? supplierDoc.data() : { name: "Unknown Supplier" });
        }

        if (transactionData.items && Array.isArray(transactionData.items)) {
          const resolvedProducts = transactionData.items.map(item => ({
            ...item,
            remaining: item.unitAmount - item.sold - item.returned, // Updated to use unitAmount
            hasError: false, // Track field error state
            hasBeenEdited: item.hasBeenEdited || false, // Fetch editable status from the database
          }));
          setProducts(resolvedProducts);
        }
      } catch (error) {
        console.error("Error fetching transaction details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [id]);

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    const product = updatedProducts[index];

    // Update field value
    let newValue = parseInt(value) || 0;

    // Validate against unitAmount
    if (newValue > product.unitAmount) {
      product.hasError = true; // Set error flag
      newValue = product.unitAmount; // Limit value to unitAmount
    } else {
      product.hasError = false; // Clear error flag
    }

    product[field] = newValue;

    // Recalculate dependent field based on changes to sold or returned
    if (field === "sold") {
      product.returned = product.unitAmount - product.sold;
    } else if (field === "returned") {
      product.sold = product.unitAmount - product.returned;
    }

    setProducts(updatedProducts);
  };

  const handleSave = async () => {
    try {
      // Calculate totalSoldPrice
      const totalSoldPrice = products.reduce((total, product) => {
        return total + (product.price * product.sold);
      }, 0);
  
      // Prepare the updated items with the changes
      const updatedItems = products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        sold: product.sold,
        returned: product.returned,
        unitAmount: product.unitAmount,
        hasBeenEdited: true, // Mark as edited after saving
      }));
  
      // Update the transaction in Firestore with totalSoldPrice
      await updateDoc(doc(db, "transactions", id), {
        items: updatedItems,
        totalSoldPrice: totalSoldPrice, // Add the totalSoldPrice field
      });
  
      alert("Transaction updated successfully!");
  
      // Update local state to reflect saved changes
      const updatedProducts = products.map((product) => ({
        ...product,
        hasBeenEdited: true, // Lock fields after successful save
      }));
      setProducts(updatedProducts);
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  if (loading) return <div>Loading transaction details...</div>;
  if (!transaction) return <div>Transaction not found.</div>;

  const canEdit = products.some((product) => !product.hasBeenEdited);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 flex justify-between items-center">
        Transaction Details
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
        >
          Back to dashboard
        </button>
      </h1>

      {/* Transaction Information */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Transaction Information</h2>
        <p><strong>Transaction ID:</strong> {transaction.id}</p>
        <p><strong>Total Amount:</strong> {transaction.totalTransactionPrice} PKR</p>
        <p><strong>Total Sold Price:</strong> {transaction.totalSoldPrice} PKR</p> {/* New field */}
        <p><strong>Date:</strong> {new Date(transaction.timestamp.seconds * 1000).toLocaleDateString()}</p>
      </div>

      {/* Supplier Information */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Supplier Information</h2>
        {supplier ? (
          <>
            <p><strong>Name:</strong> {supplier.name}</p>
            <p><strong>ID:</strong> {transaction.supplierId}</p>
          </>
        ) : (
          <p>No supplier information available.</p>
        )}
      </div>

      {/* Product Information */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Product Information</h2>
        {products.length > 0 ? (
          <table className="min-w-full table-auto">
            <thead className="border-b">
              <tr>
                <th className="px-4 py-2 text-left">Item</th>
                <th className="px-4 py-2 text-left">Unit Amount</th>
                <th className="px-4 py-2 text-left">Sold</th>
                <th className="px-4 py-2 text-left">Returned</th>
                <th className="px-4 py-2 text-left">Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id} className="border-b">
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.unitAmount}</td>
                  <td className="px-4 py-2">
                    {product.hasBeenEdited ? (
                      <span>{product.sold}</span>
                    ) : (
                      <input
                        type="number"
                        value={product.sold}
                        onChange={(e) => handleProductChange(index, "sold", e.target.value)}
                        className={`border px-2 py-1 rounded ${product.hasError && "border-red-500"}`}
                      />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {product.hasBeenEdited ? (
                      <span>{product.returned}</span>
                    ) : (
                      <input
                        type="number"
                        value={product.returned}
                        onChange={(e) => handleProductChange(index, "returned", e.target.value)}
                        className={`border px-2 py-1 rounded ${product.hasError && "border-red-500"}`}
                      />
                    )}
                  </td>
                  <td className="px-4 py-2">{product.price * product.sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No product information available.</p>
        )}
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="mt-6">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionDetail;
