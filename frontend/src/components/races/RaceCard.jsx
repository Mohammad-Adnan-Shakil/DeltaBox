import { useState } from "react";
import { MapPin } from "lucide-react";
import { Card } from "../common";
import { formatRaceDate } from "../../utils/formatters";
import RaceResultModal from "./RaceResultModal";
import useFetch from "../../hooks/useFetch";

const RaceCard = ({ race, index }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: results } = useFetch(
    isModalOpen ? `/races/${race.raceId}/results` : null
  );

  const isCompleted = race.status === "COMPLETED";
  const isClickable = isCompleted;

  const handleCardClick = () => {
    if (isClickable) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        className={`relative transition-all duration-200 ${
          isClickable
            ? "hover:translate-y-[-2px] cursor-pointer"
            : "opacity-60 cursor-not-allowed"
        }`}
        delay={index * 0.05}
      >
        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full" style={{ background: isCompleted ? 'var(--color-accent-green)' : 'var(--color-border-default)' }} />
        <div className="grid grid-cols-[64px_1fr] items-center gap-4 sm:grid-cols-[64px_1fr_auto]">
          {/* Round Badge */}
          <div
            className={`font-display font-bold uppercase tracking-wide flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold ${
              isCompleted
                ? "border-[var(--color-accent-green)] bg-[var(--color-accent-green)]/20 text-[var(--color-accent-green)]"
                : "border-[var(--color-border-default)] bg-[var(--color-bg-hover)] text-text-secondary"
            }`}
          >
            {race.round}
          </div>

          {/* Race Info */}
          <div>
            <h2 className="text-lg font-semibold text-whitePrimary sm:text-xl">
              {race.raceName}
            </h2>
            <p className="text-sm text-text-secondary">{race.circuitName}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
              <MapPin className="h-3.5 w-3.5" /> {race.location}, {race.country}
            </p>
          </div>

          {/* Date and Status */}
          <div className="text-right">
            <p className="font-mono text-sm text-text-muted">
              {formatRaceDate(race.date)}
            </p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-green)]/20 px-2 py-1 text-[var(--color-accent-green)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-accent-green)]" /> COMPLETED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-bg-hover)] px-2 py-1 text-text-muted">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-text-muted" /> SCHEDULED
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <RaceResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        race={race}
        results={results}
      />
    </>
  );
};

export default RaceCard;
