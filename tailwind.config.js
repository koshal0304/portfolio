/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Archivo', 'sans-serif'],
        body: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: '#050505',
        surface: '#0A0A0A',
        'surface-elevated': '#121212',
        primary: '#ffffff',
        secondary: '#a3a3a3',
        'text-base': '#FAFAFA',
        'text-muted': '#737373',
        accent: '#2563EB',
        neon: {
          blue: '#00d4ff',
          purple: '#7c3aed',
          pink: '#ff2a8f'
        }
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'draw-line': 'drawLine 1.5s ease-out forwards',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'text-reveal': 'text-reveal 1.5s cubic-bezier(0.77, 0, 0.175, 1) forwards',
        'blob': 'blob-spin 20s infinite linear',
        'glitch': 'glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.1), 0 0 60px rgba(0, 212, 255, 0.05)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.3), 0 0 80px rgba(0, 212, 255, 0.1)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        drawLine: {
          '0%': { strokeDashoffset: '100%' },
          '100%': { strokeDashoffset: '0' },
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'text-reveal': {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        },
        'blob-spin': {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg) scale(1)' },
          '33%': { transform: 'translate(-50%, -50%) rotate(120deg) scale(1.1)' },
          '66%': { transform: 'translate(-50%, -50%) rotate(240deg) scale(0.9)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg) scale(1)' }
        },
        'glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' }
        }
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
          background: 'linear-gradient(135deg, #fff 0%, #a3a3a3 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
          color: 'transparent',
        },
        '.text-gradient-neon': {
          background: 'linear-gradient(135deg, #00d4ff, #7c3aed, #ff2a8f)',
          'background-size': '200% auto',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
          color: 'transparent',
          animation: 'gradient-xy 5s ease infinite',
        },
      });
    }),
  ],
};
