/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: '#0a0a0f',
        surface: '#111118',
        'surface-elevated': '#1a1a28',
        primary: '#00d4ff',
        secondary: '#7c3aed',
        'text-base': '#f0f0ff',
        'text-muted': '#8888aa',
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'draw-line': 'drawLine 1.5s ease-out forwards',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.35), 0 0 60px rgba(0, 212, 255, 0.1)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.5), 0 0 80px rgba(0, 212, 255, 0.2)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        drawLine: {
          '0%': { strokeDashoffset: '100%' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.glow-cyan': {
          boxShadow: '0 0 20px rgba(0,212,255,0.35), 0 0 60px rgba(0,212,255,0.1)',
        },
        '.glow-purple': {
          boxShadow: '0 0 20px rgba(124,58,237,0.35), 0 0 60px rgba(124,58,237,0.1)',
        },
        '.text-gradient': {
          background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
          color: 'transparent',
        },
      });
    }),
  ],
};
