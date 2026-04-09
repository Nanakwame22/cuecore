/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'cc-bg': '#0F1923',
          'cc-surface': '#162030',
          'cc-surface-elevated': '#1D2A3A',
          'cc-border': '#1e2d40',
          'cc-amber': '#F59E0B',
          'cc-amber-light': '#FBBF24',
          'cc-amber-dim': '#D97706',
          'cc-green': '#00D084',
          'cc-red': '#FF4D4D',
          'cc-muted': '#5A7080',
          'cc-text': '#E8EEF4',
          'cc-text-dim': '#8FA3B3',
        },
        fontFamily: {
          'grotesk': ['Space Grotesk', 'sans-serif'],
          'mono': ['Share Tech', 'monospace'],
          'inter': ['Inter', 'sans-serif'],
        },
        animation: {
          'ticker': 'ticker 30s linear infinite',
          'pulse-slow': 'pulse 3s ease-in-out infinite',
          'fade-up': 'fadeUp 0.7s ease-out forwards',
        },
      },
    },
    plugins: [],
  }