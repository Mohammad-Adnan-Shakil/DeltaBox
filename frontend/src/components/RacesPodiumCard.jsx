import React from "react";
import { motion } from "framer-motion";

/**
 * Map driver nationalities to emoji flags
 */
const driverFlags = {
  // Red Bull
  "VER": "🇳🇱",  // Max Verstappen - Netherlands
  "PER": "🇲🇽",  // Sergio Pérez - Mexico
  
  // Ferrari
  "LEC": "🇲🇨",  // Charles Leclerc - Monaco
  "SAI": "🇲🇽",  // Carlos Sainz - Spain
  
  // Mercedes
  "HAM": "🇬🇧",  // Lewis Hamilton - United Kingdom
  "RUS": "🇩🇪",  // George Russell - Germany
  
  // Alpine/Renault
  "ALO": "🇪🇸",  // Fernando Alonso - Spain
  "OCO": "🇫🇷",  // Esteban Ocon - France
  
  // McLaren
  "NOR": "🇬🇧",  // Lando Norris - United Kingdom
  "PIA": "🇵🇱",  // Oscar Piastri - Australia
  
  // Aston Martin
  "STR": "🇨🇦",  // Lance Stroll - Canada
  "AMR": "🇩🇪",  // Fernando Alonso - Spain
  
  // Williams
  "ALB": "🇬🇧",  // Alexander Albon - Thailand
  "LAT": "🇬🇧",  // Logan Sargeant - United States
  
  // Haas
  "MAG": "🇩🇰",  // Kevin Magnussen - Denmark
  "HUL": "🇩🇪",  // Nico Hulkenberg - Germany
  
  // RB
  "TSU": "🇯🇵",  // Yuki Tsunoda - Japan
  "GAS": "🇹🇭",  // Alexander Albon - Thailand
  
  // Kick Sauber
  "BOT": "🇫🇮",  // Valtteri Bottas - Finland
  "ZHO": "🇨🇳",  // Zhou Guanyu - China
  
  // Default for unknown drivers
  "DEF": "🏁"
};

const getFlag = (driverCode) => driverFlags[driverCode] || driverFlags["DEF"];

/**
 * RacesPodiumCard Component
 * Displays top 3 drivers from race results with flags and animations
 */
const RacesPodiumCard = ({ raceName, results, loading = false }) => {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-bgSecondary border border-red-900/30 rounded-lg p-4 animate-pulse"
      >
        <div className="h-6 bg-gray-700 rounded mb-4 w-32"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-700 rounded"></div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  const topThree = results.slice(0, 3);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-red-950/40 to-gray-950/40 border border-red-900/50 rounded-xl p-4 shadow-lg shadow-red-900/20 backdrop-blur-sm"
    >
      {/* Header */}
      <h3 className="text-sm font-bold uppercase tracking-widest text-red-400 mb-3">
        🏆 Race Results
      </h3>

      {/* Podium Positions */}
      <div className="space-y-2">
        {topThree.map((result, index) => (
          <motion.div
            key={result.position || index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 bg-gray-900/50 hover:bg-gray-900/80 rounded-lg px-3 py-2 transition-colors duration-200"
          >
            {/* Medal */}
            <span className="text-lg w-6">{medals[index]}</span>

            {/* Driver Flag */}
            <span className="text-xl">
              {getFlag(result.driverCode || result.code)}
            </span>

            {/* Driver Code */}
            <span className="font-bold text-white min-w-12">
              {result.driverCode || result.code || `P${index + 1}`}
            </span>

            {/* Points (if available) */}
            {result.points !== undefined && (
              <span className="ml-auto text-xs text-gray-400 font-mono">
                {result.points} pts
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Race Name (optional footer) */}
      {raceName && (
        <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-800">
          {raceName}
        </p>
      )}
    </motion.div>
  );
};

export default RacesPodiumCard;
