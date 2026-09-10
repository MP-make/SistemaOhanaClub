/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ohana: {
          blue: '#1B3BB6',
          'blue-dark': '#132A85',
          'blue-light': '#2563EB',
          'blue-surface': '#EEF2FF',
          orange: '#FF6A00',
          'orange-dark': '#EA580C',
          'orange-surface': '#FFF7ED',
          lime: '#C8FF00',
          'lime-hover': '#B6EA00',
          green: '#16A34A',
          'green-surface': '#DCFCE7',
          red: '#DC2626',
          'red-surface': '#FEE2E2',
          yellow: '#EAB308',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 10px 25px -5px rgba(27, 59, 182, 0.08), 0 8px 10px -6px rgba(27, 59, 182, 0.04)',
        'floating': '0 20px 30px -10px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
