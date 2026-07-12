export const Badge = ({ children, variant = "default", size = "sm" }) => {
  const variants = {
    default: "bg-[var(--color-base-600)] text-[var(--color-text-secondary)]",
    success: "bg-[var(--color-data-success)]/20 text-[var(--color-data-success)]",
    warning: "bg-[var(--color-data-warning)]/20 text-[var(--color-data-warning)]",
    danger: "bg-[var(--color-data-danger)]/20 text-[var(--color-data-danger)]",
    info: "bg-[var(--color-data-primary)]/20 text-[var(--color-data-primary)]",
    completed: "bg-[var(--color-data-success)]/20 text-[var(--color-data-success)]",
    scheduled: "bg-[var(--color-base-600)] text-[var(--color-text-secondary)]",
    p1: "bg-[var(--color-data-warning)]/20 text-[var(--color-data-warning)]",
    p2: "bg-[var(--color-text-secondary)]/20 text-[var(--color-text-secondary)]",
    p3: "bg-[var(--color-data-danger)]/20 text-[var(--color-data-danger)]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={`
        ${variants[variant] || variants.default}
        ${sizes[size]}
        inline-block rounded-[var(--radius-sm)]
        font-medium uppercase tracking-wide
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
