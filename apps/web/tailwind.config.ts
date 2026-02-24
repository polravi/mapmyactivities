import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        q1: '#ef4444',
        q2: '#3b82f6',
        q3: '#eab308',
        q4: '#9ca3af',
      },
    },
  },
  plugins: [],
};

export default config;
