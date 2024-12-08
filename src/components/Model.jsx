import React from 'react'

export const Model = ({ isModalOpen, setIsModalOpen, handleUpdateStock, setStockChange, stockChange }) => {
  return (
    <>
        {isModalOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg w-96">
                    <h2 className="text-xl font-semibold mb-4">Update Stock</h2>
                    <form onSubmit={handleUpdateStock}>
                        <input
                            type="number"
                            value={stockChange}
                            onChange={setStockChange}
                            className="border border-gray-300 rounded px-2 py-1 mb-4 w-full"
                            min="0"
                        />
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={setIsModalOpen}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </>
  )
}
