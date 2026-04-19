export const Card = ({ children, className = "", hover = false }) => {
  return (
    <div
      className={`
        bg-gray-900 border border-gray-800 rounded-lg p-6
        transition-all duration-300
        ${hover ? "hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
