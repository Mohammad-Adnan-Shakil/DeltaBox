import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Search } from "lucide-react";
import { Card, EmptyState, ErrorState, LoadingState } from "../components/common";
import useFetch from "../hooks/useFetch";
import usePageTitle from "../hooks/usePageTitle";
import { teamColor, nationalityFlag } from "../utils/formatters";

const Teams = () => {
  usePageTitle("Constructors");

  const { data: constructors, loading: constructorsLoading, error: constructorsError, refetch: refetchConstructors } = useFetch("/constructors");
  const { data: drivers, loading: driversLoading, error: driversError, refetch: refetchDrivers } = useFetch("/drivers");

  const [search, setSearch] = useState("");

  const teams = constructors || [];
  const driverList = drivers || [];

  const loading = constructorsLoading || driversLoading;
  const error = constructorsError || driversError;

  const standings = useMemo(() => {
    return teams
      .filter((team) => team.name?.toLowerCase().includes(search.toLowerCase()))
      .map((team) => {
        const lineup = driverList
          .filter((driver) => driver.team === team.name)
          .sort((a, b) => Number(b.points || 0) - Number(a.points || 0));

        const points = lineup.reduce((sum, driver) => sum + Number(driver.points || 0), 0);

        return { ...team, points, lineup };
      })
      .sort((a, b) => b.points - a.points);
  }, [teams, driverList, search]);

  const maxPoints = useMemo(() => Math.max(...standings.map(t => t.points), 1), [standings]);

  if (loading) return <LoadingState message="Loading constructor standings..." />;
  if (error) {
    return (
      <ErrorState message={error} onRetry={() => { refetchConstructors(); refetchDrivers(); }} />
    );
  }
  if (!standings.length) return <EmptyState title="No constructor standings" description="No teams found for this season." />;

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-elevated)] p-4 md:p-6 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-accentRed" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-label">Team Championship</p>
            <div className="mt-2 flex items-center gap-3">
              <Shield className="h-5 w-5 text-accentRed md:h-6 md:w-6" />
              <h1 className="font-display font-bold text-2xl uppercase tracking-widest sm:text-3xl md:text-4xl">CONSTRUCTOR STANDINGS</h1>
            </div>
            <div className="mt-1 h-[2px] w-16 bg-accentRed"></div>
            <p className="mt-2 text-xs text-text-muted tracking-widest uppercase sm:text-sm">{standings.length} constructors · 2026 season</p>
          </div>

          <div className="relative w-full lg:w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search constructor"
              className="surface-input pl-10"
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {standings.map((team, index) => {
          const isLeader = index === 0;
          const accent = isLeader ? "#ffd700" : teamColor(team.name);
          const leadGap = index === 0 ? null : standings[0].points - team.points;

          return (
            <motion.div
              key={team.id || team.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <Card className="relative overflow-hidden cursor-pointer">
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                <div className="flex items-start justify-between relative">
                  <div className="relative z-10">
                    <span className={`text-xs font-black px-2 py-1 rounded-full ${isLeader ? 'bg-[var(--color-accent-gold)]/20 text-[var(--color-accent-gold)]' : 'bg-[var(--color-bg-hover)] text-text-secondary'}`}>P{index + 1}</span>
                    <h2 className="mt-2 text-2xl font-bold text-whitePrimary">{team.name}</h2>
                    <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
                      {nationalityFlag(team.nationality)} {team.nationality}
                    </p>
                  </div>
                  <div className="text-right relative z-10">
                    <p className="font-mono text-3xl font-black" style={{ color: isLeader ? '#ffd700' : accent }}>{Math.round(team.points)}</p>
                    {leadGap !== null && <p className="font-mono text-[11px] text-text-muted">-{leadGap}</p>}
                  </div>
                  {/* Watermark position */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[100px] font-black text-white/[0.03] select-none pointer-events-none">
                    P{index + 1}
                  </div>
                </div>

                <div className="mt-5 border-t border-[var(--color-border-default)] pt-4 relative z-10">
                  <p className="section-label mb-3">Driver Pairing</p>
                  {team.lineup.length ? (
                    <div className="space-y-2">
                      {team.lineup.map((driver) => {
                        const driverPct = Math.max((Number(driver.points || 0) / Math.max(maxPoints, 1)) * 100, 3);
                        return (
                          <div key={driver.driverId} className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-whitePrimary">{driver.name}</span>
                                <span className="font-mono text-sm font-bold" style={{ color: accent }}>{Math.round(driver.points || 0)}</span>
                              </div>
                              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${driverPct}%`, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary">No mapped drivers.</p>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </section>
    </div>
  );
};

export default Teams;
