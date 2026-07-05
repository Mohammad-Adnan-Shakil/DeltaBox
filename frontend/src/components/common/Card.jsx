import { motion } from "framer-motion";

export const Card = ({ children, className = "", hover = true, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={`f1-card ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;

