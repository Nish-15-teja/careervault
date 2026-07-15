/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // High-end premium dark themes use rich slates & dark blues rather than pure black
        dark: {
          950: '#080c14', // deepest backdrop
          900: '#0f172a', // panel/card backdrop
          800: '#1e293b', // borders & hover highlights
          700: '#334155', // secondary buttons & strokes
          400: '#94a3b8', // body/mute text
          50: '#f8fafc',  // white/near-white headers
        },
        brand: {
          DEFAULT: '#6366f1', // Indigo Visual Accent
          hover: '#4f46e5',
          glow: 'rgba(99, 102, 241, 0.15)',
        },
        success: {
          DEFAULT: '#10b981', // Emerald Green for success status
          hover: '#059669',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'glow-pulse': 'glowPulse 3s infinite ease-in-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
