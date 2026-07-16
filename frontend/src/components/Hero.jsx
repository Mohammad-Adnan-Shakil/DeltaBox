import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, LogIn, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import TelemetryCanvas, { MODEL_STATS } from "./TelemetryCanvas";
import Logo from "./Logo";

const staggerItem = (delay) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] } },
});

const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-screen flex flex-col bg-[var(--color-base-950)] overflow-hidden">

      <TelemetryCanvas />

      <div className="pointer-events-none absolute inset-0 bg-grid-white/[0.025]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: "64px 64px",
      }} />

      <div className="pointer-events-none absolute inset-0" style={{
        background: "radial-gradient(ellipse at 20% 50%, rgba(227,30,30,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.05) 0%, transparent 50%)",
      }} />

      <div className="pointer-events-none absolute inset-0" style={{
        background: "linear-gradient(to top, var(--color-base-950) 0%, transparent 40%)",
      }} />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <motion.div {...staggerItem(0)} className="flex items-center gap-3">
          <Logo size={32} />
          <span className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Delta<span className="text-[var(--color-accent-500)]">Box</span>
          </span>
        </motion.div>

        <motion.div {...staggerItem(0.1)} className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-[var(--radius-md)] bg-[var(--color-accent-500)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:brightness-110 hover:shadow-[var(--shadow-glow-sm)]"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="rounded-[var(--radius-md)] border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-glass-hover)] flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="rounded-[var(--radius-md)] bg-[var(--color-accent-500)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:brightness-110 hover:shadow-[var(--shadow-glow-sm)] flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Sign Up
              </button>
            </>
          )}
        </motion.div>
      </nav>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div {...staggerItem(0.2)} className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-4 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-data-success)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-data-success)]" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                AI-Powered F1 Intelligence
              </span>
            </div>
          </motion.div>

          <motion.h1
            {...staggerItem(0.3)}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-[var(--color-text-primary)] sm:text-6xl md:text-7xl lg:text-8xl"
          >
            DeltaBox
          </motion.h1>

          <motion.p
            {...staggerItem(0.4)}
            className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg"
          >
            Predict race outcomes with machine learning. Analyze telemetry, compare drivers, and simulate what-if scenarios — powered by XGBoost and Random Forest models trained on real F1 data.
          </motion.p>

          <motion.div
            {...staggerItem(0.5)}
            className="mt-10 inline-flex flex-wrap items-center justify-center gap-6 rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-base-900)]/60 px-6 py-4 font-mono text-sm backdrop-blur-sm"
          >
            <span className="flex items-center gap-2">
              <span className="text-[var(--color-text-tertiary)]">MODEL R²</span>
              <span className="font-bold text-[var(--color-data-primary)]">{MODEL_STATS.rSquared.toFixed(2)}</span>
            </span>
            <span className="hidden h-4 w-px bg-[var(--color-glass-border)] sm:block" />
            <span className="flex items-center gap-2">
              <span className="text-[var(--color-text-tertiary)]">MAE</span>
              <span className="font-bold text-[var(--color-data-warning)]">±{MODEL_STATS.mae.toFixed(2)}</span>
              <span className="text-[var(--color-text-tertiary)]">positions</span>
            </span>
            <span className="hidden h-4 w-px bg-[var(--color-glass-border)] sm:block" />
            <span className="flex items-center gap-2">
              <span className="text-[var(--color-text-tertiary)]">TRAINING SAMPLES</span>
              <span className="font-bold text-[var(--color-data-success)]">{MODEL_STATS.samples.toLocaleString()}</span>
            </span>
          </motion.div>

          <motion.div
            {...staggerItem(0.6)}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <button
              onClick={() => navigate("/ai")}
              className="group relative inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-accent-500)] px-6 py-3 text-sm font-semibold tracking-wide text-[var(--color-text-primary)] transition-all hover:brightness-110 hover:shadow-[var(--shadow-glow)] active:scale-[0.98]"
            >
              Explore Apex Intelligence
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-6 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-glass-hover)] active:scale-[0.98]"
            >
              Live Standings
            </button>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 1.2, duration: 0.8 } }}
        className="relative z-10 flex justify-center pb-10"
      >
        <button
          onClick={() => {
            document.querySelector("[data-hero-scroll-target]")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex flex-col items-center gap-1 text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-secondary)]"
          aria-label="Scroll to content"
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </button>
      </motion.div>
    </section>
  );
};

export default Hero;
