export const roundPosition = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return Math.round(num);
};

export const roundAverage = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return Number(num.toFixed(1));
};

export const confidenceToPercent = (value) => {
  const raw = Number(value || 0);
  const normalized = raw <= 1 ? raw * 100 : raw;
  return Math.max(0, Math.min(100, Math.round(normalized)));
};

export const formatImpact = (impact) => {
  const map = {
    NEGATIVE_IMPACT: "Starting further back reduces avg finish",
    POSITIVE_IMPACT: "Better grid position improves predicted finish",
    SLIGHT_IMPROVEMENT: "Marginal improvement expected",
    NO_IMPACT: "Grid position has minimal effect for this driver",
    MINIMAL_IMPACT: "Grid position has minimal effect for this driver",
    MODERATE_IMPROVEMENT: "Better grid position improves predicted finish",
    STRONG_IMPROVEMENT: "Better grid position improves predicted finish",
  };
  return map[impact] || "Model impact currently unavailable";
};

export const impactIcon = (impact) => {
  if (["NEGATIVE_IMPACT"].includes(impact)) return "📉";
  if (["POSITIVE_IMPACT", "MODERATE_IMPROVEMENT", "STRONG_IMPROVEMENT"].includes(impact)) return "📈";
  if (["SLIGHT_IMPROVEMENT"].includes(impact)) return "📊";
  return "➡️";
};

export const formatRaceDate = (date) => {
  if (!date) return "TBD";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const teamColor = (teamName = "") => {
  // Handle null/undefined values
  if (!teamName) return "#808080"; // Gray fallback
  const key = String(teamName).toLowerCase();
  if (key.includes("mercedes")) return "#00d2be";
  if (key.includes("ferrari")) return "#e8002d";
  if (key.includes("mclaren")) return "#ff8000";
  if (key.includes("red bull")) return "#1e3a8a";
  if (key.includes("aston")) return "#0f766e";
  if (key.includes("haas")) return "#ffffff";
  if (key.includes("williams")) return "#2563eb";
  if (key.includes("alpine")) return "#ec4899";
  if (key.includes("sauber") || key.includes("stake")) return "#22c55e";
  if (key.includes("rb f1") || key === "rb") return "#6366f1";
  return "#ffffff";
};

export const nationalityFlag = (nationality = "") => {
  const map = {
    british: "🇬🇧",
    italian: "🇮🇹",
    german: "🇩🇪",
    australian: "🇦🇺",
    dutch: "🇳🇱",
    monegasque: "🇲🇨",
    french: "🇫🇷",
    spanish: "🇪🇸",
    thai: "🇹🇭",
    japanese: "🇯🇵",
    brazilian: "🇧🇷",
    canadian: "🇨🇦",
    austrian: "🇦🇹",
    swiss: "🇨🇭",
    american: "🇺🇸",
    "new zealander": "🇳🇿",
    finnish: "🇫🇮",
  };
  return map[nationality.toLowerCase()] || "🏁";
};
