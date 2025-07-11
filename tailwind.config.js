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
        purple: {
          600: '#4B0082',
          700: '#3A0066',
          50: '#F3E8FF',
          100: '#E9D5FF',
        },
        orange: {
          600: '#FF5E00',
          700: '#E54E00',
          50: '#FFF7ED',
          100: '#FFEDD5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}