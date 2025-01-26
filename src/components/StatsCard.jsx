const StatsCard = ({ title, value, bgColor }) => (
    <div className={`${bgColor} text-white p-4 rounded-lg shadow`}>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-3xl">{value}</p>
    </div>
  );
  
  export default StatsCard;
  