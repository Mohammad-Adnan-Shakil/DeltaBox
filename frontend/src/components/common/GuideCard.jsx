import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";

const STORAGE_PREFIX = "deltabox_guide_dismissed_";

const GuideCard = ({ pageKey, title, steps }) => {
  const storageKey = `${STORAGE_PREFIX}${pageKey}`;
  const [isOpen, setIsOpen] = useState(() => !localStorage.getItem(storageKey));

  const handleToggle = () => {
    if (isOpen) {
      localStorage.setItem(storageKey, "true");
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] backdrop-blur-xl shadow-md overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 sm:p-6 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent-500)]/10">
            <BookOpen className="h-3.5 w-3.5 text-[var(--color-accent-500)]" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-[var(--color-text-tertiary)]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[var(--color-text-tertiary)]" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-accent-500)]/10 text-[var(--color-accent-500)] text-xs font-bold font-mono">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{step.title}</p>
                    {step.description && (
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{step.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuideCard;
