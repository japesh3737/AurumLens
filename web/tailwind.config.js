/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: 'var(--gold)',
          deep: 'var(--gold-deep)',
          300: '#E4C46B',
          400: '#D4AF37',
          500: 'var(--gold)',
          600: 'var(--gold-deep)',
        },
        charcoal: 'var(--charcoal)',
        gunmetal: 'var(--gunmetal)',
        ivory: {
          DEFAULT: 'var(--ivory)',
          card: 'var(--ivory-card)',
        },
        silver: 'var(--silver)',
        copper: 'var(--copper)',
        platinum: 'var(--platinum)',
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--ink-muted)',
          faint: 'var(--ink-faint)',
        },
        hair: {
          DEFAULT: 'var(--hair)',
          strong: 'var(--hair-strong)',
        },
        termgreen: {
          DEFAULT: 'var(--green)',
          tint: 'var(--green-tint)',
        },
        termred: {
          DEFAULT: 'var(--red)',
          tint: 'var(--red-tint)',
        },
        // Legacy fallbacks
        bg: {
          0: 'var(--bg-0)',
          1: 'var(--bg-1)',
          2: 'var(--bg-2)',
          3: 'var(--bg-3)',
        },
        cream: {
          DEFAULT: 'var(--cream)',
          dim: 'var(--cream-dim)',
        },
        muted: 'var(--muted)',
        faint: 'var(--faint)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        gold: '0 0 20px var(--gold-glow)',
        'gold-sm': '0 0 10px var(--gold-glow)',
        card: '0 1px 3px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.07)',
      },
      borderColor: {
        term: 'var(--hair)',
        'term-strong': 'var(--hair-strong)',
      },
    },
  },
  plugins: [],
}
