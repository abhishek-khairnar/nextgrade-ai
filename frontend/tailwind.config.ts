import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B2A4A',
          hover: '#081F37',
          dark: '#051424',
          light: '#143D69',
        },
        brand: {
          blue: '#2563EB',
          'blue-hover': '#1D4ED8',
          'blue-light': '#3B82F6',
          bg: '#EEF2FF',
          card: '#FFFFFF',
          border: '#E5E9F2',
          text: '#0F172A',
          muted: '#64748B',
        },
        risk: {
          low: '#059669',
          'low-tint': '#D1FAE5',
          'low-border': '#A7F3D0',
          med: '#D97706',
          'med-tint': '#FEF3C7',
          'med-border': '#FDE68A',
          high: '#DC2626',
          'high-tint': '#FEE2E2',
          'high-border': '#FECACA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'input': '12px',
        'button': '12px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(11, 42, 74, 0.06)',
        'soft-hover': '0 8px 30px rgba(11, 42, 74, 0.12)',
        'nav': '0 2px 12px rgba(11, 42, 74, 0.05)',
      }
    },
  },
  plugins: [],
} satisfies Config
