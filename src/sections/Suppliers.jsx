const Suppliers = ({ suppliers, setIsSupplierModalOpen, uid, router }) => {
  return (
        <section id="suppliers" className="mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
                Suppliers
                <div>
                    <button
                        onClick={setIsSupplierModalOpen}
                        className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                    >
                        +
                    </button>
                    <button
                        onClick={() => router.push(`/suppliers?uid=${uid}`)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                        >
                        More
                    </button>
                </div>
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
    );
};

export default Suppliers;
