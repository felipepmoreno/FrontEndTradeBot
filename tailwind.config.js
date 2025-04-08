/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3498db',
          DEFAULT: '#2980b9',
          dark: '#1d6fa5',
        },
        secondary: {
          light: '#f39c12',
          DEFAULT: '#e67e22',
          dark: '#d35400',
        },
      },
    },
  },
  plugins: [],
}
