import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        amazon: {
          DEFAULT: '#312e81',
          light: '#4338ca',
          yellow: '#fbbf24',
          orange: '#f59e0b',
          blue: '#4f46e5',
          'blue-dark': '#3730a3',
          river: '#6366f1',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
