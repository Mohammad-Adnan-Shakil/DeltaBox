import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, LogIn, User, Activity, BarChart3, TrendingUp, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import TelemetryCanvas, { MODEL_STATS } from "./TelemetryCanvas";
import Logo from "./Logo";

const staggerItem = (delay) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] } },
});

const BoxedDelta = ({ size = 48 }) => (
  <div
    className="flex items-center justify-center rounded-xl"
    style={{
      width: size,
      height: size,
      backgroundColor: "var(--color-base-800)",
    }}
  >
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 28 28" fill="none">
      <path d="M14 4.69 L23.31 23.31 L4.69 23.31 Z" fill="var(--color-accent-500)" />
    </svg>
  </div>
);

const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-screen flex flex-col bg-[var(--color-base-950)] overflow-hidden">

      <style>{`
        .btn-cta::after {
          content: '';
          position: absolute;
          top: 0;
          left: -75%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transform: skewX(-25deg);
          transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
        }
        .btn-cta:hover::after {
          left: 125%;
        }
      `}</style>

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

          <motion.div {...staggerItem(0.2)} className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                APEX INTELLIGENCE
              </span>
              <span className="h-3 w-px bg-[var(--color-glass-border)]" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-500)]">
                01 / PREDICTION
              </span>
            </div>
          </motion.div>

          <motion.div {...staggerItem(0.25)} className="mb-6 flex justify-center">
            <BoxedDelta size={48} />
          </motion.div>

          <motion.h1
            {...staggerItem(0.3)}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
          >
            <span className="text-[var(--color-text-primary)]">Every tenth of a second,</span>
            <br />
            <span className="relative inline-block">
              <span className="text-[var(--color-text-primary)]/40">decoded.</span>
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--color-accent-500)]" />
            </span>
          </motion.h1>

          <motion.p
            {...staggerItem(0.4)}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg"
          >
            Predict race outcomes with machine learning. Analyze telemetry, compare drivers, and simulate what-if scenarios — powered by XGBoost and Random Forest models trained on real F1 data.
          </motion.p>

          <motion.div
            {...staggerItem(0.5)}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <button
              onClick={() => navigate("/ai")}
              className="btn-cta group relative inline-flex items-center gap-2 overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-accent-500)] px-6 py-3 text-sm font-semibold tracking-wide text-[var(--color-text-primary)] transition-all hover:brightness-110 hover:shadow-[var(--shadow-glow)] active:scale-[0.98]"
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

          <motion.div {...staggerItem(0.6)} className="mt-12 mx-auto w-full max-w-lg">
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-base-900)]/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-[var(--color-glass-border)] px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="ml-3 font-mono text-[11px] text-[var(--color-text-tertiary)]">
                  session://apex-model.eval
                </span>
                <div className="ml-auto flex items-center gap-1.5 rounded-full border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-2 py-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-data-success)] opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-data-success)]" />
                  </span>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--color-data-success)]">
                    LIVE
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-[var(--color-glass-border)]">
                <div className="flex flex-col items-center py-4">
                  <span className="font-mono text-2xl font-bold text-[var(--color-data-primary)]">{MODEL_STATS.rSquared.toFixed(2)}</span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">R² Score</span>
                </div>
                <div className="flex flex-col items-center py-4">
                  <span className="font-mono text-2xl font-bold text-[var(--color-data-warning)]">&plusmn;{MODEL_STATS.mae.toFixed(2)}</span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">MAE</span>
                </div>
                <div className="flex flex-col items-center py-4">
                  <span className="font-mono text-2xl font-bold text-[var(--color-data-success)]">{MODEL_STATS.samples.toLocaleString()}</span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">Samples</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 border-t border-[var(--color-glass-border)] px-4 py-2">
                <span className="font-mono text-[11px] text-[var(--color-text-tertiary)]">
                  $ deltabox.query --model apex-v2.4 --scope race
                </span>
                <span className="inline-block h-3.5 w-2 animate-pulse bg-[var(--color-text-tertiary)]" style={{ opacity: 0.7 }} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 1.2, duration: 0.8 } }}
        className="relative z-10 px-6 pb-20 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
              APEX DASHBOARD &middot; Preview
            </span>
          </div>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-glass-border)]">
            <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-[var(--color-data-primary)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Performance</span>
                </div>
                <div className="flex h-16 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-base-800)]">
                  <div className="flex h-10 items-end gap-1">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="w-2 rounded-t-sm bg-[var(--color-data-primary)]/40" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Next Race</span>
                </div>
                <div className="flex h-16 flex-col items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-base-800)]">
                  <span className="text-[10px] font-semibold text-[var(--color-text-tertiary)]">Round 12</span>
                  <span className="text-xs font-bold text-[var(--color-text-secondary)]">Silverstone</span>
                </div>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Top Driver</span>
                </div>
                <div className="flex h-16 flex-col items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-base-800)]">
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">M.VER</span>
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">186 pts</span>
                </div>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-[var(--color-accent-500)]/30 bg-[var(--color-accent-500)]/5 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-[var(--color-accent-500)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent-500)]">AI Predict</span>
                </div>
                <div className="flex h-16 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-base-800)]">
                  <div className="text-center">
                    <span className="font-mono text-lg font-bold text-[var(--color-accent-500)]">1.</span>
                    <span className="ml-1 font-mono text-[10px] text-[var(--color-text-tertiary)]">VER</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--color-base-950)] via-[var(--color-base-950)]/80 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex justify-center pb-6">
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
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
