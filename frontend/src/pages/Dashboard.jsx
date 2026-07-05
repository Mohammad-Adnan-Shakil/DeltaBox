import { useEffect, useMemo, useState, memo, useRef } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Flag, Trophy, Users, Zap, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card, AnimatedCount, LoadingState, ErrorState, EmptyState } from "../components/common";
import SkeletonLoader from "../components/SkeletonLoader";
import LiveClock from "../components/LiveClock";
import { useInView } from "../hooks/useInView";
import useFetch from "../hooks/useFetch";
import usePageTitle from "../hooks/usePageTitle";
import { dashboardDataPromise, racesDataPromise } from "../main";

const StatCard = memo(({ icon: Icon, label, value, subValue, accentClass = "text-whitePrimary", delay = 0, loading = false, accent = "red" }) => {
  const accentColors = {
    blue: { bg: "bg-[var(--color-accent-blue)]/20", text: "text-[var(--color-accent-blue)]", gradient: "from-[var(--color-accent-blue)]/70 via-[var(--color-accent-blue)] to-transparent" },
    green: { bg: "bg-[var(--color-accent-green)]/20", text: "text-[var(--color-accent-green)]", gradient: "from-[var(--color-accent-green)]/70 via-[var(--color-accent-green)] to-transparent" },
    gold: { bg: "bg-[var(--color-accent-gold)]/20", text: "text-[var(--color-accent-gold)]", gradient: "from-[var(--color-accent-gold)]/70 via-[var(--color-accent-gold)] to-transparent" },
    purple: { bg: "bg-[var(--color-accent-purple)]/20", text: "text-[var(--color-accent-purple)]", gradient: "from-[var(--color-accent-purple)]/70 via-[var(--color-accent-purple)] to-transparent" },
    red: { bg: "bg-accentRed/20", text: "text-accentRed", gradient: "from-accentRed/70 via-accentRed to-transparent" },
  };
  const c = accentColors[accent] || accentColors.red;

  return (
    <Card delay={delay} className="relative overflow-hidden p-5">
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${c.bg}`} />
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${c.bg} ${c.text}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="section-label">{label}</p>
      </div>

      {loading ? (
        <SkeletonLoader height="48px" width="80px" />
      ) : typeof value === "number" ? (
        <p className={`hero-number text-[42px] ${accentClass}`}>
          <AnimatedCount value={value} />
        </p>
      ) : (
        <p className={`text-2xl font-semibold ${accentClass}`}>{value}</p>
      )}

      {subValue && !loading && (
        <p className="mt-1 text-sm text-text-secondary">{subValue}</p>
      )}
      <div className={`absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r ${c.gradient}`} />
    </Card>
  );
});

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

const StatCardsSection = ({ drivers, races, loading }) => {
  const driverList = drivers || [];
  const raceList = (races || []).slice().sort((a, b) => (a.round ?? 999) - (b.round ?? 999));
  const completedRaces = raceList.filter((race) => race.status === "COMPLETED");
  
  const topDriver = driverList[0] || { name: "Andrea Kimi Antonelli", points: 72 };
  const topTeam = useMemo(() => {
    const grouped = Object.values(
      driverList.reduce((acc, driver) => {
        const key = driver.team || "Mercedes";
        if (!acc[key]) acc[key] = { name: key, points: 0 };
        acc[key].points += Number(driver.points || 0);
        return acc;
      }, {})
    ).sort((a, b) => b.points - a.points);
    return grouped[0] || { name: "Mercedes", points: 135 };
  }, [driverList]);

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={Users} label="Drivers" value={driverList.length || 22} delay={0.05} loading={loading} accent="blue" />
      <StatCard icon={Flag} label="Completed Races" value={completedRaces.length || 3} accentClass="text-[var(--color-accent-green)]" delay={0.1} loading={loading} accent="green" />
      <StatCard icon={Trophy} label="Top Driver" value={topDriver.name} subValue={<span className="font-mono">{Math.round(topDriver.points || 0)} pts</span>} delay={0.15} loading={loading} accent="gold" />
      <StatCard icon={Zap} label="Top Team" value={topTeam.name} subValue={<span className="font-mono">{Math.round(topTeam.points || 0)} pts</span>} delay={0.2} loading={loading} accent="purple" />
    </section>
  );
};

const ChartsSection = ({ drivers, races, loading }) => {
  const [chartsVisible, setChartsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setChartsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const driverList = drivers || [];
  const raceList = (races || []).slice().sort((a, b) => (a.round ?? 999) - (b.round ?? 999));
  const completedRaces = raceList.filter((race) => race.status === "COMPLETED");

  const standingsData = useMemo(() => driverList.slice(0, 8), [driverList]);
  const maxPoints = useMemo(() => Math.max(...standingsData.map((d) => Number(d.points || 0)), 1), [standingsData]);

  const progressData = useMemo(() => raceList.map((race, idx) => {
    const completedCountAtPoint = raceList
      .slice(0, idx + 1)
      .filter((entry) => entry.status === "COMPLETED").length;

    const progressValue = race.status === "COMPLETED" ? completedCountAtPoint : completedRaces.length;

    return {
      round: `R${race.round}`,
      progress: progressValue,
      status: race.status,
    };
  }), [raceList, completedRaces]);

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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
                <div key={driver.driverId || driver.code} className="grid grid-cols-[50px_20px_1fr_50px_auto] items-center gap-2">
                  <span className={`font-display font-bold text-sm uppercase tracking-wide ${isTop ? 'text-[var(--color-accent-gold)]' : 'text-text-secondary'}`}>
                    {isTop ? 'P1' : `P${index + 1}`}
                  </span>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: driver.teamColor || '#666' }} />
                  <div className="h-10 overflow-hidden rounded-lg bg-white/5">
                    <div
                      className="h-full rounded-lg transition-all duration-700 relative overflow-hidden"
                      style={{
                        width: `${widthPct}%`,
                        background: isTop
                          ? "linear-gradient(90deg,#ffd700,#ffeb85)"
                          : "linear-gradient(90deg,#e8002d,#ff4d6d)",
                      }}
                    >
                      {isTop && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                      )}
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

      <Card delay={0.3}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display font-semibold text-xl uppercase tracking-wider text-whitePrimary">Race Progress</h2>
          <p className="section-label">Completion Curve</p>
        </div>

        {chartsVisible && !loading ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={progressData}>
              <defs>
                <linearGradient id="raceProgressFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(232,0,45,0.3)" />
                  <stop offset="100%" stopColor="rgba(232,0,45,0)" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="round" stroke="rgba(255,255,255,0.6)" tick={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }} />
              <YAxis hide allowDecimals={false} domain={[0, raceList.length]} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(17, 19, 30, 0.9)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  backdropFilter: 'blur(12px)',
                }}
                formatter={(value) => [`${value} completed races`, "Progress"]}
              />
              <Area type="monotone" dataKey="progress" stroke="#e8002d" strokeWidth={3} fill="url(#raceProgressFill)" dot={({ cx, cy, payload }) => (
                <circle
                  cx={cx}
                  cy={cy}
                  r={payload.status === "COMPLETED" ? 6 : 4}
                  fill={payload.status === "COMPLETED" ? "#e8002d" : "var(--color-bg-card)"}
                  stroke={payload.status === "COMPLETED" ? "#e8002d" : "rgba(255,255,255,0.4)"}
                  strokeWidth={2}
                />
              )} />
              {progressData.filter(r => r.status === "COMPLETED").length > 0 && (
                <Area type="monotone" dataKey="progress" stroke="#e8002d" strokeWidth={3} fill="url(#raceProgressFill)" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <SkeletonLoader height="300px" />
        )}
      </Card>
    </section>
  );
};

const UpcomingRacesSection = ({ races, loading }) => {
  const [ref, inView] = useInView({ threshold: 0.1 });
  const raceList = (races || []).slice().sort((a, b) => (a.round ?? 999) - (b.round ?? 999));
  const upcomingRaces = raceList.filter((race) => race.status !== "COMPLETED");

  return (
    <div ref={ref}>
      {inView ? (
        <Card delay={0.35}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-xl uppercase tracking-wider text-whitePrimary">Upcoming Races</h2>
            <p className="section-label">Next 6</p>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <SkeletonLoader key={i} height="60px" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingRaces.slice(0, 6).map((race, idx) => {
                const isNext = idx === 0;
                return (
                  <div
                    key={race.raceId}
                    className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 py-3 relative overflow-hidden"
                    style={{
                      borderLeftColor: isNext ? 'var(--color-accent-gold)' : 'var(--color-border-default)',
                      borderLeftWidth: isNext ? 3 : 1,
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-lg text-text-muted">{String(race.round).padStart(2, '0')}</span>
                        <div>
                          <p className="font-mono text-sm font-semibold text-whitePrimary">
                            R{race.round} · {race.raceName}
                            {isNext && <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--color-accent-gold)] font-bold">NEXT RACE</span>}
                          </p>
                          <p className="text-xs text-text-secondary">{race.circuitName} · {race.location}, {race.country}</p>
                        </div>
                      </div>
                      <p className="font-mono text-xs text-text-muted">{race.date ? new Date(race.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase() : ''}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ) : (
        <SkeletonLoader height="400px" />
      )}
    </div>
  );
};

const Dashboard = () => {
  usePageTitle("Dashboard");

  const [drivers, setDrivers] = useState(null);
  const [races, setRaces] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([dashboardDataPromise, racesDataPromise])
      .then(([driversData, racesData]) => {
        setDrivers(driversData);
        setRaces(racesData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (error && !drivers && !races) {
    return (
      <ErrorState
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <HeroSection />
      <StatCardsSection drivers={drivers} races={races} loading={loading} />
      <ChartsSection drivers={drivers} races={races} loading={loading} />
      <UpcomingRacesSection races={races} loading={loading} />
    </div>
  );
};

export default Dashboard;
