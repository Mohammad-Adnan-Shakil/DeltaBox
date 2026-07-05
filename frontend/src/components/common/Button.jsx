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
    primary: "bg-accentRed text-whitePrimary hover:brightness-110 hover:shadow-[0_0_20px_rgba(232,0,45,0.3)]",
    secondary: "bg-[var(--color-bg-elevated)] text-whitePrimary border border-[var(--color-border-default)] hover:bg-white/10",
    ghost: "bg-transparent text-whiteMuted border border-[var(--color-border-default)] hover:text-whitePrimary hover:bg-white/5",
    danger: "bg-accentRed/90 text-whitePrimary hover:brightness-110",
  };

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-sm",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        rounded-[var(--radius-md)] font-semibold tracking-wide transition-all duration-200 focus-visible:outline-2 focus-visible:outline-accentRed focus-visible:outline-offset-2
        ${variants[variant]} ${sizes[size]}
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.97]
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {children}
        </span>
      ) : children}
    </button>
  );
};

export default Button;

