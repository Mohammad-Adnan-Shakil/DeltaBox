import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, ErrorState } from "../components/common";
import SkeletonLoader from "../components/SkeletonLoader";
import LiveClock from "../components/LiveClock";
import usePageTitle from "../hooks/usePageTitle";
import useFetch from "../hooks/useFetch";
import { StatCardsRow, NextRaceWidget } from "../components/dashboard";

const HeroSection = () => (
  <section className="flex flex-col justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-elevated)] p-4 md:flex-row md:items-center md:p-6 relative overflow-hidden">
    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-20 rounded-full bg-accentRed" />
    <div>
      <p className="section-label">Season Overview</p>
      <h1 className="font-display font-bold text-2xl uppercase tracking-widest mt-2 sm:text-3xl md:text-4xl lg:text-5xl" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
        <span className="text-whitePrimary">2026 SEASON</span> <span className="text-accentRed">COMMAND CENTER</span>
      </h1>
      <p className="mt-2 text-xs text-text-secondary sm:text-sm">Real-time standings, race progress, and race intelligence at a glance.</p>
    </div>

    <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-4 py-3 text-right shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-end gap-2">
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-text-muted sm:text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accentRed opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accentRed" />
          </span>
          LIVE
        </span>
      </div>
      <LiveClock />
    </div>
  </section>
);

export const ChartsSection = ({ drivers, races, loading }) => {
  const [chartsVisible, setChartsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setChartsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const driverList = drivers || [];

  const standingsData = useMemo(() => driverList.slice(0, 8), [driverList]);
  const maxPoints = useMemo(() => Math.max(...standingsData.map((d) => Number(d.points || 0)), 1), [standingsData]);

  return (
    <section className="grid grid-cols-1 gap-4">
      <Card delay={0.25}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display font-semibold text-xl uppercase tracking-wider text-whitePrimary">Driver Standings</h2>
          <p className="section-label">Top 8</p>
        </div>

        {chartsVisible && !loading ? (
          <div className="space-y-3">
            {standingsData.map((driver, index) => {
              const points = Number(driver.points || 0);
              const widthPct = Math.max((points / maxPoints) * 100, 6);
              const isTop = index === 0;
              const gap = index === 0 ? null : maxPoints - points;

              return (
                <div key={driver.driverId || driver.code} className="grid grid-cols-[50px_1fr_50px_auto] items-center gap-2">
                  <Link to={`/drivers/${driver.driverId}`} className="flex flex-col items-start hover:opacity-80 transition-opacity">
                    <span className={`font-display font-bold text-sm uppercase tracking-wide leading-tight ${isTop ? 'text-[var(--color-accent-gold)]' : 'text-whitePrimary'}`}>
                      {driver.code || "—"}
                    </span>
                    <span className={`text-[10px] leading-tight ${isTop ? 'text-[var(--color-accent-gold)]/70' : 'text-text-muted'}`}>
                      {driver.name || ""}
                    </span>
                  </Link>
                  <div className="h-10 overflow-hidden rounded-lg bg-white/5 flex items-center gap-2">
                    <span className={`shrink-0 h-2 w-2 rounded-full ml-2`} style={{ backgroundColor: driver.teamColor || 'var(--color-data-neutral)' }} />
                    <div className="flex-1 h-full relative">
                      <div
                        className="h-full rounded-lg transition-all duration-700 relative overflow-hidden"
                        style={{
                          width: `${widthPct}%`,
                          background: isTop
                          ? "linear-gradient(90deg,var(--color-accent-gold),#ffeb85)"
                              : "linear-gradient(90deg,var(--color-accent-500),#ff4d6d)",
                        }}
                      >
                        {isTop && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-right text-sm font-semibold text-whitePrimary">{Math.round(points)}</span>
                  {gap !== null && (
                    <span className="font-mono text-[11px] text-text-muted">-{gap}</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-[64px_1fr_40px] items-center gap-3">
                <SkeletonLoader height="16px" width="40px" />
                <SkeletonLoader height="32px" />
                <SkeletonLoader height="16px" width="30px" />
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
};

const Dashboard = () => {
  usePageTitle("Dashboard");

  const { data: drivers, loading: driversLoading, error: driversError } = useFetch('/drivers');
  const { data: racesRaw, loading: racesLoading, error: racesError } = useFetch('/races');

  const loading = driversLoading || racesLoading;
  const error = driversError || racesError;

  if (error && !drivers && !racesRaw) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  const raceList = (racesRaw || []).slice().sort((a, b) => (a.round ?? 999) - (b.round ?? 999));
  const completedRaces = raceList.filter((race) => race.status === "COMPLETED");

  return (
    <div className="space-y-6">
      <HeroSection />
      <StatCardsRow
        driversCount={drivers?.length || 22}
        totalRaces={raceList.length}
        completedRaces={completedRaces.length || 0}
      />
      <ChartsSection drivers={drivers} races={racesRaw} loading={loading} />
      <NextRaceWidget races={racesRaw || []} />
    </div>
  );
};

export default Dashboard;
