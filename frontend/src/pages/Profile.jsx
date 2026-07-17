import { useEffect, useMemo, useState } from "react";
import { Calendar, Flag, Trophy, Users, Star, Clock, Brain, Radio, GitCompare } from "lucide-react";
import { Card, EmptyState, ErrorState, LoadingState } from "../components/common";
import { useAuth } from "../context/AuthContext";
import useFetch from "../hooks/useFetch";
import usePageTitle from "../hooks/usePageTitle";
import SkeletonLoader from "../components/SkeletonLoader";
import { nationalityFlag, teamColor } from "../utils/formatters";
import api from "../services/api";

const Profile = () => {
  usePageTitle("Profile");

  const { user } = useAuth();
  const { data: profileData, loading: profileLoading, error: profileError, refetch: refetchProfile } = useFetch("/user/me");
  const { data: drivers, loading: driversLoading, error: driversError, refetch: refetchDrivers } = useFetch("/drivers");
  const { data: races, loading: racesLoading, error: racesError, refetch: refetchRaces } = useFetch("/races");

  const [favouriteDriverId, setFavouriteDriverId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadFavoriteDriver = async () => {
      try {
        const response = await api.get("/user/profile");
        const profile = response.data?.data || response.data;
        if (profile?.favoriteDriver) {
          setFavouriteDriverId(profile.favoriteDriver);
        }
      } catch (error) {}
    };

    loadFavoriteDriver();
  }, []);

  const updateFavoriteDriver = async (driverId) => {
    setIsUpdating(true);
    try {
      const normalizedDriverId = driverId || null;
      const response = await api.put("/user/profile", { favoriteDriver: normalizedDriverId });
      const profile = response.data?.data || response.data;
      setFavouriteDriverId(profile?.favoriteDriver || "");
    } catch (error) {
    } finally {
      setIsUpdating(false);
    }
  };

  const profile = profileData || user || {};
  const username = profile.username || "User";
  const email = profile.email || "user@deltabox.app";
  const role = String(profile.role || user?.role || "USER").toUpperCase();

  const driverList = drivers || [];
  const raceList = races || [];
  const completedRaces = raceList.filter((race) => race.status === "COMPLETED").length;
  const upcomingRaces = raceList.length - completedRaces;

  const favouriteDriver = useMemo(
    () => driverList.find((driver) => String(driver.driverId) === String(favouriteDriverId)),
    [driverList, favouriteDriverId]
  );

  const loading = profileLoading || driversLoading || racesLoading;
  const error = profileError || driversError || racesError;

  if (loading) return <LoadingState message="Loading profile data..." />;
  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => { refetchProfile(); refetchDrivers(); refetchRaces(); }}
      />
    );
  }

  if (!driverList.length) return <EmptyState title="No profile data" description="Driver data is required to build profile insights." />;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-accentRed/10 to-[var(--color-bg-elevated)]" delay={0.05}>
        <div className="flex flex-col items-start gap-4 p-4 md:flex-row md:items-center md:p-6">
          <div className="flex h-[72px] w-[72px] md:h-[80px] md:w-[80px] items-center justify-center rounded-full bg-accentRed/20 text-3xl md:text-4xl font-bold text-accentRed border border-accentRed/30 shadow-[0_0_20px_rgba(232,0,45,0.2)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(232,0,45,0.4)] hover:scale-105">
            {username[0]?.toUpperCase() || "U"}
          </div>

          <div>
            <p className="section-label">Member Profile</p>
            <h1 className="mt-1 text-2xl font-display font-bold uppercase tracking-wide sm:text-3xl">{username}</h1>
            <p className="mt-1 text-xs text-text-secondary sm:text-sm">{email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-accentRed/20 px-3 py-1 text-xs font-semibold text-accentRed">{role}</span>
              <span className="text-xs text-text-muted sm:text-sm">Member since 2026</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card delay={0.1}>
          <div className="mb-3 flex items-center gap-2 text-[var(--color-accent-blue)]"><Users className="h-4 w-4" /><span className="section-label">Drivers</span></div>
          <p className="font-mono hero-number text-[42px] sm:text-[52px]">{driverList.length}</p>
        </Card>

        <Card delay={0.15}>
          <div className="mb-3 flex items-center gap-2 text-[var(--color-accent-green)]"><Flag className="h-4 w-4" /><span className="section-label">Completed Races</span></div>
          <p className="font-mono hero-number text-[42px] sm:text-[52px] text-[var(--color-accent-green)]">{completedRaces}</p>
        </Card>

        <Card delay={0.2}>
          <div className="mb-3 flex items-center gap-2 text-[var(--color-accent-gold)]"><Calendar className="h-4 w-4" /><span className="section-label">Upcoming Rounds</span></div>
          <p className="font-mono hero-number text-[42px] sm:text-[52px]">{upcomingRaces}</p>
        </Card>
      </section>

      {/* Favourite Driver */}
      <Card delay={0.25}>
        <p className="section-label">Favourite Driver</p>
        <h2 className="font-display font-semibold text-xl uppercase tracking-wider mt-2">Set Your Favourite Driver</h2>

        <select
          value={favouriteDriverId}
          onChange={(e) => updateFavoriteDriver(e.target.value)}
          disabled={isUpdating || driversLoading}
          className="surface-input mt-4"
        >
          <option value="">
            {isUpdating ? "Updating..." : "Select favourite driver"}
          </option>
          {driverList.map((driver) => (
            <option key={driver.driverId} value={driver.driverId}>
              {driver.name} ({driver.code || "DRV"})
            </option>
          ))}
        </select>

        {favouriteDriver ? (
          <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${teamColor(favouriteDriver.team)}, transparent)` }} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-whitePrimary">{favouriteDriver.name}</p>
                <p className="mt-1 text-sm text-text-secondary">
                  <span className="font-display font-bold uppercase tracking-wide">{favouriteDriver.code || "DRV"}</span>
                  {" · "}{nationalityFlag(favouriteDriver.nationality)} {favouriteDriver.nationality}
                </p>
              </div>
              <div className="text-right">
                <p className="section-label">Points</p>
                <p className="font-mono text-2xl font-bold text-[var(--color-accent-gold)]">{Math.round(favouriteDriver.points || 0)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: teamColor(favouriteDriver.team) }} />
              {favouriteDriver.team || "Unknown Team"}
            </div>
            <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-accentRed/20 px-2.5 py-1 text-xs font-semibold text-accentRed">
              <Star className="h-3.5 w-3.5" /> Favourite Pick
            </p>
          </div>
        ) : null}
      </Card>

      {/* Activity History */}
      <HistorySection />
    </div>
  );
};

const TOOLS = [
  { key: "APEX_INTELLIGENCE", label: "Apex Intelligence", icon: Brain },
  { key: "RACE_ENGINEER", label: "Race Engineer", icon: Radio },
  { key: "DELTA_ANALYST", label: "Delta Analyst", icon: GitCompare },
];

const HistorySection = () => {
  const [activeTab, setActiveTab] = useState("APEX_INTELLIGENCE");
  const [historyData, setHistoryData] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  const fetchHistory = async (toolType) => {
    if (historyData[toolType] !== undefined) return;
    setLoading(prev => ({ ...prev, [toolType]: true }));
    setError(prev => ({ ...prev, [toolType]: null }));
    try {
      const res = await api.get("/history", { params: { type: toolType } });
      const data = res.data?.data || res.data || [];
      setHistoryData(prev => ({ ...prev, [toolType]: data }));
    } catch (err) {
      setError(prev => ({ ...prev, [toolType]: "Failed to load history" }));
    } finally {
      setLoading(prev => ({ ...prev, [toolType]: false }));
    }
  };

  useEffect(() => {
    fetchHistory(activeTab);
  }, [activeTab]);

  const activeTool = TOOLS.find(t => t.key === activeTab);
  const ToolIcon = activeTool?.icon || Clock;
  const entries = historyData[activeTab];
  const isLoading = loading[activeTab];
  const hasError = error[activeTab];

  return (
    <Card delay={0.3}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-text-muted" />
        <p className="section-label">Activity History</p>
      </div>

      <div className="flex mb-5 bg-[var(--color-bg-elevated)] rounded-[var(--radius-md)] p-1 border border-[var(--color-border-default)]">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.key}
              onClick={() => setActiveTab(tool.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-[var(--radius-sm)] transition-all duration-200 ${
                activeTab === tool.key
                  ? "bg-accentRed text-white shadow-md"
                  : "text-text-secondary hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-glass-border)] bg-[var(--color-bg-elevated)]">
              <SkeletonLoader width="32px" height="32px" borderRadius="8px" />
              <div className="flex-1">
                <SkeletonLoader height="14px" width="70%" />
                <SkeletonLoader height="10px" width="30%" className="mt-1.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {hasError && !isLoading && (
        <p className="text-sm text-accentRed/80 text-center py-4">{hasError}</p>
      )}

      {!isLoading && !hasError && entries && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ToolIcon className="h-8 w-8 text-text-muted mb-2" />
          <p className="text-sm text-text-secondary">No history yet</p>
          <p className="text-xs text-text-muted mt-1">Activity from this tool will appear here once you use it.</p>
        </div>
      )}

      {!isLoading && entries && entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-glass-border)] bg-[var(--color-bg-elevated)] hover:bg-white/5 transition-colors"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accentRed/10">
                <ToolIcon className="h-4 w-4 text-accentRed" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-whitePrimary truncate">{entry.summary}</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default Profile;
