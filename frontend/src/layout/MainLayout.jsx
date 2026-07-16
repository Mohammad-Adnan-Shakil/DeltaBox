import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } },
};

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--color-base-950)] text-[var(--color-text-primary)] relative">
      <div className="pointer-events-none fixed inset-0 bg-grid-white/[0.025]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: "64px 64px",
      }} />
      <div className="pointer-events-none fixed inset-0" style={{
        background: "radial-gradient(ellipse at 20% 50%, rgba(227,30,30,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.03) 0%, transparent 50%)",
      }} />
      {/* Mobile top bar */}
      <div className="lg:hidden flex h-14 items-center justify-between border-b border-[var(--color-base-600)] px-4 sticky top-0 bg-[var(--color-base-900)] z-50">
        <button
          className="rounded-lg border border-[var(--color-base-600)] bg-[var(--color-base-700)] p-2 text-[var(--color-text-secondary)]"
          onClick={() => setMobileNavOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-[var(--radius-sm)] bg-[var(--color-accent-500)] flex items-center justify-center">
            <span className="text-[var(--color-text-primary)] font-bold text-xs">D</span>
          </div>
          <span className="text-[var(--color-text-primary)] font-bold text-base tracking-tight">DeltaBox</span>
        </div>
      </div>

      <div className="flex lg:h-screen lg:overflow-hidden">
        <Sidebar
          mobileOpen={mobileNavOpen}
          onNavigate={() => setMobileNavOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />

        <main className="min-w-0 flex-1 lg:overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="px-6 py-6 md:px-8 lg:px-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
