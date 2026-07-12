export const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  ...props
}) => {
  const variants = {
    primary: "bg-[var(--color-accent-500)] text-[var(--color-text-primary)] hover:brightness-110 hover:shadow-[var(--shadow-glow-sm)]",
    secondary: "bg-[var(--color-glass-bg)] text-[var(--color-text-primary)] border border-[var(--color-glass-border)] hover:bg-[var(--color-glass-hover)]",
    ghost: "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-glass-hover)]",
    danger: "bg-[var(--color-data-danger)] text-[var(--color-text-primary)] hover:brightness-110",
  };

  const sizes = {
    sm: "px-3 py-2 text-xs min-h-[32px]",
    md: "px-4 py-2.5 text-sm min-h-[40px]",
    lg: "px-5 py-3 text-base min-h-[48px]",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-[var(--radius-md)] font-medium tracking-wide
        transition-all duration-150 ease-out
        focus-visible:outline-2 focus-visible:outline-[var(--color-accent-500)] focus-visible:outline-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.98]
        ${variants[variant]} ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
        </span>
      ) : children}
    </button>
  );
};

export default Button;
