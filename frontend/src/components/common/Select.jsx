import { ChevronDown } from "lucide-react";

export const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  disabled = false,
  error = "",
  className = "",
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full h-11 rounded-[var(--radius-md)]
            bg-[var(--color-base-700)] border
            appearance-none cursor-pointer
            px-4 py-3 pr-10 text-sm text-[var(--color-text-primary)]
            outline-none transition-all duration-150 ease-out
            focus:border-[var(--color-accent-500)] focus:ring-[3px] focus:ring-[var(--color-accent-500)]/15
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-[var(--color-data-danger)]" : "border-[var(--color-base-500)]"}
            ${className}
          `}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
      </div>
      {error && (
        <p className="mt-1 text-xs text-[var(--color-data-danger)]">{error}</p>
      )}
    </div>
  );
};

export default Select;
