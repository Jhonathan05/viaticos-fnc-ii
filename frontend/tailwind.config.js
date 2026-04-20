export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['F-avenir light', 'sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        text: {
          primary: '#333333',
          inverse: '#1d252d',
        },
        surface: {
          base: '#ffffff',
          raised: '#d3163b',
          muted: '#000000',
          strong: '#eeeeee',
        },
      },
      fontSize: {
        xs: '10.56px',
        sm: '14.08px',
        md: '15px',
        lg: '15.4px',
        xl: '16px',
        '2xl': '17.6px',
        '3xl': '19.36px',
        '4xl': '21.12px',
      },
      spacing: {
        '1': '1px',
        '2': '2px',
        '3': '5px',
        '4': '6px',
        '5': '8px',
        '6': '10px',
        '7': '14px',
        '8': '15px',
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '10px',
        lg: '50px',
        xl: '160px',
        '2xl': '600px',
      },
      boxShadow: {
        '1': 'rgba(165, 174, 213, 0.15) 0px 4px 8px 0px',
        '2': 'rgba(0, 0, 0, 0.2) 2px 8px 60px -2px',
      },
      transitionDuration: {
        instant: '150ms',
        fast: '300ms',
        normal: '750ms',
        slow: '1000ms',
      },
    },
  },
  plugins: [],
}