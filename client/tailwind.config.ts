import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        amazon: {
          DEFAULT: '#131921',
          light: '#232f3e',
          yellow: '#febd69',
          orange: '#f3a847',
          blue: '#007185',
          'blue-dark': '#004f5f',
          river: '#146eb4',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
