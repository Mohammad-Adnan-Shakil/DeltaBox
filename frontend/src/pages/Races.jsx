import { useMemo, useState } from "react";
import { CalendarClock, Search } from "lucide-react";
import { EmptyState, ErrorState, LoadingState } from "../components/common";
import { RaceCard } from "../components/races";
import useFetch from "../hooks/useFetch";
import usePageTitle from "../hooks/usePageTitle";

const Races = () => {
  usePageTitle("Races");

  const { data, loading, error, refetch } = useFetch("/races");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const races = (data || []).slice().sort((a, b) => (a.round ?? 999) - (b.round ?? 999));
  const completed = races.filter((race) => race.status === "COMPLETED");
  const scheduled = races.filter((race) => race.status !== "COMPLETED");

  const filtered = useMemo(() => {
    const token = search.toLowerCase();
    let filteredRaces = races.filter((race) => {
      return (
        race.raceName?.toLowerCase().includes(token) ||
        race.circuitName?.toLowerCase().includes(token) ||
        race.location?.toLowerCase().includes(token)
      );
    });
    if (filter === "completed") return filteredRaces.filter(r => r.status === "COMPLETED");
    if (filter === "upcoming") return filteredRaces.filter(r => r.status !== "COMPLETED");
    return filteredRaces;
  }, [races, search, filter]);

  if (loading) return <LoadingState message="Loading race calendar..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!races.length) return <EmptyState title="No races found" description="No race calendar rows available." />;

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-elevated)] p-4 md:p-6 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-accentRed" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-label">Season Calendar</p>
            <div className="mt-2 flex items-center gap-3">
              <CalendarClock className="h-5 w-5 text-accentRed md:h-6 md:w-6" />
              <h1 className="font-display font-bold text-2xl uppercase tracking-widest sm:text-3xl md:text-4xl">2026 RACE CALENDAR</h1>
            </div>
            <div className="mt-1 h-[2px] w-16 bg-accentRed"></div>
            <p className="mt-2 text-xs text-text-muted tracking-widest uppercase sm:text-sm">{completed.length} completed · {scheduled.length} scheduled</p>
          </div>

          <div className="flex gap-3 w-full lg:w-auto lg:items-end">
            <div className="relative flex-1 lg:w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search race, circuit or location"
                className="surface-input pl-10"
              />
            </div>
          </div>
        </div>
        {/* Filter chips */}
        <div className="flex gap-2 mt-4">
          {["all", "completed", "upcoming"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all uppercase tracking-wider ${
                filter === f
                  ? 'bg-accentRed text-white'
                  : 'bg-[var(--color-bg-hover)] text-text-secondary hover:text-whitePrimary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <EmptyState title="No matching races" description="Try different keywords or clear filters." />
      ) : (
        <section className="space-y-3">
          {filtered.map((race, index) => (
            <RaceCard
              key={race.raceId || `${race.round}-${index}`}
              race={race}
              index={index}
            />
          ))}
        </section>
      )}
    </div>
  );
};

export default Races;
