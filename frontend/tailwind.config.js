/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E8002D",        // F1 Red
        background: "#0F0F0F",     // Main background
        secondary: "#1A1A1A",      // Card background
        surface: "#242424",        // Elevated surface
        accent: "#C9A84C",         // Gold accent

        textPrimary: "#F0F0F0",
        textSecondary: "#A0A0A0",

        success: "#00C853",
        danger: "#FF3D00",

        border: "#2A2A2A",
      },

      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },

      letterSpacing: {
        widePlus: "0.08em",
      },

      boxShadow: {
        subtle: "0 0 0 1px #2A2A2A",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};