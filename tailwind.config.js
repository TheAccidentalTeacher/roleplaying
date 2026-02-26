/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        dark: {
          50: '#f8fafc',
          100: '#cbd5e1',
          200: '#94a3b8',
          300: '#94a3b8',
          400: '#64748b',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
          800: '#0f172a',
          900: '#020617',
        }
      },
      fontFamily: {
        cinzel: ['var(--font-cinzel)', 'serif'],
        merriweather: ['var(--font-merriweather)', 'serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        fantasy: ['var(--font-cinzel)', 'serif'],
        body: ['var(--font-merriweather)', 'serif'],
      },
      animation: {
        'spin-slow': 'spin 4s linear infinite',
        'loading-bar': 'loadingBar 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        loadingBar: {
          '0%': { width: '0%', marginLeft: '0%' },
          '50%': { width: '60%', marginLeft: '20%' },
          '100%': { width: '0%', marginLeft: '100%' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(14, 165, 233, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
