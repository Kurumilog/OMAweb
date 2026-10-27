/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oma: {
          blue: '#005DD6',
          'blue-hover': '#004EB8',
          'blue-pressed': '#004099',
          'blue-tint': '#EDF4FF',
          surface: '#FFFFFF',
          'surface-alt': '#ECEDF0',
          bg: '#F4F4F6',
          border: '#E2E4E8',
          text: '#111111',
          'text-secondary': '#6E6E73',
          'text-tertiary': '#9A9BA1',
        }
      },
      borderRadius: {
        's': '8px',
        'm': '12px',
        'l': '16px',
        'xl': '20px',
        'pill': '999px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
