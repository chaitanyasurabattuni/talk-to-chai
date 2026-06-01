/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // "Print" palette — the portfolio half (clean, paper-like)
        paper: {
          bg: "#f7f7f5",
          ink: "#1a1a1a",
          muted: "#6b6b6b",
          line: "#e4e4e0",
        },
        // "Live" palette — the agent half (the page boots up)
        live: {
          bg: "#0a0e14",
          panel: "#111722",
          ink: "#e6edf3",
          muted: "#8b98a9",
          line: "#1e2733",
          accent: "#5eead4", // teal — "alive" signal
          accent2: "#a78bfa", // violet — eval/judge
        },
      },
      keyframes: {
        "fade-rise": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(94,234,212,0.4)" },
          "70%": { boxShadow: "0 0 0 12px rgba(94,234,212,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(94,234,212,0)" },
        },
      },
      animation: {
        "fade-rise": "fade-rise 0.6s ease-out both",
        blink: "blink 1s step-end infinite",
        "pulse-ring": "pulse-ring 2s infinite",
      },
    },
  },
  plugins: [],
};
