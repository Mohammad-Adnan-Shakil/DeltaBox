import { useMemo } from "react";
import { Calendar, MapPin, Timer } from "lucide-react";
import CountdownTimer from "../races/CountdownTimer";

export const NextRaceWidget = ({ races = [] }) => {
  const nextRace = useMemo(() => {
    const now = new Date();
    return races
      .filter((r) => r.status === "SCHEDULED" && new Date(r.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  }, [races]);

  if (!nextRace) {
    return (
      <div className="rounded-[var(--radius-lg)] p-[var(--space-6)] bg-[var(--color-glass-bg)] border border-[var(--color-accent-500)]/20 shadow-[var(--shadow-glow-sm)]">
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
          <Calendar className="h-8 w-8 text-[var(--color-text-tertiary)]" />
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Season Complete
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            All races have been completed for this season.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] p-[var(--space-6)] bg-[var(--color-glass-bg)] border border-[var(--color-accent-500)]/20 shadow-[var(--shadow-glow-sm)]">
      <div className="flex items-center gap-2 mb-3">
        <Timer className="h-4 w-4 text-[var(--color-text-accent)]" />
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-accent)]">
          Next Race
        </span>
      </div>
      <h3 className="text-lg font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
        {nextRace.raceName}
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{nextRace.circuitName}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
        <MapPin className="h-3 w-3" /> {nextRace.location}, {nextRace.country}
      </p>
      <div className="mt-4 border-t border-[var(--color-glass-border)] pt-4">
        <CountdownTimer targetDate={nextRace.date} />
      </div>
    </div>
  );
};

export default NextRaceWidget;
