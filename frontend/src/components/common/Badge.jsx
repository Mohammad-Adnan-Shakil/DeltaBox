/**
 * Reusable Badge Component for status indicators, tags, etc.
 */
export const Badge = ({ children, variant = "default", size = "md" }) => {
  const variants = {
    default: "bg-gray-700 text-gray-100",
    success: "bg-green-500/20 text-green-400",
    warning: "bg-yellow-500/20 text-yellow-400",
    danger: "bg-red-500/20 text-red-400",
    info: "bg-blue-500/20 text-blue-400",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`
        ${variants[variant]}
        ${sizes[size]}
        font-semibold rounded-full inline-block
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
