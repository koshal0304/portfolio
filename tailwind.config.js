/** @type {import('tailwindcss').Config} */
const channel = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Geist', 'system-ui', 'sans-serif'],
        body: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        display: '-0.045em',
      },
      colors: {
        canvas: channel('--canvas'),
        raised: channel('--raised'),
        sunken: channel('--sunken'),
        deep: channel('--deep'),
        ink: channel('--ink'),
        // Cool text ramp tuned for the dusk canvas: 500 and lighter keep 4.5:1 on --canvas.
        slate: {
          50: '#f9fafb',
          100: '#f4f5f7',
          200: '#e6e8ed',
          300: '#d3d6de',
          400: '#bcc1cc',
          500: '#adb3bf',
          600: '#7d8394',
          700: '#5c6273',
          800: '#464b5b',
          900: '#343846',
          950: '#262a35',
        },
        // Golden hour, taken from the twin's glasses. The only accent: keep it to small surfaces.
        accent: {
          DEFAULT: '#f4b678',
          50: '#fff7ee',
          100: '#ffedd9',
          200: '#fddbb4',
          300: '#f8c690',
          400: '#f4b678',
          500: '#ec9e57',
          600: '#d9843d',
          700: '#b5672c',
          800: '#8c4f24',
          900: '#6b3d1e',
          950: '#3d2211',
        },
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
