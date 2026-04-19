/**
 * Reusable Button Component
 */
export const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) => {
  const variants = {
    primary: "bg-red-500 hover:bg-red-600 text-white",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600",
    danger: "bg-red-700 hover:bg-red-800 text-white",
    ghost: "bg-transparent border border-gray-700 text-white hover:bg-gray-800",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg font-semibold transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-105 active:scale-95
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
