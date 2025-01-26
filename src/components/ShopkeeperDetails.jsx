const ShopkeeperDetails = ({ shopkeeperData }) => (
    <div className="p-4 bg-gray-100 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Shopkeeper Details</h2>
      <ul>
        <li><strong>Name:</strong> {shopkeeperData.name}</li>
        <li><strong>Contact:</strong> {shopkeeperData.contact}</li>
        <li><strong>Address:</strong> {shopkeeperData.address}</li>
      </ul>
    </div>
  );
  
export default ShopkeeperDetails;
  