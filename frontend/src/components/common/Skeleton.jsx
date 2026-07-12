const shimmerOverlay = "absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-base-600)]/30 to-transparent bg-[length:200%_100%] animate-shimmer";

export const Skeleton = ({ variant = "text", count = 1, className = "" }) => {
  const variants = {
    text: "h-4 w-full rounded-[var(--radius-sm)]",
    card: "h-32 w-full rounded-[var(--radius-lg)]",
    "table-row": "h-10 w-full rounded-[var(--radius-sm)]",
    circle: "h-10 w-10 rounded-full",
  };

  const baseClass = "bg-[var(--color-base-800)] relative overflow-hidden";

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`${baseClass} ${variants[variant] || variants.text} ${className}`}
          aria-hidden="true"
        >
          <div className={shimmerOverlay} />
        </div>
      ))}
    </>
  );
};

export const SkeletonCard = ({ count = 1 }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-lg)] bg-[var(--color-base-800)] p-[var(--space-6)] relative overflow-hidden"
          aria-hidden="true"
        >
          <div className="space-y-3">
            <div className="h-4 w-3/4 rounded-[var(--radius-sm)] bg-[var(--color-base-700)]" />
            <div className="h-8 w-1/2 rounded-[var(--radius-sm)] bg-[var(--color-base-700)]" />
            <div className="h-3 w-1/3 rounded-[var(--radius-sm)] bg-[var(--color-base-700)]" />
          </div>
          <div className={shimmerOverlay} />
        </div>
      ))}
    </>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--color-base-800)] p-[var(--space-6)] relative overflow-hidden">
      <div className="space-y-4">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex gap-4">
            {[...Array(cols)].map((_, j) => (
              <div key={j} className="h-4 flex-1 rounded-[var(--radius-sm)] bg-[var(--color-base-700)]" />
            ))}
          </div>
        ))}
      </div>
      <div className={shimmerOverlay} />
    </div>
  );
};

export const SkeletonChart = () => {
  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--color-base-800)] p-[var(--space-6)] relative overflow-hidden">
      <div className="space-y-3">
        <div className="h-6 w-1/3 rounded-[var(--radius-sm)] bg-[var(--color-base-700)]" />
        <div className="h-40 rounded-[var(--radius-md)] bg-[var(--color-base-700)]" />
      </div>
      <div className={shimmerOverlay} />
    </div>
  );
};
