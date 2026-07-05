export const Badge = ({ children, variant = "default", size = "md" }) => {
  const variants = {
    default: "bg-[var(--color-bg-hover)] text-text-secondary",
    success: "bg-[var(--color-accent-green)]/20 text-[var(--color-accent-green)]",
    warning: "bg-[var(--color-accent-gold)]/20 text-[var(--color-accent-gold)]",
    danger: "bg-[var(--color-accent-red)]/20 text-[var(--color-accent-red)]",
    info: "bg-[var(--color-accent-blue)]/20 text-[var(--color-accent-blue)]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`
        ${variants[variant]}
        ${sizes[size]}
        font-semibold rounded-full inline-block tracking-wide
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
