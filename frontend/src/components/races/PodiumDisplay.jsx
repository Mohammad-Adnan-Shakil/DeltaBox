import { Badge } from "../common";
import { teamColor } from "../../utils/formatters";

export const PodiumDisplay = ({ results = [] }) => {
  if (!results || results.length === 0) return null;

  const top3 = results.slice(0, 3);
  const [p1, p2, p3] = top3;

  return (
    <div className="flex items-end justify-center gap-2 py-8 sm:gap-4">
      {p2 && (
        <div className="flex flex-col items-center gap-2 order-1">
          <div className="flex flex-col items-center">
            <Badge variant="p2" size="md">P2</Badge>
            <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">{p2.name}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{p2.team}</p>
            <p className="mt-1 font-mono text-sm font-bold text-[var(--color-text-secondary)]">{p2.points} pts</p>
          </div>
          <div className="h-28 w-20 rounded-t-xl border border-[var(--color-glass-border)]" style={{ backgroundColor: teamColor(p2.team) }} />
        </div>
      )}

      {p1 && (
        <div className="flex flex-col items-center gap-2 order-2">
          <div className="flex flex-col items-center">
            <Badge variant="p1" size="md">P1</Badge>
            <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">{p1.name}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{p1.team}</p>
            <p className="mt-1 font-mono text-sm font-bold text-[var(--color-data-warning)]">{p1.points} pts</p>
          </div>
          <div className="h-40 w-20 rounded-t-xl border" style={{ backgroundColor: teamColor(p1.team), borderColor: teamColor(p1.team) }} />
        </div>
      )}

      {p3 && (
        <div className="flex flex-col items-center gap-2 order-3">
          <div className="flex flex-col items-center">
            <Badge variant="p3" size="md">P3</Badge>
            <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">{p3.name}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{p3.team}</p>
            <p className="mt-1 font-mono text-sm font-bold text-[var(--color-text-secondary)]">{p3.points} pts</p>
          </div>
          <div className="h-20 w-20 rounded-t-xl border border-[var(--color-glass-border)]" style={{ backgroundColor: teamColor(p3.team) }} />
        </div>
      )}
    </div>
  );
};

export default PodiumDisplay;
