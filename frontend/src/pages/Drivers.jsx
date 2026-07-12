import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Card, LoadingState, ErrorState, EmptyState } from "../components/common";
import useFetch from "../hooks/useFetch";
import usePageTitle from "../hooks/usePageTitle";
import { nationalityFlag, teamColor } from "../utils/formatters";

const positionBadgeClass = (position) => {
  if (position === 1) return "bg-gradient-to-br from-[var(--color-accent-gold)] to-amber-600 text-black text-xs font-black px-2 py-1 rounded-full shadow-[0_0_8px_rgba(255,215,0,0.4)]";
  if (position === 2) return "bg-gray-400 text-black text-xs font-black px-2 py-1 rounded-full";
  if (position === 3) return "bg-amber-700 text-white text-xs font-black px-2 py-1 rounded-full";
  return "bg-[var(--color-bg-hover)] text-text-secondary text-xs font-black px-2 py-1 rounded-full";
};

const Drivers = () => {
  usePageTitle("Drivers");

  const { data, loading, error, refetch } = useFetch("/drivers");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("points");

  const drivers = data || [];

  const filteredDrivers = useMemo(() => {
    const token = search.toLowerCase();

    return drivers
      .filter((driver) => {
        return (
          driver.name?.toLowerCase().includes(token) ||
          driver.code?.toLowerCase().includes(token) ||
          driver.team?.toLowerCase().includes(token)
        );
      })
      .sort((a, b) => {
        const aValue = a[sortBy] ?? 0;
        const bValue = b[sortBy] ?? 0;

        if (typeof aValue === "string") return aValue.localeCompare(bValue);
        return Number(bValue) - Number(aValue);
      });
  }, [drivers, search, sortBy]);

  const maxPoints = useMemo(() => Math.max(...filteredDrivers.map(d => Number(d.points || 0)), 1), [filteredDrivers]);

  if (loading) return <LoadingState message="Loading driver standings..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!drivers.length) return <EmptyState title="No drivers found" description="No season driver data available." />;

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-elevated)] p-4 md:p-6 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-accentRed" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-label">Championship</p>
            <div className="mt-2 flex items-center gap-3">
              <svg viewBox="0 0 64 24" className="h-5 w-12 text-accentRed md:h-6 md:w-14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 18H16L24 10H40L47 18H62" />
                <circle cx="14" cy="18" r="3" />
                <circle cx="49" cy="18" r="3" />
              </svg>
              <h1 className="font-display font-bold text-2xl uppercase tracking-widest sm:text-3xl md:text-4xl">DRIVER STANDINGS</h1>
            </div>
            <div className="mt-1 h-[2px] w-16 bg-accentRed"></div>
            <p className="mt-2 text-xs text-text-muted tracking-widest uppercase sm:text-sm">{drivers.length} drivers · 2026 season</p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 md:w-auto md:grid-cols-[280px_170px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search drivers"
                aria-label="Search drivers"
                className="surface-input pl-10"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="surface-input"
            >
              <option value="points">Sort: Points</option>
              <option value="name">Sort: Name</option>
              <option value="team">Sort: Team</option>
            </select>
          </div>
        </div>
      </section>

      {filteredDrivers.length === 0 ? (
        <EmptyState title="No matching drivers" description="Try a different search value." />
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDrivers.map((driver, index) => {
            const pos = index + 1;
            const points = Math.round(driver.points || 0);
            const widthPct = Math.max((points / maxPoints) * 100, 5);
            const teamCol = teamColor(driver.team) || '#666';

            return (
              <motion.div
                key={driver.driverId || driver.code || index}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <Card className="group relative overflow-hidden cursor-pointer">
                  {/* Top gradient bar in team color */}
                  <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${teamCol}, transparent)` }} />

                  <div className="flex items-start justify-between">
                    <span className={positionBadgeClass(pos)}>P{pos}</span>
                    <p className={`font-mono text-3xl font-black ${pos === 1 ? 'text-[var(--color-accent-gold)]' : 'text-accentRed'}`}>{points}</p>
                  </div>

                  <div className="mt-4">
                    <h2 className="text-2xl font-bold text-whitePrimary">{driver.name}</h2>
                    <span className="mt-2 inline-flex bg-accentRed/40 text-accentRed/90 text-xs font-mono px-2 py-0.5 rounded">
                      {driver.code || "DRV"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: teamCol }} />
                      {driver.team || "Unknown Team"}
                    </div>
                    <span>{nationalityFlag(driver.nationality)} {driver.nationality || "Unknown"}</span>
                  </div>

                  {/* Points progress bar */}
                  <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${widthPct}%`, background: `linear-gradient(90deg, ${teamCol}, ${teamCol}88)` }} />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-accentRed to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </Card>
              </motion.div>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default Drivers;
