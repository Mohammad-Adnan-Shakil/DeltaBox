import { useMemo } from "react";
import RaceCard from "./RaceCard";

export const RaceCardGrid = ({ races = [], filter = "all" }) => {
  const filtered = useMemo(() => {
    if (filter === "all") return races;
    return races.filter((r) =>
      filter === "completed"
        ? r.status === "COMPLETED"
        : r.status === "SCHEDULED"
    );
  }, [races, filter]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map((race, i) => (
        <RaceCard key={race.raceId || i} race={race} index={i} />
      ))}
    </div>
  );
};

export default RaceCardGrid;
