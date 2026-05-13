/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#E24B4A',
        'brand-dark': '#c43e3d',
      },
    },
  },
  plugins: [],
}
