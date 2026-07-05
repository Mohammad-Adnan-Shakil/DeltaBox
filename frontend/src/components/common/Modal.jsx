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
              bg-[var(--color-bg-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)]
              shadow-[var(--shadow-xl)] z-50 max-sm:bottom-0 max-sm:top-auto max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none
            `}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-default)]">
                <h2 className="text-xl font-bold text-whitePrimary">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-text-muted hover:text-whitePrimary transition"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border-default)]">
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
