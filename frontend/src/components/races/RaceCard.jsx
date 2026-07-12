import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Card, Badge } from "../common";
import { formatRaceDate } from "../../utils/formatters";

export const RaceCard = ({ race, index = 0 }) => {
  const navigate = useNavigate();
  const isCompleted = race.status === "COMPLETED";

  return (
    <Card
      onClick={() => navigate(`/races/${race.raceId}`)}
      delay={index * 0.05}
      className="relative cursor-pointer"
    >
      {isCompleted && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full bg-[var(--color-accent-500)]" />
      )}
      <div className="grid grid-cols-[48px_1fr_auto] items-center gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${
            isCompleted
              ? "border-[var(--color-accent-500)]/30 bg-[var(--color-accent-500)]/10 text-[var(--color-text-accent)]"
              : "border-[var(--color-glass-border)] bg-[var(--color-base-700)] text-[var(--color-text-secondary)]"
          }`}
        >
          {race.round}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-[var(--color-text-primary)]">
            {race.raceName}
          </h3>
          <p className="truncate text-sm text-[var(--color-text-secondary)]">{race.circuitName}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
            <MapPin className="h-3 w-3" /> {race.location}, {race.country}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="font-mono text-xs text-[var(--color-text-tertiary)]">
            {formatRaceDate(race.date)}
          </span>
          <Badge variant={isCompleted ? "completed" : "scheduled"} size="sm">
            {isCompleted ? "Completed" : "Scheduled"}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default RaceCard;
