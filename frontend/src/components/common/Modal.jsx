import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

/**
 * Reusable Modal Dialog Component
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  size = "md",
}) => {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className={`
              fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              ${sizes[size]} w-full mx-4
              bg-gray-900 border border-gray-800 rounded-lg
              shadow-xl z-50
            `}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
