/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Foundation Surfaces & Borders (Light-First Default)
        foundation: {
          bg: "#F6F8FB",
          surface: "#FFFFFF",
          secondary: "#F9FAFC",
          border: "#E4E8EF",
          strongBorder: "#CBD2DC",
          primaryText: "#172033",
          secondaryText: "#596579",
          mutedText: "#8A94A6",
        },
        // Brand Palette (Deep Navy / Blue)
        brand: {
          50:  "#eff6ff",
          100: "#DBEAFE",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3B82F6",
          600: "#2563EB",  // Primary Brand Blue
          700: "#1D4ED8",
          800: "#1e40af",
          900: "#172554",  // Deep Navy Structural
          950: "#0f172a",
        },
        // Semantic Statutory Compliance Colors (Non-Decorative)
        compliance: {
          pass: {
            DEFAULT: "#059669",
            bg: "#ECFDF5",
            border: "#A7F3D0",
            text: "#047857",
          },
          warning: {
            DEFAULT: "#D97706",
            bg: "#FFFBEB",
            border: "#FDE68A",
            text: "#B45309",
          },
          fail: {
            DEFAULT: "#DC2626",
            bg: "#FEF2F2",
            border: "#FECACA",
            text: "#B91C1C",
          },
          pending: {
            DEFAULT: "#6366F1",
            bg: "#EEF2FF",
            border: "#C7D2FE",
            text: "#4F46E5",
          },
          locked: {
            DEFAULT: "#475569",
            bg: "#F1F5F9",
            border: "#E2E8F0",
            text: "#334155",
          },
        },
        // Digital Authority & Cryptographic Sealing Color
        authority: {
          DEFAULT: "#7C3AED",
          50:  "#f5f3ff",
          100: "#ede9fe",
          600: "#7c3aed",
          700: "#6d28d9",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["IBM Plex Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)",
        dropdown: "0 4px 20px -2px rgba(17, 24, 39, 0.08), 0 2px 6px -2px rgba(17, 24, 39, 0.04)",
        modal: "0 20px 40px -8px rgba(15, 23, 42, 0.16)",
      },
    },
  },
  plugins: [],
};
