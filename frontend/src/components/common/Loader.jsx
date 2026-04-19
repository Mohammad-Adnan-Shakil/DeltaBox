/**
 * Reusable Loader/Spinner Component
 */
export const Loader = ({ size = "md", message = "Loading..." }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`
          ${sizes[size]}
          border-4 border-gray-700 border-t-red-500
          rounded-full animate-spin
        `}
      ></div>
      {message && <p className="text-gray-400 text-sm">{message}</p>}
    </div>
  );
};

/**
 * Full Page Loader
 */
export const FullPageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <Loader size="lg" message={message} />
    </div>
  );
};

export default Loader;
