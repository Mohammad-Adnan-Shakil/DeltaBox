import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Hero from "../components/Hero";
import { StatCardsRow, NextRaceWidget } from "../components/dashboard";
import { ChartsSection } from "./Dashboard";
import useFetch from "../hooks/useFetch";

const Landing = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const { data: drivers, loading: driversLoading, error: driversError } = useFetch('/drivers');
  const { data: racesRaw, loading: racesLoading, error: racesError } = useFetch('/races');

  const loading = driversLoading || racesLoading;
  const error = driversError || racesError;

  const raceList = (racesRaw || []).slice().sort((a, b) => (a.round ?? 999) - (b.round ?? 999));
  const completedRaces = raceList.filter((race) => race.status === "COMPLETED");

  return (
    <div className="bg-[var(--color-base-950)] relative">
      <div className="pointer-events-none fixed inset-0 bg-grid-white/[0.025]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: "64px 64px",
      }} />
      <div className="pointer-events-none fixed inset-0" style={{
        background: "radial-gradient(ellipse at 20% 50%, rgba(227,30,30,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.03) 0%, transparent 50%)",
      }} />
      <Hero />

      <div data-hero-scroll-target className="mx-auto w-full max-w-[1400px] px-6 py-16 md:px-8 lg:px-12">
        <div className="space-y-6">
          <StatCardsRow
            driversCount={drivers?.length || 22}
            totalRaces={raceList.length}
            completedRaces={completedRaces.length || 0}
          />
          <ChartsSection drivers={drivers} races={racesRaw} loading={loading} />
          <NextRaceWidget races={racesRaw || []} />
        </div>
      </div>
    </div>
  );
};

export default Landing;
