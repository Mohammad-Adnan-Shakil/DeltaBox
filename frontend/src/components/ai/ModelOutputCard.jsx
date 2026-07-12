import { AlertTriangle } from "lucide-react";

export const ModelOutputCard = ({ rfPrediction, xgbPrediction, blended, confidence }) => {
  const hasDivergence = rfPrediction != null && xgbPrediction != null &&
    Math.abs(rfPrediction - xgbPrediction) > 3;

  return (
    <div className="rounded-[var(--radius-lg)] p-[var(--space-6)] bg-[var(--color-glass-bg)] border border-[var(--color-accent-500)]/20 shadow-[var(--shadow-glow-sm)]">
      <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] mb-4">
        Model Output
      </h4>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-[var(--radius-md)] bg-[var(--color-base-800)] p-4 border border-[var(--color-data-primary)]/20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-data-primary)]">
            Random Forest
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-[var(--color-data-primary)]">
            {rfPrediction != null ? `P${Math.round(rfPrediction)}` : "--"}
          </p>
        </div>

        <div className="rounded-[var(--radius-md)] bg-[var(--color-base-800)] p-4 border border-[var(--color-data-warning)]/20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-data-warning)]">
            XGBoost
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-[var(--color-data-warning)]">
            {xgbPrediction != null ? `P${Math.round(xgbPrediction)}` : "--"}
          </p>
        </div>
      </div>

      {blended != null && (
        <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-base-800)] p-4 text-center border border-[var(--color-glass-border)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
            Blended Result
          </p>
          <p className="mt-1 font-mono text-3xl font-bold text-[var(--color-accent-500)]">
            P{Math.round(blended)}
          </p>
          {confidence != null && (
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Confidence: {Math.round(confidence)}%
            </p>
          )}
        </div>
      )}

      {hasDivergence && (
        <div className="mt-3 flex items-start gap-2 rounded-[var(--radius-sm)] bg-[var(--color-data-warning)]/10 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-data-warning)]" />
          <p className="text-xs text-[var(--color-data-warning)]">
            Models disagree (delta: {Math.abs(rfPrediction - xgbPrediction).toFixed(1)}
            positions). Blended result may have reduced confidence.
          </p>
        </div>
      )}
    </div>
  );
};

export default ModelOutputCard;
