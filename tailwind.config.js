/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#060606',
          900: '#0d0d0d',
          800: '#141414',
          700: '#1c1c1c',
          600: '#242424',
          500: '#2e2e2e'
        },
        cream: {
          50:  '#fdfcf9',
          100: '#f9f5ee',
          200: '#f2ead8',
          300: '#e5d9c0',
          400: '#d4c4a0',
          500: '#c0a87a',
          600: '#a88c5a'
        }
      },
      fontFamily: {
        clash: ['Clash Grotesk', 'sans-serif']
      }
    }
  },
  plugins: []
};
