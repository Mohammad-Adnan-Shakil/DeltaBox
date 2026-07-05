import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-whitePrimary">
      <div className="lg:hidden flex h-14 items-center justify-between border-b border-[var(--color-border-default)] px-4 sticky top-0 bg-[var(--color-bg-elevated)] z-50 backdrop-blur-lg">
        <button
          className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-hover)] p-2 text-text-secondary"
          onClick={() => setMobileNavOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap">
          <Logo size={26} />
          <div className="hidden sm:block">
            <span className="text-accentRed font-black tracking-widest text-xl">DELTA</span>
            <span className="text-whitePrimary font-black tracking-widest text-xl">BOX</span>
          </div>
        </div>
        <p className="text-xs text-text-muted">{user?.username || "User"}</p>
      </div>

      <div className="flex">
        <Sidebar mobileOpen={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />

        <main className="min-w-0 flex-1">
          <div className="hidden h-16 items-center justify-end border-b border-[var(--color-border-default)] px-6 lg:flex sticky top-0 bg-[var(--color-bg-elevated)]/80 backdrop-blur-lg z-50">
            <p className="text-sm text-text-secondary">{user?.username || "User"}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-6 md:px-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

