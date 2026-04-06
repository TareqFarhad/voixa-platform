import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        noir: '#0A0A0D',
        charcoal: '#14151B',
        pearl: '#F3F3F1',
        champagne: '#D6B36F',
        midnight: '#1A2238',
      }
    }
  },
  plugins: []
};

export default config;
