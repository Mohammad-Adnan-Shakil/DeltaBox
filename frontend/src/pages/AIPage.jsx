import { useState, useEffect } from "react";
import api from "../utils/axios";
import { motion } from "framer-motion";
import { useFetch, usePost } from "../hooks/useFetch";
import { Card, Button, Input, Loader } from "../components/common";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AIPage = () => {
  const { data: drivers } = useFetch("/drivers");
  const { data: races } = useFetch("/races");
  const { execute: runPrediction, loading } = usePost("/ai/intelligence");

  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedRace, setSelectedRace] = useState("");
  const [simulatedPosition, setSimulatedPosition] = useState(10);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Run AI Prediction
  const handlePrediction = async () => {
    if (!selectedDriver || !selectedRace) {
      setError("Please select a driver and race");
      return;
    }

    try {
      setError("");
      const prediction = await runPrediction({
        driverId: parseInt(selectedDriver),
        raceId: parseInt(selectedRace),
        simulatedPosition: simulatedPosition,
      });
      setResult(prediction);
    } catch (err) {
      setError(err.message || "Prediction failed");
    }
  };

  const selectedDriverData = drivers?.find(
    (d) => d.driverId === parseInt(selectedDriver)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
          <span className="text-red-500">⚡</span> AI Intelligence Engine
        </h1>
        <p className="text-gray-400">Predict race positions and driver performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel */}
        <Card className="lg:col-span-1 h-fit">
          <h2 className="text-lg font-bold text-white mb-6">Prediction Setup</h2>

          {/* Driver Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Driver
              </label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                  focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              >
                <option value="">Choose a driver...</option>
                {drivers?.map((d) => (
                  <option key={d.driverId} value={d.driverId}>
                    {d.code || d.name} — {d.team || "No Team"}
                  </option>
                ))}
              </select>
            </div>

            {/* Race Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Race
              </label>
              <select
                value={selectedRace}
                onChange={(e) => setSelectedRace(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white
                  focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              >
                <option value="">Choose a race...</option>
                {races?.map((r) => (
                  <option key={r.raceId} value={r.raceId}>
                    {r.raceName || `Race ${r.raceId}`} — {r.location}
                  </option>
                ))}
              </select>
            </div>

            {/* Simulated Position Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Simulated Starting Position
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={simulatedPosition}
                  onChange={(e) => setSimulatedPosition(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <span className="text-2xl font-bold text-red-500 w-8 text-right">
                  P{simulatedPosition}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>}

            {/* Run Button */}
            <Button
              onClick={handlePrediction}
              disabled={loading || !selectedDriver || !selectedRace}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {loading ? "🔄 Analyzing..." : "⚡ Run Prediction"}
            </Button>
          </div>

          {/* Selected Driver Info */}
          {selectedDriverData && (
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-xs text-gray-500 mb-3 uppercase font-bold">Current Selection</p>
              <div className="space-y-2">
                <p className="text-white font-bold">{selectedDriverData.name}</p>
                <p className="text-gray-400">{selectedDriverData.team || "Free Agent"}</p>
                <p className="text-red-500 font-bold">{selectedDriverData.points || 0} Points</p>
              </div>
            </div>
          )}
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!result && !loading && (
            <Card className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <p className="text-gray-400 text-lg">👆 Select driver and race to start</p>
              </div>
            </Card>
          )}

          {loading && (
            <Card className="flex items-center justify-center min-h-[300px]">
              <Loader size="lg" message="Analyzing prediction..." />
            </Card>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Main Prediction Card */}
              <Card hover className="bg-gradient-to-r from-red-500/10 to-transparent border-red-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-2">PREDICTED POSITION</p>
                    <motion.div
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="text-6xl font-bold text-red-500"
                    >
                      P{result.prediction?.predictedPosition || "—"}
                    </motion.div>
                  </div>

                  {/* Confidence Gauge */}
                  <div className="text-right">
                    <p className="text-gray-400 text-sm font-medium mb-3">Confidence</p>
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#374151" strokeWidth="6" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth="6"
                          strokeDasharray={`${(result.prediction?.confidence || 0) * 282.74} 282.74`}
                          strokeLinecap="round"
                          style={{ rotate: "-90deg", transformOrigin: "50% 50%" }}
                        />
                      </svg>
                      <span className="absolute text-2xl font-bold text-white">
                        {Math.round((result.prediction?.confidence || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Insights Grid */}
              <div className="grid grid-cols-3 gap-4">
                <Card hover>
                  <p className="text-gray-400 text-xs font-bold uppercase mb-2">Avg Finish</p>
                  <p className="text-3xl font-bold text-blue-500">
                    P{result.insights?.averageFinish || "—"}
                  </p>
                </Card>

                <Card hover>
                  <p className="text-gray-400 text-xs font-bold uppercase mb-2">Consistency</p>
                  <p className="text-3xl font-bold text-green-500">
                    {((result.insights?.consistencyScore || 0) * 100).toFixed(0)}%
                  </p>
                </Card>

                <Card hover>
                  <p className="text-gray-400 text-xs font-bold uppercase mb-2">Trend</p>
                  <p className="text-3xl font-bold text-yellow-500">
                    {result.insights?.trend || "—"}
                  </p>
                </Card>
              </div>

              {/* Simulation Results */}
              {result.simulation && (
                <Card>
                  <p className="text-gray-400 text-sm font-bold uppercase mb-4">Position Impact</p>
                  <div className="flex items-center justify-around">
                    <div className="text-center">
                      <p className="text-gray-500 text-xs mb-2">Current Avg</p>
                      <p className="text-2xl font-bold text-red-500">
                        P{result.simulation.oldAverage || "—"}
                      </p>
                    </div>
                    <span className="text-2xl text-gray-600">→</span>
                    <div className="text-center">
                      <p className="text-gray-500 text-xs mb-2">New Avg</p>
                      <p className="text-2xl font-bold text-green-500">
                        P{result.simulation.newAverage || "—"}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Summary */}
              {result.summary && (
                <Card>
                  <p className="text-gray-400 text-sm font-bold uppercase mb-3">Analysis</p>
                  <p className="text-gray-300 leading-relaxed">{result.summary}</p>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPage;