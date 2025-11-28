import { defineConfig } from 'tailwindcss';

export default defineConfig({
  content: [
    './index.html',
    './App.tsx',
    './types.ts',
    './components/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
});

