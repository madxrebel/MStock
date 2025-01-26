import { useState } from "react";

const Products = ({ products, openModal, router, uid }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState(""); // New state for stock filtering

  const filteredProducts = products.filter((product) => {
    const status = product.stockMultiplier < 150 ? "low" : "high";
    const matchesSearchTerm =
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(product.price).includes(searchTerm) ||
      status.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStockFilter =
      stockFilter === "" ||
      (stockFilter === "greater" && product.stockMultiplier > 150) ||
      (stockFilter === "less" && product.stockMultiplier <= 150);

    const matchesCreatedBy = product.createdBy === uid;

    return matchesSearchTerm && matchesStockFilter && matchesCreatedBy;
  });

  return (
    <>
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
        {filteredProducts.length > 0 ? (
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
                  <td className="border-b px-4 py-2">{product.productName}</td>
                  <td className="border-b px-4 py-2">
                    {product.stockMultiplier}{" "}
                    <span
                      className={
                        product.stockMultiplier < 150
                          ? "text-red-600 font-semibold"
                          : "text-green-600 font-semibold"
                      }
                    >
                      {product.stockMultiplier < 150 ? "low" : "high"}
                    </span>
                  </td>
                  <td className="border-b px-4 py-2 flex space-x-2">
                    <button
                      onClick={() =>
                        openModal(product.id, product.stockMultiplier, "add")
                      }
                      className="bg-green-500 text-black px-2 py-1 rounded-md"
                    >
                      Add
                    </button>
                    <button
                      onClick={() =>
                        openModal(product.id, product.stockMultiplier, "subtract")
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
        ) : (
          <p className="text-center text-gray-500">
            No products available. Please add some.
          </p>
        )}
      </div>
    </>
  );
};

export default Products;
