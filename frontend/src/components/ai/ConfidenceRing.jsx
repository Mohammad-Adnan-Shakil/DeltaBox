import { useMemo } from "react";
import { motion } from "framer-motion";

export const ConfidenceRing = ({ percentage = 0, size = 120, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const color = useMemo(() => {
    if (percentage > 70) return "var(--color-data-success)";
    if (percentage >= 40) return "var(--color-data-warning)";
    return "var(--color-data-danger)";
  }, [percentage]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`Confidence ${Math.round(percentage)} percent`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--color-base-600)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-mono text-lg font-bold"
        style={{ color }}
      >
        {Math.round(percentage)}%
      </span>
    </div>
  );
};

export default ConfidenceRing;
