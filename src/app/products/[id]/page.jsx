"use client";

import React, { useState } from "react";
import { auth, db } from "@/lib/firebase"; // Import Firebase config
import { collection, addDoc } from "firebase/firestore";
import { Cloudinary } from 'next-cloudinary'; // Import Cloudinary
import { useRouter } from "next/navigation";

const ProductForm = () => {
  // Form Data
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    unit: "",
    packedStockSize: "",
    productPrice: "",
    productCompany: "",
    productImage: null,
    stockMultiplier: 0,
    stockUnitSize: 0,
    calculatedStock: 0,
  });

  // Dynamic Category List
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [newCategory, setNewCategory] = useState(""); // Input for adding a new category
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = auth.currentUser;
  const router = useRouter();

  
  if(!user) {
    router.push('/login');
  }

  console.log(user.uid)

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "productImage") {
      setFormData({ ...formData, productImage: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Auto-calculate stock
    if (name === "stockMultiplier" || name === "stockUnitSize") {
      const multiplier =
        name === "stockMultiplier" ? value : formData.stockMultiplier;
      const unitSize =
        name === "stockUnitSize" ? value : formData.stockUnitSize;
      const result = multiplier * unitSize;

      setFormData((prev) => ({
        ...prev,
        calculatedStock: isNaN(result) ? 0 : result,
      }));
    }
  };

  // Add new category
  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory(""); // Clear input
    }
  };

  // Delete category
  const handleDeleteCategory = (categoryToDelete) => {
    setCategories(categories.filter((cat) => cat !== categoryToDelete));
  };

  // Handle form submission
  const handleSubmit = async (e) => {

    if(!user) return;

    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = '';
      if (image) {
        // Upload the image to Cloudinary
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET); // Replace with your upload preset
        
        // Make a request to the Cloudinary API
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, 
          {
            method: 'POST',
            body: formData,
          }
        );
        
        const result = await response.json();
        imageUrl = result.secure_url; // Get the secure URL for the uploaded image
      }

      // Save data to Firestore
      await addDoc(collection(db, "products"), {
        productName: formData.productName,
        category: formData.category,
        unit: formData.unit,
        packedStockSize: Number(formData.packedStockSize),
        productPrice: Number(formData.productPrice),
        productCompany: formData.productCompany,
        stockMultiplier: Number(formData.stockMultiplier),
        stockUnitSize: Number(formData.stockUnitSize),
        calculatedStock: Number(formData.calculatedStock),
        productImage: imageUrl,
        createdAt: new Date(),
        createdBy: user.uid,
      });


      alert("Product added successfully!");
      setIsSubmitting(false);

      // Reset form data
      setFormData({
        productName: "",
        category: "",
        unit: "",
        packedStockSize: "",
        productPrice: "",
        productCompany: "",
        productImage: null,
        stockMultiplier: 0,
        stockUnitSize: 0,
        calculatedStock: 0,
      });
    } catch (error) {
      console.error("Error adding product: ", error);
      setIsSubmitting(false);
      alert("Failed to add product. Please try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block font-medium">Product Name</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block font-medium">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Add/Delete Categories */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Add new category"
            className="p-2 border rounded w-full"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {categories.map((cat, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-200 rounded-full flex items-center"
            >
              {cat}
              <button
                type="button"
                onClick={() => handleDeleteCategory(cat)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Unit */}
        <div>
          <label className="block font-medium">Unit</label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Unit</option>
            <option value="Packet">Packet</option>
            <option value="Box">Box</option>
            <option value="Socket">Socket</option>
          </select>
        </div>

        {/* Stock Calculation */}
        <h3 className="text-lg font-semibold mt-4 mb-2">Stock Calculation</h3>
        <div className="grid grid-cols-3 gap-2 items-center">
          <div>
            <label className="block font-medium">Multiplier</label>
            <input
              type="number"
              name="stockMultiplier"
              value={formData.stockMultiplier}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Unit Size</label>
            <input
              type="number"
              name="stockUnitSize"
              value={formData.stockUnitSize}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Result</label>
            <input
              type="number"
              value={formData.calculatedStock}
              readOnly
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>
        </div>

         {/* Packed Stock Size */}
         <div>
          <label className="block font-medium">Packed Stock Size</label>
          <input
            type="number"
            name="packedStockSize"
            value={formData.packedStockSize}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Product Price */}
        <div>
          <label className="block font-medium">Product Price</label>
          <input
            type="number"
            name="productPrice"
            value={formData.productPrice}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Product Company */}
        <div>
          <label className="block font-medium">Product Company</label>
          <input
            type="text"
            name="productCompany"
            value={formData.productCompany}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Product Image */}
        <div>
          <label className="block font-medium">Product Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
            className="mt-1 block w-full"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
