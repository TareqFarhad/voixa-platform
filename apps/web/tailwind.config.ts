import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        noir: '#07070A',
        obsidian: '#0B0C12',
        charcoal: '#14151B',
        graphite: '#1B1C24',
        pearl: '#F5F3EE',
        champagne: '#D9BE80',
        champagneDeep: '#B89A5A',
        midnight: '#1A2238',
        twilight: '#2A355F',
        burgundy: '#5C1F2C',
        silver: '#C8C9D4',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: [
          '"Inter"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        glow: '0 20px 80px -20px rgba(217, 190, 128, 0.35)',
        deep: '0 30px 120px -40px rgba(0, 0, 0, 0.85)',
      },
      backgroundImage: {
        'noir-radial':
          'radial-gradient(circle at 20% 10%, rgba(42,53,95,0.45), rgba(7,7,10,0.0) 60%), radial-gradient(circle at 80% 0%, rgba(92,31,44,0.35), rgba(7,7,10,0.0) 55%), linear-gradient(180deg, #07070A 0%, #0B0C12 40%, #07070A 100%)',
        'champagne-glow':
          'radial-gradient(circle at center, rgba(217,190,128,0.35), rgba(217,190,128,0.05) 40%, transparent 70%)',
      },
      animation: {
        'orb-pulse': 'orbPulse 4.5s ease-in-out infinite',
        'wave-flow': 'waveFlow 8s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        orbPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        waveFlow: {
          '0%, 100%': { transform: 'translateX(0) scaleY(1)' },
          '50%': { transform: 'translateX(-4px) scaleY(0.92)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
