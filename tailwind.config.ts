import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0908',
        char: '#141210',
        bone: '#f5f1ea',
        ivory: '#f4efe6',
        gold: '#b08d57',
        vermilion: '#9d2f21',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        wordmark: '0.42em',
      },
    },
  },
  plugins: [],
};

export default config;
