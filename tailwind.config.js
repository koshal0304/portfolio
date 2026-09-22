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
        primary: '#F1F5F9',
        secondary: '#94A3B8',
        'text-base': '#F1F5F9',
        'text-muted': '#94A3B8',
        accent: '#38BDF8',
        soft: {
          primary: '#F1F5F9',
          secondary: '#CBD5E1',
          muted: '#94A3B8',
          dim: '#64748B',
        },
        'soft-cyan': '#38BDF8',
        'soft-purple': '#A78BFA',
        'soft-pink': '#F472B6',
        'soft-emerald': '#34D399',
        neon: {
          blue: '#38BDF8',
          purple: '#A78BFA',
          pink: '#F472B6'
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
          boxShadow: '0 0 20px rgba(56,189,248,0.25), 0 0 60px rgba(56,189,248,0.08)',
        },
        '.glow-purple': {
          boxShadow: '0 0 20px rgba(167,139,250,0.25), 0 0 60px rgba(167,139,250,0.08)',
        },
        '.text-gradient': {
          background: 'linear-gradient(135deg, #F8FAFC 0%, #CBD5E1 50%, #94A3B8 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
          color: 'transparent',
        },
        '.text-gradient-soft': {
          background: 'linear-gradient(135deg, #F1F5F9 0%, #38BDF8 60%, #A78BFA 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
          color: 'transparent',
        },
        '.text-gradient-neon': {
          background: 'linear-gradient(135deg, #38BDF8, #A78BFA, #F472B6)',
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
