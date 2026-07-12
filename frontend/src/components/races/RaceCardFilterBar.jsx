const FILTERS = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "scheduled", label: "Scheduled" },
];

export const RaceCardFilterBar = ({ value = "all", onChange }) => {
  return (
    <div className="flex gap-1 rounded-[var(--radius-md)] bg-[var(--color-base-800)] p-1">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`
            rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium
            transition-all duration-150 ease-out
            ${
              value === f.value
                ? "bg-[var(--color-accent-500)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-base-700)]"
            }
          `}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};

export default RaceCardFilterBar;
