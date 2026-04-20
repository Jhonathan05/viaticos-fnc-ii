export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#d3163b',
          light: '#e8435f',
          dark: '#b01230',
        },
        secondary: '#1d252d',
        text: '#334155',
        'text-light': '#64748b',
      },
    },
  },
  plugins: [],
}