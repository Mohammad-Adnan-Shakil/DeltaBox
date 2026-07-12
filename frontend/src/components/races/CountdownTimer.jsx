import { useState, useEffect } from "react";

export const CountdownTimer = ({ targetDate }) => {
  const calcRemaining = () => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: false,
    };
  };

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    const timer = setInterval(() => setRemaining(calcRemaining()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (remaining.expired) {
    return (
      <span className="font-mono text-sm font-bold text-[var(--color-data-success)]">
        Race Complete
      </span>
    );
  }

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-3">
      <div className="text-center">
        <p className="font-mono text-2xl font-bold text-[var(--color-text-primary)]">
          {remaining.days}
        </p>
        <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
          days
        </p>
      </div>
      <span className="font-mono text-2xl font-bold text-[var(--color-text-tertiary)]">:</span>
      <div className="text-center">
        <p className="font-mono text-2xl font-bold text-[var(--color-text-primary)]">
          {pad(remaining.hours)}
        </p>
        <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
          hrs
        </p>
      </div>
      <span className="font-mono text-2xl font-bold text-[var(--color-text-tertiary)]">:</span>
      <div className="text-center">
        <p className="font-mono text-2xl font-bold text-[var(--color-text-primary)]">
          {pad(remaining.minutes)}
        </p>
        <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
          min
        </p>
      </div>
      <span className="font-mono text-2xl font-bold text-[var(--color-text-tertiary)]">:</span>
      <div className="text-center">
        <p className="font-mono text-2xl font-bold text-[var(--color-text-accent)]">
          {pad(remaining.seconds)}
        </p>
        <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
          sec
        </p>
      </div>
    </div>
  );
};

export default CountdownTimer;
