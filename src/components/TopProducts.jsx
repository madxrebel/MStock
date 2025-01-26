import { useEffect, useState } from 'react';
import { getTopProducts } from '../lib/firebase';

export function TopProducts({ supplierId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getTopProducts(supplierId);
      setProducts(data);
    };
    fetchProducts();
  }, [supplierId]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {products.map((product) => (
          <li key={product.id} className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {product.productName}
                </p>
                <p className="text-sm text-gray-500 truncate">{product.category}</p>
              </div>
              <div className="inline-flex items-center text-base font-semibold text-gray-900">
                {product.soldQuantity} sold
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
