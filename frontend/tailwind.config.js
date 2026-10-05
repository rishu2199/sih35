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
        // Trust & Authority Design System — Deep Navy/Sapphire Government Palette
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#1d4ed8",  // authority blue
          700: "#1e40af",
          800: "#1e3a8a",  // deep navy — primary
          900: "#1e3266",
          950: "#172554",
        },
        // Deep Navy — primary authority color
        navy: {
          50:  "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d6fe",
          300: "#a5b8fb",
          400: "#7a91f5",
          500: "#5060e8",
          600: "#3b44d4",
          700: "#3133b9",
          800: "#1E3A8A",  // Primary Navy per design system
          900: "#1a2d6e",
          950: "#131e4e",
        },
        // Amber/Gold — authority accent (CTA, highlights)
        gold: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#B45309",  // Authority gold per design system
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        // Strict surface layering for light & dark modes
        surface: {
          page:     "var(--color-bg-page)",
          shell:    "var(--color-bg-shell)",
          card:     "var(--color-bg-card)",
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
        sans:       ["Lato", "Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display:    ["Plus Jakarta Sans", "Lato", "sans-serif"],
        mono:       ["JetBrains Mono", "ui-monospace", "monospace"],
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
        'subtle':       '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card':         '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover':   '0 6px 24px -4px rgba(30, 58, 138, 0.15), 0 2px 8px -2px rgba(0, 0, 0, 0.06)',
        'dropdown':     '0 12px 30px -4px rgba(0, 0, 0, 0.22), 0 4px 10px -3px rgba(0, 0, 0, 0.12)',
        'modal':        '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        'glow-navy':    '0 0 20px -2px rgba(30, 58, 138, 0.4)',
        'glow-gold':    '0 0 20px -2px rgba(180, 83, 9, 0.3)',
        'glow-emerald': '0 0 20px -2px rgba(16, 185, 129, 0.35)',
        'glow-rose':    '0 0 20px -2px rgba(244, 63, 94, 0.35)',
        'authority':    '0 4px 16px -2px rgba(30, 58, 138, 0.2), 0 1px 4px rgba(0,0,0,0.06)',
        'authority-xl': '0 12px 40px -8px rgba(30, 58, 138, 0.3), 0 4px 12px rgba(0,0,0,0.1)',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'badge-in':   'badgeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
        badgeIn:   { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
