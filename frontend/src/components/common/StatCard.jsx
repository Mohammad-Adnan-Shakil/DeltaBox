import Card from "./Card";

export const StatCard = ({ label, value, icon: Icon, trend = null, color = "red" }) => {
  const colorClasses = {
    red: "text-red-500",
    blue: "text-blue-500",
    green: "text-green-500",
    yellow: "text-yellow-500",
  };

  return (
    <Card hover className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{label}</p>
        <p className={`text-4xl font-bold ${colorClasses[color]} mt-2`}>{value}</p>
        {trend && (
          <p className={`text-xs mt-2 ${trend > 0 ? "text-green-500" : "text-red-500"}`}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% from last season
          </p>
        )}
      </div>
      {Icon && <Icon className={`text-3xl ${colorClasses[color]} opacity-50`} />}
    </Card>
  );
};

export default StatCard;
