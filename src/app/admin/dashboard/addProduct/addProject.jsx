"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AddProduct() {
  const [productType, setProductType] = useState("unpacked"); // Default type

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = Object.fromEntries(formData.entries());
    productData.initialStock = Number(productData.initialStock);
    productData.currentStock = Number(productData.currentStock);
    if (productType === "prepacked") {
      productData.costPrice = Number(productData.costPrice);
    }

    try {
      await addDoc(collection(db, "products"), {
        ...productData,
        createdAt: new Date(),
      });
      alert("Product added successfully!");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Product Type Selector */}
        <div>
          <label className="font-semibold">Product Type</label>
          <select
            name="productType"
            className="w-full border rounded p-2"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
          >
            <option value="unpacked">Unpacked Product</option>
            <option value="prepacked">Prepacked Product</option>
          </select>
        </div>

        {/* Common Fields */}
        <div>
          <label className="font-semibold">Product Name</label>
          <input
            type="text"
            name="productName"
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="font-semibold">Category</label>
          <input
            type="text"
            name="category"
            className="w-full border rounded p-2"
            placeholder="E.g., Detergents, Spices"
            required
          />
        </div>

        <div>
          <label className="font-semibold">Current Stock</label>
          <input
            type="number"
            name="currentStock"
            className="w-full border rounded p-2"
            placeholder="E.g., 50"
            required
          />
        </div>

        {/* Fields for Unpacked Products */}
        {productType === "unpacked" && (
          <>
            <div>
              <label className="font-semibold">Unit</label>
              <input
                type="text"
                name="unit"
                className="w-full border rounded p-2"
                placeholder="E.g., Bags, Kg"
                required
              />
            </div>

            <div>
              <label className="font-semibold">Initial Stock</label>
              <input
                type="number"
                name="initialStock"
                className="w-full border rounded p-2"
                placeholder="E.g., 25 (bags/kg)"
                required
              />
            </div>

            <div>
              <label className="font-semibold">Conversion Rate</label>
              <input
                type="text"
                name="conversionRate"
                className="w-full border rounded p-2"
                placeholder="E.g., 1 bag to 200g packets"
                required
              />
            </div>
          </>
        )}

        {/* Fields for Prepacked Products */}
        {productType === "prepacked" && (
          <>
            <div>
              <label className="font-semibold">Unit</label>
              <input
                type="text"
                name="unit"
                className="w-full border rounded p-2"
                placeholder="E.g., Packets"
                required
              />
            </div>

            <div>
              <label className="font-semibold">Initial Stock</label>
              <input
                type="number"
                name="initialStock"
                className="w-full border rounded p-2"
                placeholder="E.g., 100 (packets)"
                required
              />
            </div>

            <div>
              <label className="font-semibold">Cost Price</label>
              <input
                type="number"
                name="costPrice"
                className="w-full border rounded p-2"
                placeholder="E.g., Price per unit"
                required
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white rounded p-2 font-semibold"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}
