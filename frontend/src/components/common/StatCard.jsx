import AnimatedCount from "./AnimatedCount";

const colorMap = {
  red: "text-[var(--color-text-accent)]",
  blue: "text-[var(--color-data-primary)]",
  green: "text-[var(--color-data-success)]",
  yellow: "text-[var(--color-data-warning)]",
};

export const StatCard = ({ label, value, icon: Icon, trend = null, color = "red" }) => {
  const colorClass = colorMap[color] || colorMap.red;

  return (
    <div className="rounded-[var(--radius-lg)] p-[var(--space-6)] bg-[var(--color-glass-bg)] border border-[var(--color-accent-500)]/20 shadow-[var(--shadow-glow-sm)] transition-shadow duration-150 ease-out hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
            {label}
          </p>
          <p className={`mt-2 text-4xl font-bold leading-none ${colorClass}`}>
            <AnimatedCount value={value || 0} duration={500} />
          </p>
          {trend !== null && (
            <p className={`mt-2 text-xs font-medium ${trend > 0 ? "text-[var(--color-data-success)]" : "text-[var(--color-data-danger)]"}`}>
              {trend > 0 ? "\u2191" : "\u2193"} {Math.abs(trend)}% from last season
            </p>
          )}
        </div>
        {Icon && (
          <div className={`shrink-0 opacity-50 ${colorClass}`}>
            <Icon className="h-8 w-8" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
