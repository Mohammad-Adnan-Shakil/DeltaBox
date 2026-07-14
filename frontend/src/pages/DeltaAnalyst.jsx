import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare, Gauge, Timer, Ban, Brain } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { Select } from "../components/common/Select";
import { Skeleton } from "../components/common/Skeleton";
import { ErrorState } from "../components/common/StateViews";
import { useFetch } from "../hooks/useFetch";
import usePageTitle from "../hooks/usePageTitle";
import api from "../utils/axios";

const DRIVER_A_COLOR = "var(--color-data-primary)";
const DRIVER_B_COLOR = "var(--color-data-secondary)";
const BRAKE_COLOR = "var(--color-data-danger)";
const THROTTLE_COLOR = "var(--color-data-success)";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-glass-border)] bg-[var(--color-base-800)]/95 backdrop-blur-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-[var(--color-text-tertiary)] mb-2 font-mono">{label}% distance</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-mono" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

const DeltaAnalyst = () => {
  usePageTitle("Delta Analyst");

  const [sessionKey, setSessionKey] = useState("");
  const [driverA, setDriverA] = useState("");
  const [driverB, setDriverB] = useState("");
  const [lapA, setLapA] = useState("");
  const [lapB, setLapB] = useState("");

  const [compareResult, setCompareResult] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [compareError, setCompareError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const { data: sessions, loading: sessionsLoading, error: sessionsError } = useFetch("/telemetry/sessions?year=2026", []);
  const { data: drivers, loading: driversLoading } = useFetch(
    sessionKey ? `/telemetry/drivers?sessionKey=${sessionKey}` : null,
    [sessionKey]
  );
  const { data: lapsA, loading: lapsALoading, error: lapsAError } = useFetch(
    driverA ? `/telemetry/laps?sessionKey=${sessionKey}&driverNumber=${driverA}` : null,
    [sessionKey, driverA]
  );
  const { data: lapsB, loading: lapsBLoading, error: lapsBError } = useFetch(
    driverB ? `/telemetry/laps?sessionKey=${sessionKey}&driverNumber=${driverB}` : null,
    [sessionKey, driverB]
  );

  console.log("🔍 DeltaAnalyst laps debug:", { sessionKey, driverA, lapsA, lapsAError, driverB, lapsB, lapsBError });

  const sessionList = sessions || [];
  const driverList = drivers || [];
  const lapListA = lapsA || [];
  const lapListB = lapsB || [];

  const selectedSession = sessionList.find(s => String(s.sessionKey) === sessionKey);
  const selectedDriverA = driverList.find(d => String(d.driverNumber) === driverA);
  const selectedDriverB = driverList.find(d => String(d.driverNumber) === driverB);

  const canCompare = sessionKey && driverA && driverB && lapA && lapB;

  const handleCompare = async () => {
    if (!canCompare) return;
    setComparing(true);
    setCompareError(null);
    setCompareResult(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    try {
      const res = await api.get("/telemetry/compare", {
        params: {
          sessionKey,
          driverNumberA: driverA,
          driverNumberB: driverB,
          lapA,
          lapB
        },
        timeout: 60000
      });
      setCompareResult(res.data);
    } catch (err) {
      setCompareError(err.response?.data?.error || err.message || "Compare failed");
    } finally {
      setComparing(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    try {
      const res = await api.post("/telemetry/analyze", {
        sessionKey: Number(sessionKey),
        driverNumberA: Number(driverA),
        driverNumberB: Number(driverB),
        lapA: Number(lapA),
        lapB: Number(lapB)
      });
      setAnalysisResult(res.data);
    } catch (err) {
      setAnalysisError(err.response?.data?.error || err.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const speedData = (() => {
    const t = compareResult?.telemetry;
    if (!t) return [];
    return t.distance.map((d, i) => ({
      distance: Math.round(d * 10) / 10,
      [selectedDriverA?.code || "A"]: t.speedA[i],
      [selectedDriverB?.code || "B"]: t.speedB[i],
    }));
  })();

  const throttleData = (() => {
    const t = compareResult?.telemetry;
    if (!t) return [];
    return t.distance.map((d, i) => ({
      distance: Math.round(d * 10) / 10,
      [`${selectedDriverA?.code || "A"} Throttle`]: t.throttleA[i],
      [`${selectedDriverA?.code || "A"} Brake`]: t.brakeA[i],
      [`${selectedDriverB?.code || "B"} Throttle`]: t.throttleB[i],
      [`${selectedDriverB?.code || "B"} Brake`]: t.brakeB[i],
    }));
  })();

  const codeA = selectedDriverA?.code || "A";
  const codeB = selectedDriverB?.code || "B";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-accent-500)]/10">
          <GitCompare className="h-6 w-6 text-[var(--color-accent-500)]" />
        </div>
        <div>
          <p className="font-display text-2xl font-bold uppercase tracking-wider">Delta Analyst</p>
          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
            Compare telemetry across any two laps
          </p>
        </div>
      </div>

      {/* Selection Panel */}
      <Card className="space-y-5">
        {sessionsError ? (
          <ErrorState message={sessionsError} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Session */}
              <div className="md:col-span-2">
                <Select
                  label="Session"
                  value={sessionKey}
                  onChange={(e) => {
                    setSessionKey(e.target.value);
                    setDriverA(""); setDriverB("");
                    setLapA(""); setLapB("");
                    setCompareResult(null);
                  }}
                  options={sessionList.map((s) => ({
                    value: String(s.sessionKey),
                    label: `${s.circuitName} — ${s.sessionType} ${s.year}`,
                  }))}
                  placeholder={sessionsLoading ? "Loading sessions..." : "Select session"}
                  disabled={sessionsLoading}
                />
              </div>

              {/* Driver A */}
              <div>
                <Select
                  label="Driver A"
                  value={driverA}
                  onChange={(e) => { setDriverA(e.target.value); setLapA(""); setCompareResult(null); }}
                  options={driverList.map((d) => ({
                    value: String(d.driverNumber),
                    label: `${d.code} — ${d.fullName}`,
                  }))}
                  placeholder={!sessionKey ? "Select session first" : driversLoading ? "Loading..." : "Select driver"}
                  disabled={!sessionKey || driversLoading}
                />
                {selectedDriverA && (
                  <div className="mt-2 flex items-center gap-2 px-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: `#${selectedDriverA.teamColor}` || DRIVER_A_COLOR }} />
                    <span className="text-xs text-[var(--color-text-tertiary)]">{selectedDriverA.teamName}</span>
                  </div>
                )}
              </div>

              {/* Driver B */}
              <div>
                <Select
                  label="Driver B"
                  value={driverB}
                  onChange={(e) => { setDriverB(e.target.value); setLapB(""); setCompareResult(null); }}
                  options={driverList.map((d) => ({
                    value: String(d.driverNumber),
                    label: `${d.code} — ${d.fullName}`,
                  }))}
                  placeholder={!sessionKey ? "Select session first" : driversLoading ? "Loading..." : "Select driver"}
                  disabled={!sessionKey || driversLoading}
                />
                {selectedDriverB && (
                  <div className="mt-2 flex items-center gap-2 px-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: `#${selectedDriverB.teamColor}` || DRIVER_B_COLOR }} />
                    <span className="text-xs text-[var(--color-text-tertiary)]">{selectedDriverB.teamName}</span>
                  </div>
                )}
              </div>

              {/* Lap A */}
              <div>
                <Select
                  label={`${codeA} Lap`}
                  value={lapA}
                  onChange={(e) => { setLapA(e.target.value); setCompareResult(null); }}
                  options={lapListA.map((l) => ({
                    value: String(l.lapNumber),
                    label: `Lap ${l.lapNumber} — ${l.lapDuration.toFixed(1)}s`,
                  }))}
                  placeholder={!driverA ? "Select driver A" : lapsALoading ? "Loading..." : "Select lap"}
                  disabled={!driverA || lapsALoading}
                />
                {lapsAError && (
                  <p className="mt-1 text-xs text-[var(--color-data-danger)]">Failed to load laps: {lapsAError}</p>
                )}
              </div>

              {/* Lap B */}
              <div>
                <Select
                  label={`${codeB} Lap`}
                  value={lapB}
                  onChange={(e) => { setLapB(e.target.value); setCompareResult(null); }}
                  options={lapListB.map((l) => ({
                    value: String(l.lapNumber),
                    label: `Lap ${l.lapNumber} — ${l.lapDuration.toFixed(1)}s`,
                  }))}
                  placeholder={!driverB ? "Select driver B" : lapsBLoading ? "Loading..." : "Select lap"}
                  disabled={!driverB || lapsBLoading}
                />
                {lapsBError && (
                  <p className="mt-1 text-xs text-[var(--color-data-danger)]">Failed to load laps: {lapsBError}</p>
                )}
              </div>
            </div>

            <Button
              onClick={handleCompare}
              disabled={!canCompare || comparing}
              loading={comparing}
              className="w-full"
              size="lg"
            >
              <Gauge className="h-4 w-4" /> COMPARE LAPS
            </Button>

            {compareError && (
              <p className="text-sm text-[var(--color-data-danger)] text-center">{compareError}</p>
            )}
          </>
        )}
      </Card>

      {/* Results */}
      <AnimatePresence mode="wait">
        {comparing ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Skeleton variant="card" />
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton variant="card" />
              <Skeleton variant="card" />
            </div>
          </motion.div>
        ) : compareResult ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Driver Info Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                { driver: selectedDriverA, side: "A", color: `#${selectedDriverA?.teamColor || "3B82F6"}`, delta: compareResult.delta },
                { driver: selectedDriverB, side: "B", color: `#${selectedDriverB?.teamColor || "F59E0B"}`, delta: compareResult.delta },
              ].map(({ driver, side, color }) => (
                <Card key={side} className="flex items-center gap-4" delay={0.1}>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-lg font-bold" style={{ backgroundColor: `${color}20`, color }}>
                    {driver?.code || side}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--color-text-primary)] truncate">{driver?.fullName || `Driver ${side}`}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{driver?.teamName || "—"}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Delta Display */}
            <Card delay={0.15}>
              <div className="flex items-center gap-2 mb-4">
                <Timer className="h-4 w-4 text-[var(--color-text-secondary)]" />
                <p className="section-label">Sector & Total Deltas ({codeA} vs {codeB})</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {compareResult.delta.sectors.map((s, i) => (
                  <div key={i} className="rounded-[var(--radius-md)] border border-[var(--color-glass-border)] bg-[var(--color-base-900)] p-4 text-center">
                    <p className="section-label mb-1">S{i + 1}</p>
                    <p className={`font-mono text-xl font-bold ${s < 0 ? "text-[var(--color-data-success)]" : s > 0 ? "text-[var(--color-data-danger)]" : "text-[var(--color-text-secondary)]"}`}>
                      {s > 0 ? "+" : ""}{s.toFixed(2)}s
                    </p>
                  </div>
                ))}
                <div className="rounded-[var(--radius-md)] border border-[var(--color-accent-500)]/20 bg-[var(--color-accent-500)]/5 p-4 text-center">
                  <p className="section-label mb-1">Total</p>
                  <p className={`font-mono text-xl font-bold ${compareResult.delta.total < 0 ? "text-[var(--color-data-success)]" : compareResult.delta.total > 0 ? "text-[var(--color-data-danger)]" : "text-[var(--color-text-secondary)]"}`}>
                    {compareResult.delta.total > 0 ? "+" : ""}{compareResult.delta.total.toFixed(2)}s
                  </p>
                </div>
              </div>
            </Card>

            {/* Speed Comparison Chart */}
            <Card delay={0.2}>
              <p className="section-label mb-4">Speed Comparison</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={speedData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-glass-border)" />
                  <XAxis dataKey="distance" stroke="var(--color-text-tertiary)" tick={{ fontSize: 11 }} unit="%" />
                  <YAxis stroke="var(--color-text-tertiary)" tick={{ fontSize: 11 }} unit=" km/h" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    formatter={(value) => <span style={{ color: "var(--color-text-secondary)" }}>{value}</span>}
                  />
                  <Line type="monotone" dataKey={codeA} stroke={DRIVER_A_COLOR} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey={codeB} stroke={DRIVER_B_COLOR} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Throttle / Brake Chart */}
            <Card delay={0.25}>
              <p className="section-label mb-4">Throttle & Brake</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={throttleData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-glass-border)" />
                  <XAxis dataKey="distance" stroke="var(--color-text-tertiary)" tick={{ fontSize: 11 }} unit="%" />
                  <YAxis stroke="var(--color-text-tertiary)" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    formatter={(value) => <span style={{ color: "var(--color-text-secondary)" }}>{value}</span>}
                  />
                  <Line type="monotone" dataKey={`${codeA} Throttle`} stroke={DRIVER_A_COLOR} strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                  <Line type="monotone" dataKey={`${codeB} Throttle`} stroke={DRIVER_B_COLOR} strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                  <Line type="monotone" dataKey={`${codeA} Brake`} stroke={BRAKE_COLOR} strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey={`${codeB} Brake`} stroke={THROTTLE_COLOR} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* AI Analysis */}
            <Card delay={0.3}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-[var(--color-text-secondary)]" />
                  <p className="section-label">AI Analysis</p>
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  loading={analyzing}
                  size="sm"
                >
                  <Brain className="h-3.5 w-3.5" /> {analysisResult ? "RE-ANALYZE" : "ANALYZE WITH AI"}
                </Button>
              </div>
              {analysisError && (
                <p className="text-sm text-[var(--color-data-danger)]">{analysisError}</p>
              )}
              {analysisResult ? (
                <div className="space-y-3">
                  <div className="rounded-[var(--radius-md)] bg-[var(--color-base-900)] p-4">
                    <p className="text-sm leading-relaxed text-[var(--color-text-primary)] whitespace-pre-line">
                      {analysisResult.analysis}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: `${codeA} Avg Speed`, value: `${analysisResult.summary.avgSpeedA} km/h`, color: "var(--color-data-primary)" },
                      { label: `${codeB} Avg Speed`, value: `${analysisResult.summary.avgSpeedB} km/h`, color: "var(--color-data-secondary)" },
                      { label: `${codeA} Max Speed`, value: `${analysisResult.summary.maxSpeedA} km/h`, color: "var(--color-data-primary)" },
                      { label: `${codeB} Max Speed`, value: `${analysisResult.summary.maxSpeedB} km/h`, color: "var(--color-data-secondary)" },
                      { label: `${codeA} Avg Throttle`, value: `${analysisResult.summary.avgThrottleA}%`, color: "var(--color-data-primary)" },
                      { label: `${codeB} Avg Throttle`, value: `${analysisResult.summary.avgThrottleB}%`, color: "var(--color-data-secondary)" },
                      { label: `${codeA} Avg Brake`, value: `${analysisResult.summary.avgBrakeA}%`, color: "var(--color-data-primary)" },
                      { label: `${codeB} Avg Brake`, value: `${analysisResult.summary.avgBrakeB}%`, color: "var(--color-data-secondary)" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-[var(--radius-md)] border border-[var(--color-glass-border)] bg-[var(--color-base-900)] p-3 text-center">
                        <p className="text-xs text-[var(--color-text-tertiary)] mb-0.5">{stat.label}</p>
                        <p className="font-mono text-sm font-bold" style={{ color: stat.color }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                !analysisError && (
                  <div className="flex min-h-[80px] items-center justify-center">
                    <p className="text-sm text-[var(--color-text-tertiary)]">
                      Click "Analyze with AI" for a telemetry-driven analysis
                    </p>
                  </div>
                )
              )}
            </Card>

            {/* Share hint */}
            <p className="text-center text-xs text-[var(--color-text-tertiary)]">
              <Ban className="mr-1 inline h-3 w-3" />
              Telemetry provided by OpenF1 API — session {selectedSession?.circuitName || sessionKey}
            </p>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card hover={false} className="flex min-h-[200px] items-center justify-center">
              <div className="text-center">
                <Gauge className="mx-auto h-10 w-10 text-[var(--color-text-tertiary)]" />
                <p className="mt-3 font-semibold text-[var(--color-text-primary)]">Select session, drivers, and laps</p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Then click Compare to view telemetry</p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeltaAnalyst;
