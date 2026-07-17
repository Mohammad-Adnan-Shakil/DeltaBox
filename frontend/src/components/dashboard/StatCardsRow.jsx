import { useNavigate } from "react-router-dom";
import { Users, Flag, Calendar, Brain } from "lucide-react";
import StatCard from "../common/StatCard";

export const StatCardsRow = ({
  driversCount = 0,
  totalRaces = 0,
  completedRaces = 0,
  modelAccuracy = 0,
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Drivers" value={driversCount} icon={Users} color="red" onClick={() => navigate("/drivers")} />
      <StatCard label="Races" value={totalRaces} icon={Calendar} color="blue" onClick={() => navigate("/races")} />
      <StatCard
        label="Completed"
        value={completedRaces}
        icon={Flag}
        color="green"
        trend={totalRaces > 0 ? Math.round((completedRaces / totalRaces) * 100) : 0}
      />
      {modelAccuracy > 0 && (
        <StatCard
          label="Model Accuracy"
          value={modelAccuracy}
          icon={Brain}
          color="yellow"
        />
      )}
    </div>
  );
};

export default StatCardsRow;
