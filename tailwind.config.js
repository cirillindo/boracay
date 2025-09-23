/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#74bfab',
          50: '#f0f7f5',
          100: '#d9ebe8',
          200: '#b4d7d0',
          300: '#8ec3b8',
          400: '#74bfab',
          500: '#5aa893',
          600: '#458576',
          700: '#366a5e',
          800: '#2b544b',
          900: '#22433c',
        }
      },
      fontFamily: {
        'playfair': ['"Playfair Display"', 'serif'],
        'licorice': ['Licorice', 'cursive']
      },
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
        '4000': '4000ms',
        '5000': '5000ms',
        '6000': '6000ms',
        '8000': '8000ms',
        '10000': '10000ms',
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
};