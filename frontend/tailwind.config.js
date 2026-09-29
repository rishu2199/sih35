/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // High-Precision SaaS Brand Palette — Precision Cobalt/Sapphire
        brand: {
          50:  "#f0f6fe",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#1d68f2",  // Primary brand action, crisp & vibrant
          700: "#1551c9",
          800: "#1442a1",
          900: "#13387d",
          950: "#0d2047",
        },
        // Strict surface layering for light & dark modes
        surface: {
          page: "var(--color-bg-page)",
          shell: "var(--color-bg-shell)",
          card: "var(--color-bg-card)",
          elevated: "var(--color-bg-elevated)",
        },
        // High-contrast, WCAG AA compliant statutory verification colors
        compliance: {
          pass:     "#10b981",  // emerald-500
          fail:     "#f43f5e",  // rose-500
          marginal: "#f59e0b",  // amber-500
          pending:  "#64748b",  // slate-500
        },
      },
      fontFamily: {
        sans:    ["Plus Jakarta Sans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        mono:    ["JetBrains Mono", "ui-monospace", "monospace"],
        devanagari: ["Noto Sans Devanagari", "sans-serif"],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight:   "-0.02em",
        normal:  "0em",
        wide:    "0.025em",
        wider:   "0.05em",
        widest:  "0.1em",
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 6px 16px -2px rgba(0, 0, 0, 0.1), 0 2px 6px -2px rgba(0, 0, 0, 0.06)',
        'dropdown': '0 12px 30px -4px rgba(0, 0, 0, 0.22), 0 4px 10px -3px rgba(0, 0, 0, 0.12)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        'glow-brand': '0 0 20px -2px rgba(29, 104, 242, 0.35)',
        'glow-emerald': '0 0 20px -2px rgba(16, 185, 129, 0.35)',
        'glow-rose': '0 0 20px -2px rgba(244, 63, 94, 0.35)',
      },
    },
  },
  plugins: [],
}
