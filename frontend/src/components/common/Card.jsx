import { motion } from "framer-motion";

export const Card = ({ children, className = "", hover = true, delay = 0, accent = false, ...props }) => {
  return (
    <motion.div
      {...props}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={hover ? { y: -2, transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } } : undefined}
      className={`
        rounded-[var(--radius-lg)] p-[var(--space-6)]
        bg-[var(--color-glass-bg)] border
        shadow-md
        transition-shadow duration-150 ease-out
        ${accent
          ? "border-[var(--color-accent-500)]/20 shadow-[var(--shadow-glow-sm)]"
          : "border-[var(--color-glass-border)]"
        }
        ${hover ? "hover:shadow-lg" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;
