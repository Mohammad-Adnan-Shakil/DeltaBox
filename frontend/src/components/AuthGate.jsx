import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

const AuthGate = ({ routeName = "/ai", featureName = "this feature" }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full rounded-2xl border border-accentRed/30 bg-[var(--color-bg-card)] p-8 text-center shadow-redGlow">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accentRed/15 text-accentRed">
          <Lock className="h-7 w-7" />
        </div>

        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">This feature requires an account</h2>
        <p className="text-[var(--color-text-secondary)] mt-3 text-sm">
          Create a free account to unlock F1 history browser and AI race predictions.
        </p>
        <p className="text-[var(--color-text-secondary)] mt-1 text-xs uppercase tracking-[0.2em]">Requested: {featureName}</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/register", { state: { from: routeName } })}
            className="rounded-xl bg-accentRed px-4 py-3 text-sm font-semibold text-white hover:bg-accentRed/90 transition"
          >
            Sign Up
          </button>

          <button
            onClick={() => navigate("/login", { state: { from: routeName } })}
            className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-white/5 transition"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthGate;
