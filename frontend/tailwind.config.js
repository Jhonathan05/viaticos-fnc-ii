export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Berkeley Mono', 'IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      colors: {
        text: {
          primary: '#b8b2b2',
          secondary: '#f2eded',
          tertiary: '#7f7a7a',
          inverse: '#131010',
        },
        surface: {
          base: '#000000',
          strong: '#1b1818',
        },
        border: {
          DEFAULT: 'rgb(61, 56, 56)',
        },
      },
      fontSize: {
        xs: '16px',
        sm: '38px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '10px',
        '4': '12px',
        '5': '16px',
        '6': '20px',
        '7': '24px',
        '8': '32px',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
      },
      transitionDuration: {
        instant: '150ms',
      },
    },
  },
  plugins: [],
}