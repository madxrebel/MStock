import { useState } from "react";

const Products = ({ products, openModal, router, uid }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState(""); // New state for stock filtering

  const filteredProducts = products.filter((product) => {
    const status = product.packedStock < 150 ? "low" : "high";
    const matchesSearchTerm =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(product.price).includes(searchTerm) ||
      status.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStockFilter =
      stockFilter === "" ||
      (stockFilter === "greater" && product.packedStock > 150) ||
      (stockFilter === "less" && product.packedStock <= 150);

    const matchesCreatedBy = product.createdBy === uid;

    return matchesSearchTerm && matchesStockFilter && matchesCreatedBy;
  });

  return (
    <section id="stock" className="mb-6">
      <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
        Stock Overview
        <button
          onClick={() => router.push(`/products/${uid}`)}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
        >
          +
        </button>
      </h2>
      {/* Search Inputs */}
      <div className="mb-4 flex space-x-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, price, or status"
          className="w-full p-2 border rounded-md shadow-sm"
        />
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="p-2 border rounded-md shadow-sm"
        >
          <option value="">All Stocks</option>
          <option value="greater">Stock &gt; 150</option>
          <option value="less">Stock &lt; 150</option>
        </select>
      </div>
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
            {filteredProducts.map((product) => (
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
                    onClick={() =>
                      openModal(product.id, product.packedStock, "add")
                    }
                    className="bg-green-500 text-black px-2 py-1 rounded-md"
                  >
                    Add
                  </button>
                  <button
                    onClick={() =>
                      openModal(product.id, product.packedStock, "subtract")
                    }
                    className="bg-red-500 text-black px-2 py-1 rounded-md"
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
  );
};

export default Products;
