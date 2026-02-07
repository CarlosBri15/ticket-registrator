/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#336b87',
          hover: '#28556b',
          light: '#4a8cae',
        },
        secondary: {
          DEFAULT: '#90afc5',
          light: '#e0e9ef',
        },
        dark: '#2a3132',
        accent: {
          DEFAULT: '#763626',
          hover: '#5e2b1e',
        },
        surface: '#f8fafc',
      },
    },
  },
  plugins: [],
}