import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Cpu, Lightbulb, LoaderCircle, TrendingDown, TrendingUp, ChevronDown, ChevronUp, BookOpen, Star, Swords, Zap, Trophy
} from "lucide-react";
import { Card, Button, LoadingState, ErrorState, EmptyState, GuideCard } from "../components/common";
import { useFetch, usePost } from "../hooks/useFetch";
import usePageTitle from "../hooks/usePageTitle";
import api from "../utils/axios";
import { confidenceToPercent, formatImpact, impactIcon, roundPosition, teamColor } from "../utils/formatters";
import { ConfidenceRing } from "../components/ai";
import PredictionDistributionChart from "../components/PredictionDistributionChart";

const resultColorByPosition = (pos) => {
  if (pos <= 3) return "text-[var(--color-accent-gold)]";
  if (pos <= 10) return "text-[var(--color-accent-green)]";
  return "text-text-secondary";
};

const confidenceLabel = (percent) => {
  if (percent >= 60) return "High";
  if (percent >= 30) return "Moderate";
  if (percent >= 15) return "Low";
  return "Very Low";
};

const verdictForPosition = (position) => {
  if (position <= 3) return { icon: "🏆", label: "Podium Contender", className: "bg-[var(--color-accent-gold)]/20 text-[var(--color-accent-gold)]" };
  if (position <= 10) return { icon: "✅", label: "Points Finish", className: "bg-[var(--color-accent-green)]/20 text-[var(--color-accent-green)]" };
  if (position <= 15) return { icon: "⚠️", label: "Midfield Battle", className: "bg-white/15 text-text-secondary" };
  return { icon: "❌", label: "Tough Race", className: "bg-accentRed/20 text-accentRed" };
};

const PRESET_SCENARIOS = [
  {
    id: "verstappen-miami",
    label: "Pole Position Bet",
    driverId: 1,
    driverCode: "VER",
    raceId: 4,
    raceName: "Miami GP",
    gridPosition: 1,
  },
  {
    id: "leclerc-monaco",
    label: "Monaco Specialist",
    driverId: 3,
    driverCode: "LEC",
    raceId: 6,
    raceName: "Monaco GP",
    gridPosition: 3,
  },
  {
    id: "norris-silverstone",
    label: "Midfield Battle",
    driverId: 5,
    driverCode: "NOR",
    raceId: 10,
    raceName: "British GP",
    gridPosition: 5,
  },
  {
    id: "hamilton-monza",
    label: "Points Lock",
    driverId: 4,
    driverCode: "HAM",
    raceId: 14,
    raceName: "Italian GP",
    gridPosition: 8,
  },
];

const guideSteps = [
  {
    title: "Select a driver and an upcoming race",
    description: "Choose from the dropdowns or click a Quick Scenario card below to auto-fill the form.",
  },
  {
    title: "Set the grid position",
    description: "Use the grid selector to choose the starting position (P1–P20).",
  },
  {
    title: "Run the prediction",
    description: "Click RUN PREDICTION to generate a finish range, confidence score, model breakdown, and what-if simulation.",
  },
  {
    title: "Use Quick Compare after your first result",
    description: "Compare how different grid positions affect the predicted outcome.",
  },
];

const EmptyPredictionState = () => (
  <Card delay={0.1} className="flex min-h-[460px] flex-col items-center justify-center text-center relative overflow-hidden">
    <div className="absolute inset-0 opacity-[0.03]">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-px bg-white" style={{ marginTop: `${i * 10}%`, transform: `skewX(-45deg)` }} />
      ))}
    </div>
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="mb-4 opacity-70">
        <circle cx="48" cy="48" r="44" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
        <path d="M26 55C26 41 36 31 50 31C60 31 68 37 72 46" stroke="var(--color-accent-500)" strokeWidth="4" strokeLinecap="round" />
        <path d="M24 56H74V65C65 68 31 68 24 65V56Z" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        <path d="M48 65V75M42 70H54" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="font-display font-bold text-3xl uppercase tracking-widest text-text-secondary">Configure prediction to begin</p>
      <p className="mt-2 max-w-md text-sm text-text-muted">
        Select a driver and race from the panel, then run XGBoost/Random Forest intelligence to get confidence-based predictions and what-if simulations.
      </p>
    </motion.div>
  </Card>
);

const AIPage = () => {
  usePageTitle("Apex Intelligence");

  const { data: drivers, loading: driversLoading, error: driversError, refetch: refetchDrivers } = useFetch("/drivers");
  const { data: races, loading: racesLoading, error: racesError, refetch: refetchRaces } = useFetch("/races");
  const { execute: runPrediction, loading: predictionLoading } = usePost("/ai/predict", { timeout: 45000 });

  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedRace, setSelectedRace] = useState("");
  const [gridPosition, setGridPosition] = useState(10);
  const [result, setResult] = useState(null);
  const [actionError, setActionError] = useState("");
  const [insightsOpen, setInsightsOpen] = useState(false);

  const driverList = drivers || [];
  const raceList = races || [];

  const selectedDriverData = useMemo(
    () => driverList.find((driver) => driver.driverId === Number(selectedDriver)),
    [driverList, selectedDriver]
  );
  const selectedRaceData = useMemo(
    () => raceList.find((race) => race.raceId === Number(selectedRace)),
    [raceList, selectedRace]
  );

  const upcomingRaces = useMemo(
    () => raceList.filter((race) => race.status !== "COMPLETED"),
    [raceList]
  );

  const setupLoading = driversLoading || racesLoading;
  const setupError = driversError || racesError;

  const handlePrediction = async () => {
    if (!selectedDriver || !selectedRace) {
      setActionError("Select driver and race before running prediction.");
      return;
    }

    try {
      setActionError("");
      const response = await runPrediction({
        driverId: Number(selectedDriver),
        raceId: Number(selectedRace),
        gridPosition,
      });
      setResult(response);
      setActionError("");
      const driverName = selectedDriverData?.name || selectedDriver;
      const raceName = selectedRaceData?.raceName || selectedRace;
      const predictedRange = response?.predictedRange || "";
      api.post("/history", {
        toolType: "APEX_INTELLIGENCE",
        summary: `${driverName} — ${raceName} prediction: ${predictedRange}`,
        payload: JSON.stringify(response),
      }).catch(() => {});
    } catch (err) {
      setActionError(err.message || "Prediction failed");
    }
  };

  const handleCompare = async (pos) => {
    if (!selectedDriver || !selectedRace) return;
    setGridPosition(pos);
    await handlePrediction();
  };

  if (setupLoading) return <LoadingState message="Loading AI prediction setup..." />;

  if (setupError) {
    return (
      <ErrorState
        message={setupError}
        onRetry={() => {
          refetchDrivers();
          refetchRaces();
        }}
      />
    );
  }

  if (!driverList.length || !raceList.length) {
    return <EmptyState title="No prediction inputs available" description="Driver or race data is empty." />;
  }

  const predictedRange = result?.predictedRange || "P5–P10";
  const confidencePercent = confidenceToPercent(result?.confidence);
  const roundedAvgFinish = roundPosition(Number(result?.performanceBreakdown?.weighted) || result?.predictedPosition || 10);
  const consistencyPercent = confidenceToPercent(result?.confidence);

  const trend = String(result?.trend || "STABLE").toUpperCase();
  const trendImproving = trend === "IMPROVING";
  const trendDeclining = trend === "DECLINING";

  const simOld = result?.performanceBreakdown?.career || result?.predictedPosition || 10;
  const simNew = result?.predictedPosition || simOld;
  const simImpact = result?.simulationImpact;
  const verdict = verdictForPosition(Number(roundedAvgFinish || 20));

  const sliderPercent = ((gridPosition - 1) / 19) * 100;

  const getSafeMostLikely = () => {
    const distribution = result?.probabilityDistribution;
    if (!distribution || distribution.length === 0) {
      const [min, max] = predictedRange.replace("P", "").split("–").map(Number);
      return Math.round((min + max) / 2);
    }
    const peak = distribution.reduce((max, item) => 
      item.probability > max.probability ? item : max, distribution[0]).position;
    const [min, max] = predictedRange.replace("P", "").split("–").map(Number);
    if (confidencePercent < 30) return Math.round((min + max) / 2);
    return Math.min(Math.max(peak, min), max);
  };

  const mostLikely = getSafeMostLikely();

  return (
    <div className="space-y-6">
      <GuideCard
        pageKey="apex_intelligence"
        title="How to use Apex Intelligence"
        steps={guideSteps}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT PANEL - FORM */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-4 lg:self-start">
          <Card className="h-fit" delay={0.05}>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accentRed/20 text-accentRed">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <p className="section-label">Apex Intelligence</p>
                <p className="font-display font-semibold text-xl uppercase tracking-wider">Prediction Setup</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Quick Scenarios */}
              <div>
                <p className="section-label mb-3">Quick Scenarios</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => {
                        setSelectedDriver(String(scenario.driverId));
                        setSelectedRace(String(scenario.raceId));
                        setGridPosition(scenario.gridPosition);
                        setResult(null);
                        setActionError("");
                        setInsightsOpen(false);
                      }}
                      className="text-left p-3 rounded-[var(--radius-md)] border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] hover:bg-[var(--color-glass-hover)] transition-all"
                    >
                      <p className="font-mono text-xs font-bold text-[var(--color-accent-500)]">{scenario.driverCode}</p>
                      <p className="text-xs font-semibold text-[var(--color-text-primary)] mt-0.5">{scenario.label}</p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">{scenario.raceName} · P{scenario.gridPosition}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Driver Selector */}
            <div>
              <label className="section-label mb-2 block">Driver</label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xs text-text-secondary">
                  <span className="font-display font-bold uppercase tracking-wide">{selectedDriverData?.code?.slice(0, 2) || "DR"}</span>
                </div>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="surface-input pl-12 appearance-none cursor-pointer"
                >
                  <option value="">Select driver</option>
                  {driverList.map((driver) => (
                    <option key={driver.driverId} value={driver.driverId}>
                      {driver.name} ({driver.code || "DRV"})
                    </option>
                  ))}
                </select>
              </div>
              {selectedDriverData && (
                <div className="mt-2 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: teamColor(selectedDriverData.team) }} />
                      <span className="font-mono text-sm font-bold text-whitePrimary">{selectedDriverData.code}</span>
                      <span className="text-xs text-text-muted">{selectedDriverData.team}</span>
                    </div>
                    <span className="font-mono text-sm text-[var(--color-accent-gold)]">{Math.round(selectedDriverData.points || 0)} pts</span>
                  </div>
                </div>
              )}
            </div>

            {/* Race Selector */}
            <div>
              <label className="section-label mb-2 block">Race</label>
              <select
                value={selectedRace}
                onChange={(e) => setSelectedRace(e.target.value)}
                className="surface-input appearance-none cursor-pointer"
              >
                <option value="">Select race</option>
                {upcomingRaces.map((race) => (
                  <option key={race.raceId} value={race.raceId}>
                    R{race.round} - {race.raceName}
                  </option>
                ))}
              </select>
              {selectedRaceData && (
                <div className="mt-2 text-xs text-text-muted">
                  {selectedRaceData.circuitName} · {selectedRaceData.date}
                </div>
              )}
            </div>

            {/* Grid Position */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="section-label">Grid Position</label>
                <span className="text-xs text-text-muted font-mono">P{gridPosition}</span>
              </div>
              <div className="grid grid-cols-5 gap-1 sm:grid-cols-11 md:grid-cols-5 lg:grid-cols-11">
                {[...Array(22)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGridPosition(i + 1)}
                    className={`h-8 text-[10px] font-mono font-bold rounded-[var(--radius-sm)] transition-all ${
                      i + 1 === gridPosition
                        ? 'bg-accentRed text-white shadow-[0_0_8px_rgba(232,0,45,0.4)] scale-110'
                        : 'bg-[var(--color-bg-hover)] text-text-muted hover:bg-white/10'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              {gridPosition >= 21 && (
                <p className="mt-2 text-[10px] text-accentRed/80 leading-tight">
                  Limited historical data for P{gridPosition} grid slot — the prediction model was trained on 20-car-grid seasons. Treat this result with extra caution.
                </p>
              )}
            </div>

            {actionError && !result ? <p className="text-sm text-accentRed">{actionError}</p> : null}

            <Button
              onClick={handlePrediction}
              disabled={predictionLoading || !selectedDriver || !selectedRace}
              className={`w-full relative overflow-hidden ${predictionLoading ? '' : 'hover:shadow-[0_0_30px_rgba(232,0,45,0.4)]'}`}
              size="lg"
            >
              {predictionLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Running prediction...
                </span>
              ) : (
                "RUN PREDICTION"
              )}
            </Button>

            {/* Quick Compare */}
            {result && (
              <div className="mt-4">
                <p className="section-label mb-2">Quick Compare</p>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => handleCompare(pos)}
                      className={`flex-1 py-2 text-xs font-mono font-bold rounded-[var(--radius-sm)] transition-all ${
                        gridPosition === pos
                          ? 'bg-accentRed/20 text-accentRed border border-accentRed/40'
                          : 'bg-[var(--color-bg-hover)] text-text-muted border border-[var(--color-border-default)] hover:bg-white/10'
                      }`}
                    >
                      P{pos}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* RIGHT PANEL - RESULTS */}
      <div className="w-full lg:w-2/3 space-y-4">
        <AnimatePresence mode="wait">
          {!result && !predictionLoading ? (
            <EmptyPredictionState key="empty" />
          ) : null}

          {predictionLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingState message="Running AI models..." />
            </motion.div>
          ) : null}

          {result ? (
            <motion.div key="results" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {/* Narrative insight */}
              <Card delay={0.1} className="border-accentRed/40 bg-accentRed/10">
                <p className="text-sm text-whitePrimary leading-relaxed">
                  Based on {selectedDriverData?.name || "this driver's"} recent form and starting from{" "}
                  <span className="font-mono font-semibold">P{gridPosition}</span>
                  {selectedRaceData?.raceName ? ` at ${selectedRaceData.raceName}` : ""}, our models estimate a likely finish in the{" "}
                  <span className="font-mono font-semibold">{predictedRange}</span> range with{" "}
                  <span className="font-semibold">{confidencePercent}% confidence</span>.{" "}
                  {confidencePercent < 30
                    ? `Very low confidence due to ${trendDeclining ? "declining performance" : "limited data or inconsistent performance"}. Use as a rough guide only.`
                    : trendImproving
                      ? "This driver is on an improving trend and looks set for a strong result."
                      : trendDeclining
                        ? "Recent trend is declining, so execution and strategy will be critical."
                        : "Current trend is stable, with a result close to expected pace."}
                </p>
              </Card>

              {/* Predicted Finish + Confidence */}
              <Card className="grid items-center gap-4 md:grid-cols-[1fr_auto]" delay={0.12}>
                <div>
                  <p className="section-label">Predicted Finish</p>
                  <motion.p
                    className={`font-mono mt-3 text-7xl font-bold tracking-tight ${resultColorByPosition(roundedAvgFinish)}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  >
                    {predictedRange}
                  </motion.p>
                  {confidencePercent < 50 && (
                    <p className="mt-2 text-xs text-text-muted">
                      {confidencePercent < 30 ? "Wide range due to low confidence" : "Range based on moderate confidence"}
                    </p>
                  )}
                  <motion.span
                    className={`inline-flex mt-3 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${verdict.className}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {verdict.icon} {verdict.label}
                  </motion.span>
                </div>
                <div className="text-center">
                  <ConfidenceRing percentage={confidencePercent} size={112} strokeWidth={10} />
                  <p className="mt-2 text-xs text-text-muted uppercase tracking-[0.2em]">
                    {confidenceLabel(confidencePercent)}
                  </p>
                  {confidencePercent < 30 && (
                    <p className="mt-1 text-xs text-accentRed">Prediction unreliable</p>
                  )}
                </div>
              </Card>

              {/* Model Comparison */}
              {(result?.rfPrediction || result?.xgbPrediction) && (
                <Card delay={0.13}>
                  <p className="section-label">Model Comparison</p>
                  <div className="mt-3 space-y-2">
                    {[
                      { name: "RF Model", value: result.rfPrediction },
                      { name: "XGB Model", value: result.xgbPrediction }
                    ].map(({ name, value }) => value ? (
                      <div key={name} className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-text-secondary w-24">{name}</span>
                        <div className="flex-1 h-6 rounded-md bg-white/5 overflow-hidden">
                          <motion.div
                            className="h-full rounded-md flex items-center px-2"
                            style={{ background: `linear-gradient(90deg, var(--color-accent-500), #ff4d6d)`, width: `${Math.min(100, (Number(value) / 20) * 100)}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (Number(value) / 20) * 100)}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          >
                            <span className="text-xs font-mono font-bold text-white">P{Math.round(value)}</span>
                          </motion.div>
                        </div>
                      </div>
                    ) : null)}
                    {result?.modelAgreement !== undefined && (
                      <p className="text-xs text-text-muted mt-2">
                        Models {result.modelAgreement ? "agree" : "disagree"} on this prediction
                      </p>
                    )}
                  </div>
                </Card>
              )}

              {/* Distribution Chart */}
              {result?.probabilityDistribution && result.probabilityDistribution.length > 0 && (
                <PredictionDistributionChart data={result.probabilityDistribution} />
              )}

              {/* Low confidence warning */}
              {confidencePercent < 30 && result?.uncertaintyFactors && result.uncertaintyFactors.length > 0 && (
                <Card delay={0.14} className="border-accentRed/30 bg-accentRed/5">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-lg">⚠️</div>
                    <div className="flex-1">
                      <p className="section-label mb-2 text-accentRed">Why Low Confidence?</p>
                      <p className="text-sm text-text-secondary">
                        {result?.confidenceReason || "Prediction uncertainty due to performance variability"}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Performance Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { label: "AVG FINISH", value: `P${roundedAvgFinish}`, delay: 0.16 },
                  { label: "CONSISTENCY", value: `${consistencyPercent}%`, bar: true, delay: 0.2 },
                  { label: "TREND", value: trend, icon: trendImproving ? TrendingUp : trendDeclining ? TrendingDown : Cpu, color: trendImproving ? 'text-[var(--color-accent-green)]' : trendDeclining ? 'text-accentRed' : 'text-text-secondary', delay: 0.24 },
                ].map((item) => (
                  <Card key={item.label} delay={item.delay}>
                    <p className="section-label">{item.label}</p>
                    {item.icon ? (
                      <div className="mt-3 flex items-center gap-2">
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                        <p className={`text-xl font-semibold ${item.color}`}>{item.value}</p>
                      </div>
                    ) : (
                      <p className="font-mono mt-2 text-4xl font-bold">{item.value}</p>
                    )}
                    {item.bar && (
                      <div className="mt-3 h-2 rounded-full bg-white/10">
                        <motion.div
                          className="h-2 rounded-full bg-[var(--color-accent-green)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${consistencyPercent}%` }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                        />
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Performance Breakdown */}
              {result?.performanceBreakdown && (
                <Card delay={0.26}>
                  <p className="section-label">Performance Breakdown</p>
                  <p className="text-xs text-text-muted mb-4">Prediction dynamically adjusts weighting between long-term skill, current season form, and recent race performance based on driver trend and consistency</p>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                      { label: "Career Form", value: result.performanceBreakdown.career, className: "bg-[var(--color-bg-elevated)] border-[var(--color-border-default)]" },
                      { label: "Season Form", value: result.performanceBreakdown.season, className: "bg-[var(--color-bg-elevated)] border-[var(--color-border-default)]" },
                      { label: "Recent Form", value: result.performanceBreakdown.recent, className: "bg-[var(--color-bg-elevated)] border-[var(--color-border-default)]" },
                      { label: "Weighted Avg", value: result.performanceBreakdown.weighted, className: "border-accentRed/30 bg-accentRed/10" },
                    ].map((item) => (
                      <div key={item.label} className={`rounded-[var(--radius-md)] border p-3 ${item.className}`}>
                        <p className="text-xs text-text-muted">{item.label}</p>
                        <p className="font-mono mt-1 text-2xl font-bold text-whitePrimary">P{item.value?.toFixed(1) || "N/A"}</p>
                      </div>
                    ))}
                  </div>
                  {result?.appliedWeights && (
                    <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-black/30 p-3">
                      <p className="text-xs text-text-muted mb-2">Weights Applied:</p>
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(result.appliedWeights).map(([key, val]) => (
                          <span key={key} className="text-sm">
                            <span className="text-text-muted">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>{" "}
                            <span className="font-mono font-semibold text-[var(--color-accent-gold)]">{(val * 100).toFixed(0)}%</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Insights */}
              {result?.insights && result.insights.length > 0 && (
                <Card delay={0.27} className="border-[var(--color-accent-gold)]/30 bg-[var(--color-accent-gold)]/5">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-lg">🧠</div>
                    <div className="flex-1">
                      <p className="section-label mb-2 text-[var(--color-accent-gold)]">Model Insights</p>
                      <ul className="space-y-1">
                        {result.insights.map((insight, idx) => (
                          <li key={idx} className="text-sm text-whitePrimary">• {insight}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}

              {/* Divergence */}
              {result?.divergence && result.divergence.diff > 2 && (
                <Card delay={0.275} className="border-accentRed/30 bg-accentRed/5">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-lg">⚠️</div>
                    <div className="flex-1">
                      <p className="section-label mb-2 text-accentRed">Performance Divergence</p>
                      <p className="text-sm text-text-secondary">
                        Career: P{result.performanceBreakdown?.career?.toFixed(1) || "N/A"} vs Recent: P{result.performanceBreakdown?.recent?.toFixed(1) || "N/A"}
                      </p>
                      <p className="mt-1 text-xs text-accentRed">{result.divergence.message}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* What-if Simulation */}
              <Card delay={0.28}>
                <p className="section-label">What-if Simulation</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4">
                    <p className="text-xs text-text-muted">CURRENT AVG</p>
                    <p className="font-mono mt-2 text-3xl font-bold text-text-secondary">P{simOld}</p>
                  </div>
                  <div className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-4">
                    <p className="text-xs text-text-muted">PROJECTED AVG</p>
                    <p className="font-mono mt-2 text-3xl font-bold text-[var(--color-accent-green)]">P{simNew}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-text-secondary">
                  {impactIcon(simImpact)} {formatImpact(simImpact)}
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  Starting from <span className="font-mono">P{gridPosition}</span> instead of the current average grid context is projected to{" "}
                  {typeof simOld === "number" && typeof simNew === "number"
                    ? `${simNew > simOld ? "cost" : "improve"} about ${Math.abs((simNew - simOld)).toFixed(1)} positions on average finish`
                    : "have a measurable impact on average finish"}
                  {selectedDriverData?.name ? ` for ${selectedDriverData.name}` : ""}.
                </p>
              </Card>

              {/* Feature Importance */}
              <Card delay={0.32}>
                <div className="mb-3 flex items-center gap-2 text-[var(--color-accent-gold)]">
                  <Lightbulb className="h-4 w-4" />
                  <p className="section-label">Why This Prediction?</p>
                </div>
                {result.topFeatures && result.topFeatures.length > 0 ? (
                  <div className="space-y-3">
                    {result.topFeatures.map((feature, idx) => (
                      <div key={idx} className="rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] p-3">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-semibold text-whitePrimary">{feature.explanation || `Factor ${idx + 1}`}</p>
                          <span className="text-xs px-2 py-1 rounded-full bg-accentRed/20 text-accentRed">
                            <span className="font-mono">{(feature.importance * 100).toFixed(1)}%</span>
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 mt-2">
                          <motion.div
                            className="h-1.5 rounded-full bg-accentRed"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (feature.importance * 100))}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">Feature analysis not available for this prediction.</p>
                )}
              </Card>

              {/* Disclaimer */}
              <Card delay={0.36} className="border-accentRed/20 bg-accentRed/5">
                <button
                  type="button"
                  onClick={() => setInsightsOpen(!insightsOpen)}
                  className="flex w-full items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-accentRed">ℹ️</span>
                    <p className="text-xs font-semibold text-whitePrimary">Prediction Disclaimer</p>
                  </div>
                  {insightsOpen ? <ChevronUp className="h-3 w-3 text-text-muted" /> : <ChevronDown className="h-3 w-3 text-text-muted" />}
                </button>
                <AnimatePresence>
                  {insightsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-xs text-text-muted leading-relaxed">
                        Predictions are AI-generated based on historical race data and statistical models. They represent educated estimates only and do not guarantee actual race outcomes. Many real-world variables (weather, safety cars, mechanical issues, tactical decisions) cannot be predicted. Use these results for entertainment and strategic planning only.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
    </div>
  );
};

export default AIPage;
