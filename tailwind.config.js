/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false,
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#8a0000',
          DEFAULT: '#640000',
          dark: '#3d0000',
        },
        support: {
          DEFAULT: '#211c19',
          light: '#2e2824',
        },
        muted: {
          DEFAULT: '#858587',
          light: '#a0a0a2',
        },
        dark: {
          DEFAULT: '#211c19',
          light: '#2e2824',
        },
        gold: {
          DEFAULT: '#640000',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}