const Transactions = ({ transactions, router, uid }) => {
  return (
        <section id="transactions" className="mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center justify-between">
                Latest Transactions
                <div>
                    <button
                    onClick={() => router.push(`/new-transaction/${uid}`)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                    >
                    New
                    </button>
                    <button
                    onClick={() => router.push(`/transactions?uid=${uid}`)}
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
                    <th className="border-b px-4 py-2">Transaction ID</th>
                    <th className="border-b px-4 py-2">Supplier ID</th>
                    <th className="border-b px-4 py-2">Supplier Name</th>
                    <th className="border-b px-4 py-2">Amount (PKR)</th>
                    <th className="border-b px-4 py-2">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                        <td className="border-b px-4 py-2">{transaction.id}</td>
                        <td className="border-b px-4 py-2">{transaction.supplierId}</td>
                        <td className="border-b px-4 py-2">{transaction.supplierName}</td>
                        <td className="border-b px-4 py-2">{transaction.totalTransactionPrice}</td>
                        <td className="border-b px-4 py-2">
                        {new Date(transaction.timestamp.seconds * 1000).toLocaleDateString()}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </section>
  ) ;
};

export default Transactions;
