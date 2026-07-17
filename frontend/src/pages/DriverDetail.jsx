import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Flag, Gauge, Star, MapPin, Loader } from "lucide-react";
import { Card, ErrorState } from "../components/common";
import SkeletonLoader from "../components/SkeletonLoader";
import useFetch from "../hooks/useFetch";
import usePageTitle from "../hooks/usePageTitle";
import { teamColor, nationalityFlag } from "../utils/formatters";

const DriverDetail = () => {
  const { driverId } = useParams();
  const navigate = useNavigate();
  usePageTitle("Driver Details");

  const { data: drivers, loading: driversLoading, error: driversError } = useFetch('/drivers');
  const driversList = drivers || [];
  const driver = driversList.find(d => String(d.driverId) === String(driverId) || d.code === driverId);
  const driverPosition = driver ? driversList.findIndex(d => d.driverId === driver.driverId) + 1 : null;

  const code = driver?.code || "";
  const { data: careerData, loading: careerLoading } = useFetch(
    code ? `/historical/driver/${code}/career` : null
  );

  const loading = driversLoading;
  const error = driversError;

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader height="24px" width="120px" />
        <SkeletonLoader height="200px" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonLoader key={i} height="80px" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (!driver) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => navigate("/drivers")} className="flex items-center gap-2 text-text-secondary hover:text-whitePrimary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Drivers
          </button>
        </motion.div>
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Flag className="h-12 w-12 text-text-tertiary mb-4" />
          <p className="font-semibold text-lg text-whitePrimary">Driver not found</p>
          <p className="mt-1 text-sm text-text-secondary">The requested driver could not be found.</p>
        </Card>
      </div>
    );
  }

  const teamCol = teamColor(driver.team);
  const initials = (driver.code || "?").charAt(0).toUpperCase();
  const positionBadgeClass = driverPosition === 1
    ? "bg-gradient-to-br from-[var(--color-accent-gold)] to-amber-600 text-black"
    : driverPosition === 2
    ? "bg-gray-400 text-black"
    : driverPosition === 3
    ? "bg-amber-700 text-white"
    : "bg-[var(--color-bg-hover)] text-text-secondary";

  const careerStats = careerData?.careerStats;
  const results = careerData?.results || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <button onClick={() => navigate("/drivers")} className="flex items-center gap-2 text-text-secondary hover:text-whitePrimary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Drivers
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="relative overflow-hidden" delay={0.1}>
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${teamCol}, transparent)` }} />
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-3xl font-bold border-2" style={{ backgroundColor: `${teamCol}20`, borderColor: teamCol, color: teamCol }}>
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-xs font-black px-2 py-1 rounded-full ${positionBadgeClass}`}>P{driverPosition}</span>
                  <span className="inline-flex bg-accentRed/40 text-accentRed/90 text-xs font-mono px-2 py-0.5 rounded">
                    {driver.code || "DRV"}
                  </span>
                </div>
                <h1 className="font-display font-bold text-3xl uppercase tracking-widest sm:text-4xl md:text-5xl text-whitePrimary">
                  {driver.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: teamCol }} />
                    {driver.team || "Unknown Team"}
                  </span>
                  <span className="flex items-center gap-1">
                    {nationalityFlag(driver.nationality)} {driver.nationality || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted uppercase tracking-wider">Championship Points</p>
              <p className="font-mono text-5xl font-black" style={{ color: teamCol }}>{Math.round(driver.points || 0)}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {careerStats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {[
              { label: "Races", value: careerStats.races, icon: Flag, color: "var(--color-text-primary)" },
              { label: "Wins", value: careerStats.wins, icon: Trophy, color: "var(--color-accent-gold)" },
              { label: "Podiums", value: careerStats.podiums, icon: Star, color: "var(--color-accent-500)" },
              { label: "Poles", value: careerStats.poles, icon: Gauge, color: "var(--color-data-primary)" },
              { label: "Avg Finish", value: careerStats.avgFinish, icon: MapPin, color: "var(--color-text-secondary)" },
              { label: "Championships", value: careerStats.championships, icon: Trophy, color: "var(--color-accent-gold)" },
            ].map((stat) => (
              <Card key={stat.label} delay={0.2} hover={false} className="text-center">
                <stat.icon className="mx-auto h-4 w-4 mb-2" style={{ color: stat.color }} />
                <p className="font-mono text-2xl font-bold text-whitePrimary">{stat.value}</p>
                <p className="mt-1 text-xs text-text-muted uppercase tracking-wider">{stat.label}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {careerLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-[var(--radius-lg)] p-[var(--space-6)] bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)]">
              <SkeletonLoader height="16px" width="40%" className="mx-auto mb-3" />
              <SkeletonLoader height="32px" width="60%" className="mx-auto" />
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
          <Card delay={0.3}>
            <h2 className="font-display font-semibold text-xl uppercase tracking-wider text-whitePrimary mb-4">Season Results</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-glass-border)] bg-[var(--color-base-800)]">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Round</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Race</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Grid</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Finish</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Points</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r.raceId || i} className="border-b border-[var(--color-glass-border)] transition-colors hover:bg-white/5">
                      <td className="px-4 py-3 font-mono text-sm text-whitePrimary">{r.round || "—"}</td>
                      <td className="px-4 py-3 font-medium text-whitePrimary">{r.raceName || "—"}</td>
                      <td className="px-4 py-3 font-mono text-sm text-text-secondary">{r.gridPosition != null ? `P${r.gridPosition}` : "—"}</td>
                      <td className="px-4 py-3 font-mono text-sm">
                        <span className={`${r.finishPosition === 1 ? "text-[var(--color-accent-gold)] font-bold" : r.finishPosition <= 3 ? "text-[var(--color-accent-500)] font-semibold" : "text-text-secondary"}`}>
                          {r.finishPosition != null ? `P${r.finishPosition}` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-bold text-[var(--color-data-warning)]">{r.points ?? "—"}</td>
                      <td className="px-4 py-3 text-text-secondary">{r.status || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DriverDetail;
