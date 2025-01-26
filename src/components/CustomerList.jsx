import { getCustomers } from '../lib/firebase';

export async function CustomerList({ supplierId }) {
  const customers = await getCustomers(supplierId);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900">Customer List</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {customers.map((customer) => (
          <li key={customer.id} className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {customer.name}
                </p>
                <p className="text-sm text-gray-500 truncate">{customer.email}</p>
              </div>
              <div className="inline-flex items-center text-sm text-gray-500">
                {customer.orderCount} orders
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}