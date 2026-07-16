import { useEffect, useRef } from "react";

const MODEL_STATS = {
  rSquared: 0.66,
  mae: 2.19,
  samples: 1951,
};

const TelemetryCanvas = ({ className = "" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    let animationId = null;
    let time = 0;

    const drawStatic = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const amp = h * 0.3;
      const freq = 1.5;
      const offset = h * 0.55;

      ctx.beginPath();
      ctx.moveTo(0, offset + Math.sin(0 * freq) * amp);
      for (let x = 0; x < w; x += 2) {
        const y = offset + Math.sin(x * 0.008 * freq + 1.2) * amp * 0.6
          + Math.sin(x * 0.02 * freq + 0.5) * amp * 0.25
          + Math.sin(x * 0.003 * freq + 2.8) * amp * 0.3;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(227, 30, 30, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, offset + Math.sin(0 * freq + 3) * amp * 0.7);
      for (let x = 0; x < w; x += 2) {
        const y = offset + Math.sin(x * 0.006 * freq + 3.7) * amp * 0.5
          + Math.sin(x * 0.015 * freq + 1.1) * amp * 0.2
          + Math.sin(x * 0.004 * freq + 4.2) * amp * 0.25;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(59, 130, 246, 0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();

      for (let i = 0; i < 40; i++) {
        const x = Math.sin(i * 137.5) * 0.5 + 0.5;
        const y = Math.cos(i * 97.3) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(x * w, y * h, 1, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        ctx.fill();
      }
    };

    if (prefersReduced) {
      drawStatic();
      return () => window.removeEventListener("resize", resize);
    }

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0008,
      vy: (Math.random() - 0.5) * 0.0004,
      r: Math.random() * 1.5 + 0.5,
      o: Math.random() * 0.06 + 0.02,
    }));

    const lines = [
      { phase: 1.2, freq: 0.008, amp: 0.6, subFreq: 0.02, subAmp: 0.25, subFreq2: 0.003, subAmp2: 0.3, color: "rgba(227, 30, 30, 0.15)", width: 1.5 },
      { phase: 3.7, freq: 0.006, amp: 0.5, subFreq: 0.015, subAmp: 0.2, subFreq2: 0.004, subAmp2: 0.25, color: "rgba(59, 130, 246, 0.1)", width: 1 },
    ];

    const animate = (timestamp) => {
      time = timestamp * 0.00005;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const amp = h * 0.3;
      const offset = h * 0.55;

      for (const line of lines) {
        ctx.beginPath();
        ctx.moveTo(0, offset + Math.sin((0 * line.freq + 0 * line.subFreq + time * 0.3) * 0) * amp * line.amp);
        for (let x = 0; x < w; x += 2) {
          const y = offset
            + Math.sin(x * line.freq + time + line.phase) * amp * line.amp
            + Math.sin(x * line.subFreq + time * 0.5 + line.phase * 1.5) * amp * line.subAmp
            + Math.sin(x * line.subFreq2 + time * 0.2 + line.phase * 2) * amp * line.subAmp2;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.width;
        ctx.stroke();
      }

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) { p.vx *= -1; p.x = Math.max(0, Math.min(1, p.x)); }
        if (p.y < 0 || p.y > 1) { p.vy *= -1; p.y = Math.max(0, Math.min(1, p.y)); }
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.o})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};

export { MODEL_STATS };
export default TelemetryCanvas;
