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
        navy: {
          50: '#f0f4f9',
          100: '#dce5f2',
          200: '#bcd0e6',
          300: '#90b4d6',
          400: '#5e93c1',
          500: '#3d77ac',
          600: '#2d5f8f',
          700: '#244c74',
          800: '#1b3753',
          900: '#0f1f33',
          950: '#091321',
        },
        indigo: {
          950: '#0d1127',
          900: '#151c3f',
          800: '#232b60',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
