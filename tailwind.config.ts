import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B2E2A',
        paper: '#EEF1EC',
        paperDim: '#E2E6DD',
        circleA: '#D9A62E',
        circleAsoft: '#F0D9A0',
        circleB: '#B4677A',
        circleBsoft: '#E7C4CC',
        overlap: '#A65D3E',
        teal: '#4F8577',
        line: '#C9CDC2',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '1.25rem',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(6px)' },
        },
        snap: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '60%': { transform: 'scale(1.04)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        drift: 'drift 6s ease-in-out infinite',
        snap: 'snap 0.5s cubic-bezier(.2,.8,.2,1) forwards',
      },
    },
  },
  plugins: [],
};

export default config;
