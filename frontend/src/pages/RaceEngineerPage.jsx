import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { BarChart3, Radio, Send, Mic, Activity, BookOpen } from "lucide-react";
import GuideCard from "../components/common/GuideCard";

const LIVE_POLL_INTERVAL = 20000;

const guideSteps = [
  {
    title: "Choose a mode: Manual, Live, or Replay",
    description: "Manual lets you tweak race context freely. Live fetches real-time data from the current session. Replay lets you scrub through past sessions lap by lap.",
  },
  {
    title: "Set or review the race context",
    description: "In Manual mode, adjust lap, position, tyre, fuel, and weather. In Live/Replay, context is pulled from the session data.",
  },
  {
    title: "Review scenario analysis",
    description: "The panel automatically evaluates undercut, overcut, pit window, threat assessment, safety car, and championship impact based on the current context.",
  },
  {
    title: "Talk to your engineer",
    description: "Type a message or click a suggested question to get AI-powered strategic advice from the pit wall.",
  },
];

const RaceEngineerPage = () => {
  const [mode, setMode] = useState("MANUAL");
  const [liveSession, setLiveSession] = useState(null);
  const [replaySessions, setReplaySessions] = useState([]);
  const [selectedSessionKey, setSelectedSessionKey] = useState("");
  const [sessionDrivers, setSessionDrivers] = useState([]);
  const [selectedDriverNum, setSelectedDriverNum] = useState("");
  const [lapScrubber, setLapScrubber] = useState(1);
  const [maxLap, setMaxLap] = useState(57);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [replayLoading, setReplayLoading] = useState(false);
  const pollTimerRef = useRef(null);
  const scrubDebounceRef = useRef(null);

  const [raceContext, setRaceContext] = useState({
    lap: 37,
    totalLaps: 57,
    position: 3,
    gapToLeader: "+12.4s",
    tyreCompound: "SOFT",
    tyreAge: 18,
    fuelLoad: 31.4,
    weather: "Dry",
    lastLapTime: "1:22.847"
  });

  const [scenarios, setScenarios] = useState(null);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [driverMessage, setDriverMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const conversationEndRef = useRef(null);
  const manualScenarioDebounceRef = useRef(null);

  useEffect(() => {
    document.title = "Race Engineer | DeltaBox";
  }, []);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const applyRaceState = useCallback((state) => {
    setRaceContext(prev => ({
      ...prev,
      lap: state.lap || prev.lap,
      totalLaps: state.totalLaps || prev.totalLaps,
      position: state.position || prev.position,
      gapToLeader: state.gapToLeader || prev.gapToLeader,
      tyreCompound: state.tyreCompound || prev.tyreCompound,
      tyreAge: state.tyreAge ?? prev.tyreAge,
      lastLapTime: state.lastLapTime || prev.lastLapTime,
    }));
    if (state.totalLaps) setMaxLap(state.totalLaps);
    if (state.lap) setLapScrubber(state.lap);
    if (state.scenarios) setScenarios(state.scenarios);
    setLastUpdated(new Date());
  }, []);

  const startLiveSession = useCallback(async () => {
    setLiveLoading(true);
    try {
      const res = await api.get("/race-engineer/live-session");
      const data = res.data;
      if (data.live) {
        setLiveSession(data);
        setSelectedSessionKey(String(data.sessionKey));
        setSessionDrivers(data.drivers || []);
      } else {
        setLiveSession({ live: false, message: data.message });
      }
    } catch (err) {
      setLiveSession({ live: false, message: "Failed to check live session" });
    } finally {
      setLiveLoading(false);
    }
  }, []);

  const fetchRaceState = useCallback(async (sessionKey, driverNumber, asOfLap) => {
    try {
      const params = { sessionKey: Number(sessionKey), driverNumber: Number(driverNumber) };
      if (asOfLap) params.asOfLap = asOfLap;
      const res = await api.get("/race-engineer/state", { params });
      return res.data;
    } catch (err) {
      return null;
    }
  }, []);

  const pollLiveState = useCallback(async () => {
    if (!selectedSessionKey || !selectedDriverNum) return;
    const state = await fetchRaceState(selectedSessionKey, selectedDriverNum, null);
    if (state && !state.error) applyRaceState(state);
  }, [selectedSessionKey, selectedDriverNum, fetchRaceState, applyRaceState]);

  useEffect(() => {
    if (mode === "LIVE") {
      startLiveSession();
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    } else {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }
  }, [mode, startLiveSession]);

  useEffect(() => {
    if (mode === "LIVE" && selectedSessionKey && selectedDriverNum) {
      pollLiveState();
      pollTimerRef.current = setInterval(pollLiveState, LIVE_POLL_INTERVAL);
    }
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [mode, selectedSessionKey, selectedDriverNum, pollLiveState]);

  useEffect(() => {
    if (mode === "REPLAY") {
      setReplayLoading(true);
      api.get("/race-engineer/replay/sessions").then(res => {
        setReplaySessions(res.data || []);
      }).catch(() => {}).finally(() => setReplayLoading(false));
    }
  }, [mode]);

  useEffect(() => {
    if ((mode === "LIVE" || mode === "REPLAY") && selectedSessionKey) {
      api.get("/race-engineer/replay/drivers", { params: { sessionKey: Number(selectedSessionKey) } })
        .then(res => setSessionDrivers(res.data || []))
        .catch(() => {});
    }
  }, [mode, selectedSessionKey]);

  const handleScrubChange = (e) => {
    const lap = Number(e.target.value);
    setLapScrubber(lap);
    if (scrubDebounceRef.current) clearTimeout(scrubDebounceRef.current);
    scrubDebounceRef.current = setTimeout(async () => {
      if (selectedSessionKey && selectedDriverNum) {
        const state = await fetchRaceState(selectedSessionKey, selectedDriverNum, lap);
        if (state && !state.error) applyRaceState(state);
      }
    }, 600);
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setLiveSession(null);
    setSelectedSessionKey("");
    setSessionDrivers([]);
    setSelectedDriverNum("");
    setLastUpdated(null);
    setScenarios(null);
  };

  const handleDriverSelect = (driverNum) => {
    setSelectedDriverNum(driverNum);
    setLapScrubber(1);
    setLastUpdated(null);
    setScenarios(null);
  };

  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  const handleContextChange = (e) => {
    const { name, value } = e.target;
    setRaceContext(prev => ({
      ...prev,
      [name]: name === "lap" || name === "totalLaps" || name === "position" || name === "tyreAge"
        ? parseInt(value)
        : name === "fuelLoad"
          ? parseFloat(value)
          : value
    }));
  };

  const fetchManualScenarios = useCallback(async (context) => {
    setScenariosLoading(true);
    try {
      const res = await api.post("/race-engineer/scenarios", context);
      setScenarios(res.data);
    } catch {
      setScenarios(null);
    } finally {
      setScenariosLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mode !== "MANUAL") return;
    if (manualScenarioDebounceRef.current) clearTimeout(manualScenarioDebounceRef.current);
    manualScenarioDebounceRef.current = setTimeout(() => {
      fetchManualScenarios(raceContext);
    }, 500);
    return () => {
      if (manualScenarioDebounceRef.current) clearTimeout(manualScenarioDebounceRef.current);
    };
  }, [mode, raceContext, fetchManualScenarios]);

  const handleTransmit = async (e) => {
    e.preventDefault();

    if (!driverMessage.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const updatedConversation = [
        ...conversation,
        { role: "driver", message: driverMessage, timestamp: getTimestamp() }
      ];
      setConversation(updatedConversation);
      setDriverMessage("");

      const response = await api.post("/race-engineer/ask", {
        ...raceContext,
        driverMessage: driverMessage
      });

      if (response.data.error) {
        setError(response.data.error);
        setConversation(prev => [
          ...prev,
          { role: "engineer", message: `⚠️ ${response.data.error}`, isError: true, timestamp: getTimestamp() }
        ]);
      } else {
        setConversation(prev => [
          ...prev,
          { role: "engineer", message: response.data.response, timestamp: getTimestamp() }
        ]);
        api.post("/history", {
          toolType: "RACE_ENGINEER",
          summary: driverMessage.length > 60 ? driverMessage.substring(0, 60) + "..." : driverMessage,
          payload: JSON.stringify({ question: driverMessage, answer: response.data.response }),
        }).catch(() => {});
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Failed to get engineer advice";
      setError(errorMsg);
      setConversation(prev => [
        ...prev,
        { role: "engineer", message: `⚠️ ${errorMsg}`, isError: true, timestamp: getTimestamp() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "What's our strategy?",
    "How's tyre degradation?",
    "Should I push now?",
    "Gap to car ahead?"
  ];

  const isAutoMode = mode === "LIVE" || mode === "REPLAY";

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-whitePrimary p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <GuideCard
            pageKey="race_engineer"
            title="How to use Race Engineer"
            steps={guideSteps}
          />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Radio className="w-6 h-6 sm:w-8 sm:h-8 text-accentRed" />
            <h1 className="font-display font-bold text-2xl uppercase tracking-widest text-whitePrimary sm:text-3xl md:text-4xl">Race Engineer</h1>
          </div>
          <p className="text-xs text-text-secondary sm:text-sm">AI-powered pit wall strategy — powered by DeepSeek R1</p>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2 mt-4">
            {["MANUAL", "LIVE", "REPLAY"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleModeSwitch(m)}
                className={`px-4 py-1.5 text-xs font-bold rounded-[var(--radius-md)] uppercase tracking-wider transition-all ${
                  mode === m
                    ? m === "LIVE"
                      ? "bg-[var(--color-data-success)]/20 text-[var(--color-data-success)] border border-[var(--color-data-success)]/40"
                      : m === "REPLAY"
                        ? "bg-[var(--color-accent-gold)]/20 text-[var(--color-accent-gold)] border border-[var(--color-accent-gold)]/40"
                        : "bg-accentRed/20 text-accentRed border border-accentRed/40"
                    : "bg-[var(--color-bg-hover)] text-text-secondary border border-[var(--color-border-default)] hover:bg-white/10"
                }`}
              >
                {m === "LIVE" && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[var(--color-data-success)] animate-pulse" />}
                {m}
              </button>
            ))}
          </div>

          {/* Steering wheel display */}
          <div className="flex items-center gap-4 mt-4 p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-card)] border border-[var(--color-border-default)] max-w-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-green)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-accent-green)]" />
              </span>
              <span className="text-xs font-mono text-[var(--color-accent-green)] font-bold tracking-wider">ENGINEER ONLINE</span>
            </div>
            <div className="flex items-center gap-1 text-text-muted">
              <Mic className="h-3 w-3" />
              <span className="text-[10px] font-mono">REC</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Race Context */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-default)] border-t-2 border-t-accentRed rounded-[var(--radius-lg)] p-6 sticky top-6 shadow-[var(--shadow-md)]">
              <h2 className="font-display font-semibold text-xl uppercase tracking-wider mb-4 text-whitePrimary">Race Status</h2>

              {/* Live indicator */}
              {mode === "LIVE" && (
                <div className="mb-4 p-2 rounded-[var(--radius-sm)] bg-[var(--color-data-success)]/10 border border-[var(--color-data-success)]/30 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3 w-3 text-[var(--color-data-success)]" />
                    <span className="text-[10px] font-bold text-[var(--color-data-success)] uppercase tracking-wider">LIVE</span>
                  </div>
                  {lastUpdated && (
                    <span className="text-[10px] text-text-muted">{lastUpdated.toLocaleTimeString()}</span>
                  )}
                </div>
              )}

              {/* Replay indicator */}
              {mode === "REPLAY" && (
                <div className="mb-4 p-2 rounded-[var(--radius-sm)] bg-[var(--color-accent-gold)]/10 border border-[var(--color-accent-gold)]/30 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[var(--color-accent-gold)] uppercase tracking-wider">REPLAY · Lap {lapScrubber}/{maxLap}</span>
                  {lastUpdated && (
                    <span className="text-[10px] text-text-muted">{lastUpdated.toLocaleTimeString()}</span>
                  )}
                </div>
              )}

              {/* Live/Replay session & driver selectors */}
              {isAutoMode && (
                <div className="space-y-3 mb-4 pb-4 border-b border-[var(--color-border-default)]">
                  {/* Session selector (replay) or live session info */}
                  {mode === "LIVE" && (
                    <div>
                      <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1 block">Session</label>
                      {liveLoading ? (
                        <p className="text-xs text-text-muted">Checking for live session...</p>
                      ) : liveSession?.live ? (
                        <p className="text-xs font-mono text-[var(--color-data-success)]">{liveSession.circuitName} — {liveSession.countryName}</p>
                      ) : (
                        <p className="text-xs text-text-muted">No live session</p>
                      )}
                    </div>
                  )}
                  {mode === "REPLAY" && (
                    <div>
                      <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1 block">Session</label>
                      {replayLoading ? (
                        <p className="text-xs text-text-muted">Loading sessions...</p>
                      ) : (
                        <select
                          value={selectedSessionKey}
                          onChange={(e) => { setSelectedSessionKey(e.target.value); setSelectedDriverNum(""); }}
                          className="surface-input text-xs appearance-none cursor-pointer"
                        >
                          <option value="">Select session</option>
                          {replaySessions.map((s) => (
                            <option key={s.sessionKey} value={s.sessionKey}>
                              {s.circuitName} — {s.countryName} ({(s.dateStart || "").substring(0, 10)})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {/* Driver selector */}
                  <div>
                    <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1 block">Driver</label>
                    <select
                      value={selectedDriverNum}
                      onChange={(e) => handleDriverSelect(e.target.value)}
                      disabled={!selectedSessionKey}
                      className="surface-input text-xs appearance-none cursor-pointer disabled:opacity-40"
                    >
                      <option value="">Select driver</option>
                      {sessionDrivers.map((d) => (
                        <option key={d.driverNumber} value={d.driverNumber}>
                          {d.code} — {d.fullName} ({d.teamName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lap scrubber (replay only) */}
                  {mode === "REPLAY" && selectedDriverNum && (
                    <div>
                      <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1 block">
                        Lap {lapScrubber} / {maxLap}
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={maxLap}
                        value={lapScrubber}
                        onChange={handleScrubChange}
                        className="w-full accent-[var(--color-accent-gold)]"
                      />
                      <div className="flex justify-between text-[9px] text-text-muted mt-0.5">
                        <span>Lap 1</span>
                        <span>Lap {maxLap}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {/* Lap */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">Lap</label>
                    <input type="number" name="lap" value={raceContext.lap} onChange={handleContextChange}
                      readOnly={isAutoMode}
                      className={`surface-input font-mono ${isAutoMode ? "opacity-70 cursor-not-allowed" : ""}`} />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">Total</label>
                    <input type="number" name="totalLaps" value={raceContext.totalLaps} onChange={handleContextChange}
                      readOnly={isAutoMode}
                      className={`surface-input font-mono ${isAutoMode ? "opacity-70 cursor-not-allowed" : ""}`} />
                  </div>
                </div>

                {/* Position & Gap */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">Position</label>
                    <input type="number" name="position" value={raceContext.position} onChange={handleContextChange}
                      readOnly={isAutoMode}
                      className={`surface-input font-mono ${isAutoMode ? "opacity-70 cursor-not-allowed" : ""}`} />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">Gap to Leader</label>
                    <input type="text" name="gapToLeader" value={raceContext.gapToLeader} onChange={handleContextChange}
                      readOnly={isAutoMode}
                      className={`surface-input font-mono ${isAutoMode ? "opacity-70 cursor-not-allowed" : ""}`} />
                  </div>
                </div>

                {/* Tyre */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">Compound</label>
                    <select name="tyreCompound" value={raceContext.tyreCompound} onChange={handleContextChange}
                      disabled={isAutoMode}
                      className={`surface-input font-medium ${isAutoMode ? "opacity-70 cursor-not-allowed" : ""}`}>
                      <option>SOFT</option>
                      <option>MEDIUM</option>
                      <option>HARD</option>
                      <option>INTER</option>
                      <option>WET</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">Age (laps)</label>
                    <input type="number" name="tyreAge" value={raceContext.tyreAge} onChange={handleContextChange}
                      readOnly={isAutoMode}
                      className={`surface-input font-mono ${isAutoMode ? "opacity-70 cursor-not-allowed" : ""}`} />
                  </div>
                </div>

                {/* Fuel & Weather — editable in all modes */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="flex items-center gap-1 text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">
                      Fuel (kg)
                      {isAutoMode && <span className="text-[9px] text-[var(--color-accent-gold)] font-normal normal-case tracking-normal">(est.)</span>}
                    </label>
                    <input type="number" name="fuelLoad" value={raceContext.fuelLoad} onChange={handleContextChange} step="0.1" className="surface-input font-mono" />
                  </div>
                  <div className="flex flex-col">
                    <label className="flex items-center gap-1 text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">
                      Weather
                      {isAutoMode && <span className="text-[9px] text-[var(--color-accent-gold)] font-normal normal-case tracking-normal">(est.)</span>}
                    </label>
                    <select name="weather" value={raceContext.weather} onChange={handleContextChange} className="surface-input font-medium">
                      <option>Dry</option>
                      <option>Damp</option>
                      <option>Wet</option>
                    </select>
                  </div>
                </div>

                {/* Last Lap Time */}
                <div className="flex flex-col">
                  <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">Last Lap Time</label>
                  <input type="text" name="lastLapTime" value={raceContext.lastLapTime} onChange={handleContextChange}
                    readOnly={isAutoMode}
                    className={`surface-input font-mono text-lg text-[var(--color-accent-green)] ${isAutoMode ? "opacity-70 cursor-not-allowed" : ""}`} />
                </div>

                {/* VU Meter visualization */}
                <div className="flex gap-[2px] h-6 items-end">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="flex-1 rounded-t-sm" style={{
                      height: `${Math.random() * 60 + 20}%`,
                      background: `linear-gradient(to top, ${i < 6 ? 'var(--color-data-success)' : i < 13 ? 'var(--color-data-warning)' : 'var(--color-data-danger)'}, transparent)`,
                      opacity: 0.3 + Math.random() * 0.3,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Chat */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-6 flex flex-col h-[600px] lg:h-auto lg:min-h-[600px] shadow-[var(--shadow-md)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-semibold text-xl uppercase tracking-wider text-whitePrimary">Engineer Radio</h2>
                  {loading && <span className="flex h-2 w-2"><span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-accentRed opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-accentRed" /></span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--color-accent-green)] rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-[var(--color-accent-green)]">ONLINE</span>
                </div>
              </div>

              <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted font-semibold mb-3">
                {conversation.length > 0 ? `TRANSMISSION HISTORY · ${conversation.length} messages` : 'NO TRANSMISSIONS YET'}
              </p>

              <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 pb-2">
                {conversation.length === 0 ? (
                  <div className="text-center text-text-muted py-12">
                    <p className="text-sm">No transmission yet. Send your first message to the engineer.</p>
                  </div>
                ) : (
                  conversation.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: msg.role === "driver" ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.role === "driver" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-[var(--radius-md)] text-sm ${
                          msg.role === "driver"
                            ? "bg-accentRed/10 text-whitePrimary border border-accentRed/30"
                            : msg.isError
                            ? "bg-accentRed/20 text-red-200 border border-accentRed"
                            : "bg-black/50 text-[var(--color-accent-green)] font-mono text-sm border border-[var(--color-accent-green)]/20"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            {msg.role === "engineer" && !msg.isError && (
                              <p className="text-[10px] text-[var(--color-accent-green)] mb-1 font-bold tracking-wider">🎙️ ENGINEER ▸</p>
                            )}
                            {msg.message}
                          </div>
                          {msg.timestamp && (
                            <span className="text-[10px] text-text-muted whitespace-nowrap">{msg.timestamp}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[var(--color-accent-green)] rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-[var(--color-accent-green)] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-[var(--color-accent-green)] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                    <span className="text-[10px] font-mono text-[var(--color-accent-green)]">TRANSMITTING...</span>
                  </motion.div>
                )}

                <div ref={conversationEndRef} />
              </div>

              {conversation.length === 0 && !loading && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setDriverMessage(q)}
                      className="text-[11px] px-3 py-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-text-secondary hover:text-whitePrimary hover:border-accentRed/40 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {error && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-accentRed/10 border border-accentRed text-red-200 text-xs px-3 py-2 rounded-[var(--radius-sm)] mb-3"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleTransmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={driverMessage}
                  onChange={(e) => setDriverMessage(e.target.value)}
                  placeholder="Driver message..."
                  disabled={loading}
                  className="flex-1 surface-input text-sm disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !driverMessage.trim()}
                  className="bg-accentRed hover:bg-accentRed/90 disabled:bg-accentRed/50 text-white px-6 py-3 rounded-[var(--radius-md)] font-semibold flex items-center justify-center gap-2 transition-all w-full sm:w-auto hover:shadow-[0_0_20px_rgba(232,0,45,0.3)] disabled:shadow-none"
                >
                  <Send className="w-4 h-4" />
                  Transmit
                </button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Scenario Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-accentRed" />
            <h2 className="font-display font-semibold text-xl uppercase tracking-wider text-whitePrimary">
              Scenario Analysis
            </h2>
            {scenariosLoading && (
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-accentRed opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accentRed" />
              </span>
            )}
            {mode === "MANUAL" && (
              <span className="text-[9px] text-[var(--color-accent-gold)] font-normal normal-case tracking-normal">(est.)</span>
            )}
          </div>

          {!scenarios ? (
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-8 text-center">
              <p className="text-sm text-text-muted">
                {mode === "MANUAL"
                  ? "Adjust race context fields to see scenario analysis"
                  : "Select a session and driver to load scenario analysis"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(scenarios).map(([key, sc]) => {
                if (!sc || !sc.available) return null;
                const statusColors = {
                  positive: "border-l-[var(--color-data-success)] bg-[var(--color-data-success)]/5",
                  negative: "border-l-accentRed bg-accentRed/5",
                  neutral: "border-l-[var(--color-accent-gold)] bg-[var(--color-accent-gold)]/5",
                };
                const badgeColors = {
                  positive: "bg-[var(--color-data-success)]/15 text-[var(--color-data-success)]",
                  negative: "bg-accentRed/15 text-red-300",
                  neutral: "bg-[var(--color-accent-gold)]/15 text-[var(--color-accent-gold)]",
                  insufficient_data: "bg-white/5 text-text-muted",
                };
                const borderColor = statusColors[sc.status] || "border-l-[var(--color-border-default)]";
                const badgeColor = badgeColors[sc.status] || badgeColors.neutral;

                return (
                  <div
                    key={key}
                    className={`bg-[var(--color-bg-card)] border border-[var(--color-border-default)] border-l-4 ${borderColor} rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-sm)]`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-whitePrimary">
                        {sc.label || key}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${badgeColor}`}>
                        {sc.status === "insufficient_data" ? "N/A" : sc.status === "positive" ? "Favorable" : sc.status === "negative" ? "Risky" : "Marginal"}
                      </span>
                    </div>

                    {/* Key metrics */}
                    <div className="space-y-0.5 mb-2 text-[11px] font-mono">
                      {key === "undercut" && (
                        <>
                          <MetricRow label="Current pace" value={`${sc.currentPace ?? "—"}s`} />
                          <MetricRow label="Fresh pace est." value={`${sc.freshPaceEstimate ?? "—"}s`} />
                          <MetricRow label="Pit loss" value={`${sc.pitLossTime ?? "—"}s`} />
                          <MetricRow label="Gain (3 laps)" value={sc.gainOverWindow != null ? `+${sc.gainOverWindow}s` : "—"} />
                          <MetricRow label="Net" value={sc.netGain != null ? `${sc.netGain > 0 ? "+" : ""}${sc.netGain}s` : "—"} />
                          {sc.gapToCarAhead != null && <MetricRow label="Gap to car ahead" value={`${sc.gapToCarAhead}s`} />}
                        </>
                      )}
                      {key === "overcut" && (
                        <>
                          <MetricRow label="Degradation" value={sc.degradationOver ? `${sc.degradationOver}s` : "—"} />
                          <MetricRow label="Std Dev" value={sc.stdDev ? `${sc.stdDev}s` : "—"} />
                          <MetricRow label="Samples" value={`${sc.lapCount ?? "—"} laps`} />
                        </>
                      )}
                      {key === "pitWindow" && (
                        <>
                          <MetricRow label="Compound" value={sc.compound || "—"} />
                          <MetricRow label="Tyre age" value={`${sc.tyreAge ?? "—"} laps`} />
                          <MetricRow label="Optimal window" value={sc.optimalWindow || "—"} />
                          <MetricRow label="Laps remaining" value={`${sc.lapsRemainingOnCurrentSet ?? "—"}`} />
                          <MetricRow label="Recommend pit" value={`Lap ${sc.recommendedPitLap ?? "—"}`} />
                        </>
                      )}
                      {key === "threatAssessment" && (
                        <>
                          <MetricRow label="Gap trend" value={sc.gapTrend != null ? `${sc.gapTrend > 0 ? "+" : ""}${sc.gapTrend}s` : "—"} />
                          <MetricRow label="Per lap" value={sc.changePerLap != null ? `${sc.changePerLap > 0 ? "+" : ""}${sc.changePerLap}s` : "—"} />
                          <MetricRow label="History" value={sc.historySize ? `${sc.historySize} laps` : "—"} />
                        </>
                      )}
                      {key === "safetyCarContingency" && (
                        <>
                          <MetricRow label="SC pit loss" value={`${sc.scPitLossTime ?? "—"}s`} />
                          <MetricRow label="Green pit loss" value={`${sc.greenPitLossTime ?? "—"}s`} />
                          <MetricRow label="Gain over window" value={sc.gainOverWindow != null ? `+${sc.gainOverWindow}s` : "—"} />
                          <MetricRow label="SC net" value={sc.scNetGain != null ? `${sc.scNetGain > 0 ? "+" : ""}${sc.scNetGain}s` : "—"} />
                        </>
                      )}
                      {key === "championshipImpact" && (
                        <>
                          <MetricRow label="Position" value={`P${sc.position ?? "—"}`} />
                          <MetricRow label="Points this race" value={`${sc.pointsThisRace ?? 0} pts`} />
                          {sc.driverPoints != null && <MetricRow label="Season before" value={`${sc.driverPoints} pts`} />}
                          {sc.estimatedTotal != null && <MetricRow label="Estimated total" value={`${sc.estimatedTotal} pts`} />}
                        </>
                      )}
                    </div>

                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      {sc.verdict || "No verdict available."}
                    </p>
                    {sc.estimated && (
                      <p className="text-[9px] text-[var(--color-accent-gold)]/50 mt-1 italic">Estimate</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

function MetricRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-text-muted">{label}</span>
      <span className="text-whitePrimary font-medium">{value}</span>
    </div>
  );
}

export default RaceEngineerPage;
