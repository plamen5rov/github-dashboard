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
        github: {
          dark: '#0d1117',
          darker: '#010409',
          border: '#30363d',
          text: '#c9d1d9',
          muted: '#8b949e',
          accent: '#58a6ff',
          green: '#238636',
          purple: '#8957e5',
        },
        light: {
          bg: '#ffffff',
          surface: '#f6f8fa',
          border: '#d0d7de',
          text: '#1f2328',
          muted: '#656d76',
        },
      },
    },
  },
  plugins: [],
}
