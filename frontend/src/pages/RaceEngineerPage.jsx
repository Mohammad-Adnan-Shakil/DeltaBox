import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { Radio, Send, Mic } from "lucide-react";

const RaceEngineerPage = () => {
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

  const [driverMessage, setDriverMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const conversationEndRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    document.title = "Race Engineer | DeltaBox";
  }, []);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

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
        api.post("/api/history", {
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

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-whitePrimary p-6">
      <div className="max-w-7xl mx-auto">
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

              <div className="space-y-4">
                {/* Lap */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">Lap</label>
                    <input type="number" name="lap" value={raceContext.lap} onChange={handleContextChange} className="surface-input font-mono" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">Total</label>
                    <input type="number" name="totalLaps" value={raceContext.totalLaps} onChange={handleContextChange} className="surface-input font-mono" />
                  </div>
                </div>

                {/* Position & Gap */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">Position</label>
                    <input type="number" name="position" value={raceContext.position} onChange={handleContextChange} className="surface-input font-mono" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">Gap to Leader</label>
                    <input type="text" name="gapToLeader" value={raceContext.gapToLeader} onChange={handleContextChange} className="surface-input font-mono" />
                  </div>
                </div>

                {/* Tyre */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">Compound</label>
                    <select name="tyreCompound" value={raceContext.tyreCompound} onChange={handleContextChange} className="surface-input font-medium">
                      <option>SOFT</option>
                      <option>MEDIUM</option>
                      <option>HARD</option>
                      <option>INTER</option>
                      <option>WET</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">Age (laps)</label>
                    <input type="number" name="tyreAge" value={raceContext.tyreAge} onChange={handleContextChange} className="surface-input font-mono" />
                  </div>
                </div>

                {/* Fuel & Weather */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">Fuel (kg)</label>
                    <input type="number" name="fuelLoad" value={raceContext.fuelLoad} onChange={handleContextChange} step="0.1" className="surface-input font-mono" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-text-muted text-[11px] uppercase tracking-[0.2em] mb-1">Weather</label>
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
                  <input type="text" name="lastLapTime" value={raceContext.lastLapTime} onChange={handleContextChange} className="surface-input font-mono text-lg text-[var(--color-accent-green)]" />
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

              {/* Transmission History label */}
              <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted font-semibold mb-3">
                {conversation.length > 0 ? `TRANSMISSION HISTORY · ${conversation.length} messages` : 'NO TRANSMISSIONS YET'}
              </p>

              {/* Conversation Area */}
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

              {/* Suggested Questions */}
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

              {/* Error */}
              {error && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-accentRed/10 border border-accentRed text-red-200 text-xs px-3 py-2 rounded-[var(--radius-sm)] mb-3"
                >
                  {error}
                </motion.div>
              )}

              {/* Input */}
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
      </div>
    </div>
  );
};

export default RaceEngineerPage;
