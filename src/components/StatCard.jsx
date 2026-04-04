const StatCard = ({ title, value }) => {
  return (
    <div className="bg-[#1A1A22] p-6 rounded-xl 
                    hover:scale-[1.02] 
                    hover:shadow-[0_0_20px_rgba(225,6,0,0.2)] 
                    transition duration-300 cursor-pointer">

      <div className="w-10 h-1 bg-[#E10600] rounded mb-4"></div>

      <h2 className="text-gray-400 text-sm">{title}</h2>
      <p className="text-3xl font-bold mt-3">{value}</p>

    </div>
  );
};

export default StatCard;