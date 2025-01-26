const DealerDetails = ({ dealerData }) => (
    <div className="p-4 bg-gray-100 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Dealer Details</h2>
      <ul>
        <li><strong>Name:</strong> {dealerData.name}</li>
        <li><strong>Contact:</strong> {dealerData.contact}</li>
        <li><strong>Address:</strong> {dealerData.address}</li>
      </ul>
    </div>
  );
  
  export default DealerDetails;
  