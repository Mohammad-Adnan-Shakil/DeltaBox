/**
 * Reusable Input Component
 */
export const Input = ({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error = "",
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg
          text-white placeholder-gray-500
          focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-red-500" : ""}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
