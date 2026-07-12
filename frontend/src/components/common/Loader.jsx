export const Loader = ({ size = "md", message = "Loading data..." }) => {
  const sizes = {
    sm: "h-4 w-4 border-[2px]",
    md: "h-7 w-7 border-[2px]",
    lg: "h-10 w-10 border-[3px]",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <span
        className={`${sizes[size]} rounded-full border-current/30 border-t-[var(--color-accent-500)] animate-spin text-[var(--color-text-tertiary)]`}
        role="status"
        aria-label="Loading"
      />
      {message ? (
        <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
      ) : null}
    </div>
  );
};

export const FullPageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="rounded-[var(--radius-lg)] bg-[var(--color-base-800)] border border-[var(--color-glass-border)] shadow-[var(--shadow-lg)] min-w-[260px]">
        <Loader size="lg" message={message} />
      </div>
    </div>
  );
};

export default Loader;
