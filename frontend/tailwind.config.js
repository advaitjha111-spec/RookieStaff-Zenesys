/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          900: '#0B0B0E',
          800: '#121215',
          700: '#1A1A1E',
        },
        gold: {
          500: '#F6C824',
        },
        slateBorder: '#26262B',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'Geist', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
